import {
  FETCH_DISHES,
  CLEAR_PRIVATE_DISHES,
  ADD_DISH,
  UPDATE_DISH,
  REMOVE_DISH,
  ADD_DISH_TO_FAVORITE,
  REMOVE_DISH_FROM_FAVORITE,
  PRIVATE_DISHES_DATA_RECEIVED,
  SEARCH_FAVORITE_DATA_RECEIVED,
  CLEAR_SEARCH_PRIVATE_DISHES,
  SEARCH_FAVORITE_DATA,
  SEARCH_PUBLIC_DISHES,
  CLEAR_SEARCH_PUBLIC_DISHES,
  SEARCH_PUBLIC_DATA_RECEIVED,
  PUBLIC_DISHES_DATA_RECEIVED,
  FETCH_PUBLIC_DISHES,
  CLEAR_PUBLIC_DISHES,
  SEARCH_ALL_DISHES,
  SEARCH_ALL_DISHES_RECEIVED,
  CLEAR_SEARCH_ALL_DISHES
} from "../constants/Action-types";
import {
  databaseRef,
  dishesDbRef,
  storageRef,
  publicDishesDbRef
} from "../../firebase";
import * as firebase from "firebase/app";

export const END_PAGINATION = "END_PAGINATION";
export const PAGINATION_SIZE = 20;

/**
 * Add dish to backend. Update list will be invoked by fetchDishes observer
 */
export const addDish = (payload, uid) => async dispatch => {
  // Add to backend if there's authenticated user
  if (!uid) {
    noAuthError("addDish");
    return;
  }

  // Dishes without images can be push in db as is
  if (!payload.imageFile) {
    return pushToDb(payload, uid, dispatch);
  }

  // First upload dish image to storage
  // Then update the image url of the dish and set to db
  const storageRefChild = storageRef(uid).child(
    "images/" + payload.imageFile.name
  );
  storageRefChild.put(payload.imageFile).then(function(snapshot) {
    storageRefChild.getDownloadURL().then(url => {
      payload.imageUrl = url;
      pushToDb(payload, uid, dispatch);
    });
  });
};

const pushToDb = (dish, uid, dispatch) => {
  dish.ownerUid = uid;

  // Get a ref for a new dish
  var newDishKey = dishesDbRef(uid).push().key;
  var updates = {};

  // Push the dish under current user
  dish.id = newDishKey;
  updates["/dishes/" + uid + "/" + newDishKey] = dish;

  // If dish is public, push to public dishes table
  if (dish.sharePublic) {
    dish.favoriteUsers = [uid];
    updates["/publicDishes/" + newDishKey] = dish;
  }

  databaseRef.update(updates);

  // Add the dish locally
  dispatch({
    type: ADD_DISH,
    payload: dish
  });
};

/**
 * Update dish
 */
export const updateDish = (payload, uid) => async dispatch => {
  // Update the dish locally
  dispatch({
    type: UPDATE_DISH,
    payload: payload
  });

  // Dishes without images can be push in db as is
  if (!payload.imageFile) {
    return setToDb(payload, uid);
  }

  // First upload dish image to storage
  // Then update the image url of the dish and set to db
  const storageRefChild = storageRef(uid).child(
    "images/" + payload.imageFile.name
  );
  storageRefChild.put(payload.imageFile).then(function(snapshot) {
    storageRefChild.getDownloadURL().then(url => {
      payload.imageUrl = url;
      setToDb(payload, uid);
    });
  });
};

const setToDb = (dish, uid) => {
  dishesDbRef(uid)
    .child(dish.id)
    .set(dish);

  // If dish is public, set to public dishes table
  if (dish.sharePublic) {
    publicDishesDbRef()
      .child(dish.id)
      .set(dish);
  }
};

/**
 * Remove dish from backend. Update list will be invoked by fetchDishes observer
 */
export const removeDish = (payload, uid) => async dispatch => {
  // Remove the dish locally
  dispatch({ type: REMOVE_DISH, payload: payload });

  // Remove the dish under current user
  dishesDbRef(uid)
    .child(payload)
    .remove();

  var ref = publicDishesDbRef();
  return ref
    .child(`${payload}`)
    .once("value")
    .then(function(snapshot) {
      var dishToUpdate = (snapshot.val() && snapshot.val()) || {};

      // If this user is the owner of the dish, remove it from public
      if (dishToUpdate.ownerUid === uid) {
        ref.child(payload).remove();
      }
      // Else remove the user from favoriteUsers array
      else {
        var favoriteUsers = dishToUpdate.favoriteUsers;
        if (!favoriteUsers) return;
        favoriteUsers = favoriteUsers.filter(function(id) {
          return id !== uid;
        });
        ref.child(`${payload}/`).update({ favoriteUsers: favoriteUsers });

        // This is usuful to update search result as elasticsearch doesn't refresh frequently
        dispatch({
          type: REMOVE_DISH_FROM_FAVORITE,
          payload: { dishId: payload, favoriteUsers }
        });
      }
    });
};

/**
 * Fetch list of dishes and observe for changes.
 * Dispatch action FETCH_DISHES on chahnge.
 * prevNextPage
  - holds the key of the last result, this will be used for the next page.
 * Empty "prevNextPage
 " indicates the first fetch
 */
export const fetchDishes = (uid, prevNextPage) => async dispatch => {
  if (!uid) {
    noAuthError("addDish");
    return;
  }

  // If prevNextPage is empty, the first page is being requested
  // Clear previous results
  if (!prevNextPage) {
    dispatch({
      type: CLEAR_PRIVATE_DISHES
    });
  }

  var ref = dishesDbRef(uid).orderByKey();
  if (prevNextPage) ref = ref.endAt(prevNextPage);

  // Fetch data once
  ref.limitToLast(PAGINATION_SIZE).once("value", snapshot => {
    var nextKey = getNextKey(snapshot);
    var dishes = getArrayFromSnapshot(snapshot, nextKey);

    dispatch({
      type: PRIVATE_DISHES_DATA_RECEIVED,
      payload: {
        received: true,
        next: nextKey
      }
    });
    dispatch({
      type: FETCH_DISHES,
      payload: dishes
    });
  });
};

export const getNextKey = snapshot => {
  // Get the next key, this will be used to fetch the next page.
  // We get the First key and not last because firebase only retrieve data in asc order,
  // we will reverse the data in client side
  var nextKey = END_PAGINATION;

  // if we got a full page it means there are more docs to fetch for next page
  if (snapshot.numChildren() === PAGINATION_SIZE) {
    nextKey = Object.keys(snapshot.val())[0];
  }
  return nextKey;
};

export const getArrayFromSnapshot = (snapshot, nextKey) => {
  // Give each item it's backend generated id for future reference
  var items = [];
  snapshot.forEach(item => {
    var itemVal = item.val();
    itemVal.id = item.key;
    items.unshift(itemVal);
  });

  // If there are more documents for next page, remove the last item,
  // We only use it's key for fetching the next page and we won't show it
  if (nextKey !== END_PAGINATION) items.pop();
  return items;
};

export const searchPrivateDishes = (uid, query) => async dispatch => {
  const search = firebase.functions().httpsCallable("searchPrivateDishes");
  search({ query: query, uid: uid })
    .then(result => {
      dispatch({
        type: SEARCH_FAVORITE_DATA,
        payload: result.data
      });
    })
    .catch(err => {
      dispatch({
        type: SEARCH_FAVORITE_DATA,
        payload: []
      });
    })
    .finally(() => {
      dispatch({
        type: SEARCH_FAVORITE_DATA_RECEIVED,
        payload: true
      });
    });
};

export const clearSearchPrivateDishes = () => async dispatch => {
  dispatch({ type: CLEAR_SEARCH_PRIVATE_DISHES });
};

export const searchPublicDishes = (uid, query) => async dispatch => {
  const search = firebase.functions().httpsCallable("searchPublicDishes");
  search({ query: query, uid: uid })
    .then(result => {
      dispatch({
        type: SEARCH_PUBLIC_DISHES,
        payload: result.data
      });
    })
    .catch(err => {
      dispatch({
        type: SEARCH_PUBLIC_DISHES,
        payload: []
      });
    })
    .finally(() => {
      dispatch({
        type: SEARCH_PUBLIC_DATA_RECEIVED,
        payload: true
      });
    });
};

export const clearSearchPublicDishes = () => async dispatch => {
  dispatch({
    type: CLEAR_SEARCH_PUBLIC_DISHES
  });
};

export const searchAllDishes = (uid, query) => async dispatch => {
  const search = firebase.functions().httpsCallable("searchAllDishes");
  search({ query: query, uid: uid })
    .then(result => {
      dispatch({
        type: SEARCH_ALL_DISHES,
        payload: result.data
      });
    })
    .catch(err => {
      dispatch({
        type: SEARCH_ALL_DISHES,
        payload: []
      });
    })
    .finally(() => {
      dispatch({
        type: SEARCH_ALL_DISHES_RECEIVED,
        payload: true
      });
    });
};

export const clearSearchAllDishes = () => async dispatch => {
  dispatch({ type: CLEAR_SEARCH_ALL_DISHES });
};

export const cleanUpFetchPublicDishesListener = () => async dispatch => {
  publicDishesDbRef().off();
};

/**
 * Fetch all public dishes
 * @param {current user id} uid
 */
export const fetchPublicDishes = (uid, prevNextPage) => async dispatch => {
  // If prevNextPage is empty, the first page is being requested
  // Clear previous results
  if (!prevNextPage) {
    dispatch({
      type: CLEAR_PUBLIC_DISHES
    });
  }
  var ref = publicDishesDbRef().orderByKey();
  if (prevNextPage) ref = ref.endAt(prevNextPage);
  ref.limitToLast(PAGINATION_SIZE).once("value", snapshot => {
    var nextKey = getNextKey(snapshot);
    var dishes = getArrayFromSnapshot(snapshot, nextKey);

    // Return only public dishes that aren't the current user's
    dishes = dishes.filter(dish => dish.ownerUid !== uid);

    dispatch({
      type: FETCH_PUBLIC_DISHES,
      payload: dishes
    });
    dispatch({
      type: PUBLIC_DISHES_DATA_RECEIVED,
      payload: {
        received: true,
        next: nextKey
      }
    });
  });
};

export const addToFavorites = (dish, uid) => async dispatch => {
  // Set the dish under current user
  dishesDbRef(uid)
    .child("/" + dish.id)
    .set(dish);

  // Mark this user as a favorite under this public dish
  var ref = publicDishesDbRef();
  return ref
    .child(`${dish.id}`)
    .once("value")
    .then(function(snapshot) {
      var dishToUpdate = (snapshot.val() && snapshot.val()) || {};
      var favoriteUsers = dishToUpdate.favoriteUsers;
      favoriteUsers.push(uid);
      ref.child(`${dish.id}`).update({ favoriteUsers: favoriteUsers });

      // This is usuful to update search result as elasticsearch doesn't refresh frequently
      dispatch({
        type: ADD_DISH_TO_FAVORITE,
        payload: { dishId: dish.id, favoriteUsers }
      });
    });
};

const noAuthError = methodName => {
  console.error(
    methodName + " No auth found. User should login for this action"
  );
};