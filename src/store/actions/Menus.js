import {
  FETCH_PRIVATE_MENUS,
  FETCH_PUBLIC_MENUS,
  ADD_MENU_TO_FAVORITE,
  REMOVE_MENU_FROM_FAVORITE,
  PRIVATE_MENUS_DATA_RECIEVED,
  PUBLIC_MENUS_DATA_RECIEVED,
  SET_MENU,
  REMOVE_MENU,
  SEARCH_FAVORITE_MENUS,
  SEARCH_FAVORITE_MENUS_RECEIVED,
  SEARCH_PUBLIC_MENUS_RECEIVED,
  SEARCH_PUBLIC_MENUS,
  CLEAR_SEARCH_MENUS
} from "../constants/Action-types";
import { PAGINATION_SIZE, getNextKey, getArrayFromSnapshot } from "./Actions";
import { menusDbRef, publicMenusDbRef, databaseRef } from "../../firebase";
import * as firebase from "firebase/app";

/**
 * Set menu to backend
 */
export const setMenu = (payload, uid) => async dispatch => {
  // Add the menu locally
  dispatch({
    type: SET_MENU,
    payload: payload
  });

  // Get a ref for a new menu
  var newMenuKey = menusDbRef(uid).push().key;
  var updates = {};
  payload.id = newMenuKey;

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
