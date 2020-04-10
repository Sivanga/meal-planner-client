import {
  FETCH_PRIVATE_MENUS,
  FETCH_PUBLIC_MENUS,
  ADD_MENU_TO_FAVORITE,
  REMOVE_MENU_FROM_FAVORITE,
  PRIVATE_MENUS_DATA_RECIEVED,
  PUBLIC_MENUS_DATA_RECIEVED,
  SET_MENU,
  SET_MENU_LOCALLY,
  RESET_MENU,
  FETCH_MENU,
  REMOVE_MENU,
  SEARCH_FAVORITE_MENUS,
  SEARCH_FAVORITE_MENUS_RECEIVED,
  SEARCH_PUBLIC_MENUS_RECEIVED,
  SEARCH_PUBLIC_MENUS,
  CLEAR_SEARCH_MENUS,
  SEEN_TOUR
} from "../constants/Action-types";
import { PAGINATION_SIZE, getNextKey, getArrayFromSnapshot } from "./Actions";
import {
  menusDbRef,
  publicMenusDbRef,
  databaseRef,
  userDbRef
} from "../../firebase";
import * as firebase from "firebase/app";

/**
Set menu state in store
 */
export const setMenuInStore = menuData => async dispatch => {
  console.log("setMenuInStore. menuData: ", menuData);
  dispatch({
    type: SET_MENU_LOCALLY,
    payload: menuData
  });
};

/**
 * Set menu to backend
 */
export const setMenu = (payload, uid) => async dispatch => {
  // Get a ref for a new menu
  var newMenuKey = menusDbRef(uid).push().key;
  payload.id = newMenuKey;

  // Add the menu locally
  dispatch({
    type: SET_MENU,
    payload: payload
  });

  var updates = {};

  // Push the menu under current user
  updates["/menus/" + uid + "/" + newMenuKey] = payload;

  // If menu is public, push to public menus table
  if (payload.sharePublic) {
    payload.ownerUid = uid;
    payload.favoriteUsers = [uid];
    updates["/publicMenus/" + newMenuKey] = payload;
  }

  databaseRef.update(updates);
};

export const resetMenuState = () => async dispatch => {
  // Reset the menu locally
  dispatch({
    type: RESET_MENU
  });
};

export const makeMenuPublic = (payload, uid) => async dispatch => {
  menusDbRef(uid)
    .child(payload)
    .update({ sharePublic: true });
};

/**
 * Remove menu.
 */
export const removeMenu = (payload, uid) => async dispatch => {
  // Remove the menu locally
  dispatch({
    type: REMOVE_MENU,
    payload: payload
  });

  // Remove the menu under current user
  menusDbRef(uid)
    .child(payload)
    .remove();

  var ref = publicMenusDbRef();
  return ref
    .child(`${payload}`)
    .once("value")
    .then(function(snapshot) {
      var menuToUpdate = (snapshot.val() && snapshot.val()) || {};

      // If this user is the owner of the dish, remove it from public
      if (menuToUpdate.ownerUid === uid) {
        ref.child(payload).remove();
      }
      // Else remove the user from favoriteUsers array
      else {
        var favoriteUsers = menuToUpdate.favoriteUsers;
        if (!favoriteUsers) return;
        favoriteUsers = favoriteUsers.filter(function(id) {
          return id !== uid;
        });
        ref.child(`${payload}/`).update({
          favoriteUsers: favoriteUsers
        });

        // This is usuful to update search result as elasticsearch doesn't refresh frequently
        dispatch({
          type: REMOVE_MENU_FROM_FAVORITE,
          payload: { menuId: payload, favoriteUsers }
        });
      }
    });
};

/**
 * Fetch private menus
 */
export const fetchMenus = (uid, prevNextPage) => async dispatch => {
  var ref = menusDbRef(uid).orderByKey();
  if (prevNextPage) ref = ref.endAt(prevNextPage);
  ref.limitToLast(PAGINATION_SIZE).once("value", snapshot => {
    var nextKey = getNextKey(snapshot);
    var menus = getArrayFromSnapshot(snapshot, nextKey);

    dispatch({
      type: PRIVATE_MENUS_DATA_RECIEVED,
      payload: {
        received: true,
        next: nextKey
      }
    });
    dispatch({
      type: FETCH_PRIVATE_MENUS,
      payload: menus
    });
  });
};

/** Fetch a specific menu */
export const fetchMenu = (menuId, uid, type) => async dispatch => {
  var ref;

  // Fetch public menu
  if (type === "public") {
    ref = publicMenusDbRef().child(menuId);
  }

  // Fetch private menu
  else {
    ref = menusDbRef(uid).child(menuId);
  }

  ref.once("value", snapshot => {
    dispatch({
      type: FETCH_MENU,
      payload: snapshot.val()
    });
  });
};

export const cleanUpFetchMenusListener = uid => async dispatch => {
  menusDbRef(uid).off();
};

/**
 * Fetch all public menus
 * @param {current user id} uid
 */
export const fetchPublicMenus = (uid, prevNextPage) => async dispatch => {
  var ref = publicMenusDbRef().orderByKey();
  if (prevNextPage) ref = ref.endAt(prevNextPage);
  ref.limitToLast(PAGINATION_SIZE).once("value", snapshot => {
    var nextKey = getNextKey(snapshot);
    var menus = getArrayFromSnapshot(snapshot, nextKey);

    // Return only public menus that aren't the current user's
    menus = menus.filter(menu => menu.ownerUid !== uid);

    dispatch({
      type: FETCH_PUBLIC_MENUS,
      payload: menus
    });
    dispatch({
      type: PUBLIC_MENUS_DATA_RECIEVED,
      payload: {
        received: true,
        next: nextKey
      }
    });
  });
};

/** Clean up listener for public menus */
export const cleanupListenerPublicMenus = uid => async => {
  publicMenusDbRef().off();
};

export const addMenuToFavorites = (menu, uid) => async dispatch => {
  // Set the menu under current user
  menusDbRef(uid)
    .child("/" + menu.id)
    .set(menu);

  // Mark this user as a favorite under this public menu
  var ref = publicMenusDbRef();
  return ref
    .child(`${menu.id}`)
    .once("value")
    .then(function(snapshot) {
      var menuToUpdate = (snapshot.val() && snapshot.val()) || {};
      var favoriteUsers = menuToUpdate.favoriteUsers;
      favoriteUsers.push(uid);
      ref.child(`${menu.id}/`).update({ favoriteUsers: favoriteUsers });

      // This is usuful to update search result as elasticsearch doesn't refresh frequently
      dispatch({
        type: ADD_MENU_TO_FAVORITE,
        payload: { menuId: menu.id, favoriteUsers }
      });
    });
};

export const searchPrivateMenus = (uid, query) => async dispatch => {
  const search = firebase.functions().httpsCallable("searchPrivateMenus");
  search({ query: query, uid: uid })
    .then(result => {
      dispatch({
        type: SEARCH_FAVORITE_MENUS,
        payload: result.data
      });
    })
    .catch(err => {
      dispatch({
        type: SEARCH_FAVORITE_MENUS,
        payload: []
      });
    })
    .finally(() => {
      dispatch({
        type: SEARCH_FAVORITE_MENUS_RECEIVED,
        payload: true
      });
    });
};

export const searchPublicMenus = (uid, query) => async dispatch => {
  const search = firebase.functions().httpsCallable("searchPublicMenus");
  search({ query: query, uid: uid })
    .then(result => {
      dispatch({
        type: SEARCH_PUBLIC_MENUS_RECEIVED,
        payload: true
      });
      dispatch({
        type: SEARCH_PUBLIC_MENUS,
        payload: result.data
      });
    })
    .catch(err => {
      dispatch({
        type: SEARCH_PUBLIC_MENUS_RECEIVED,
        payload: true
      });
      dispatch({
        type: SEARCH_PUBLIC_MENUS,
        payload: []
      });
    });
};

export const clearSearchMenus = () => async dispatch => {
  dispatch({ type: CLEAR_SEARCH_MENUS });
};

export const didUserSeeTour = uid => async dispatch => {
  userDbRef(uid).once("value", snapshot => {
    var seenTour = snapshot.val().seenTour || false;
    dispatch({
      type: SEEN_TOUR,
      payload: seenTour
    });
  });
};

export const setUserSeeTour = uid => async dispatch => {
  userDbRef(uid).update({ seenTour: true });

  dispatch({
    type: SEEN_TOUR,
    payload: true
  });
};
