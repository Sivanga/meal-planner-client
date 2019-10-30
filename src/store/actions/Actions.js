import {
  FETCH_DISHES,
  ADD_DISH,
  PRIVATE_DISHES_DATA_RECEIVED,
  PUBLIC_DISHES_DATA_RECEIVED,
  FETCH_PUBLIC_DISHES
} from "../constants/Action-types";
import {
  databaseRef,
  dishesDbRef,
  storageRef,
  publicDishesDbRef
} from "../../firebase";
export * from "./Meals";

/**
 * Add dish to backend. Update list will be invoked by fetchDishes observer
 */
export const addDish = (payload, uid) => async dispatch => {
  // Add the dish locally
  dispatch({ type: ADD_DISH, payload: payload.dish });

  // Add to backend if there's authenticated user
  if (!uid) {
    noAuthError("addDish");
    return;
  }

  // Dishes without images can be push in db as is
  if (!payload.dish.imageFile) {
    return pushToDb(payload.dish, uid);
  }

  // First upload dish image to storage
  // Then update the image url of the dish and push to db
  const storageRefChild = storageRef(uid).child(
    "images/" + payload.dish.imageFile.name
  );
  storageRefChild.put(payload.dish.imageFile).then(function(snapshot) {
    storageRefChild.getDownloadURL().then(url => {
      payload.dish.imageUrl = url;
      pushToDb(payload.dish, uid);
    });
  });
};

const pushToDb = (dish, uid) => {
  // Get a ref for a new dish
  var newDishKey = dishesDbRef(uid).push().key;
  var updates = {};

  // Push the dish under current user
  updates["/dishes/" + uid + "/" + newDishKey] = { dish: dish };

  // If dish is public, push to public dishes table
  if (dish.sharePublic) {
    dish.ownerUid = uid;
    dish.favoriteUsers = [uid];
    updates["/publicDishes/" + newDishKey] = { dish: dish };
  }

  databaseRef.update(updates);
};

/**
 * Remove dish from backend. Update list will be invoked by fetchDishes observer
 */
export const removeDish = (payload, uid) => async dispatch => {
  // Remove the dish under current user
  dishesDbRef(uid)
    .child(payload)
    .remove();

  var ref = publicDishesDbRef();

  return ref
    .child(`${payload}/dish`)
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
        ref.child(`${payload}/dish/`).update({ favoriteUsers: favoriteUsers });
      }
    });
};

/**
 * Fetch list of dishes and observe for changes.
 * Dispatch action FETCH_DISHES on chahnge.
 */
export const fetchDishes = uid => async dispatch => {
  if (!uid) {
    noAuthError("addDish");
    return;
  }
  dishesDbRef(uid).on("value", snapshot => {
    dispatch({ type: PRIVATE_DISHES_DATA_RECEIVED, payload: true });
    dispatch({ type: FETCH_DISHES, payload: snapshot.val() || {} });
  });
};

/**
 * Fetch all public dishes
 * @param {current user id} uid
 */
export const fetchPublicDishes = uid => async dispatch => {
  var ref = publicDishesDbRef();
  ref.orderByChild("dish/ownerUid").on("value", snapshot => {
    var payload = {
      publicDishes: snapshot.val() || {},
      uid: uid
    };
    dispatch({ type: FETCH_PUBLIC_DISHES, payload: payload });
    dispatch({ type: PUBLIC_DISHES_DATA_RECEIVED, payload: true });
  });
};

export const addToFavorites = (dish, uid) => async dispatch => {
  // Set the dish under current user
  dishesDbRef(uid)
    .child("/" + dish._id)
    .set({
      dish: dish
    });

  // Mark this user as a favorite under this public dish
  var ref = publicDishesDbRef();
  return ref
    .child(`${dish._id}/dish`)
    .once("value")
    .then(function(snapshot) {
      var dishToUpdate = (snapshot.val() && snapshot.val()) || {};
      var favoriteUsers = dishToUpdate.favoriteUsers;
      favoriteUsers.push(uid);
      ref.child(`${dish._id}/dish/`).update({ favoriteUsers: favoriteUsers });
    });
};

const noAuthError = methodName => {
  console.error(
    methodName + " No auth found. User should login for this action"
  );
};
