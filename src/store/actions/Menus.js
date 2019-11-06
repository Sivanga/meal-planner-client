import {
  FETCH_PRIVATE_MENUS,
  FETCH_PUBLIC_MENUS,
  PRIVATE_MENUS_DATA_RECIEVED,
  PUBLIC_MENUS_DATA_RECIEVED,
  SET_MENU
} from "../constants/Action-types";
import { menusDbRef, publicMenusDbRef, databaseRef } from "../../firebase";

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
  // Remove the menu under current user
  menusDbRef(uid)
    .child(payload)
    .remove();

  var ref = publicMenusDbRef();

  return ref
    .child(`${payload}/menu`)
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
        ref.child(`${payload}/menu/`).update({ favoriteUsers: favoriteUsers });
      }
    });
};

/**
 * Fetch private menus
 */
export const fetchMenus = uid => async dispatch => {
  menusDbRef(uid).on("value", snapshot => {
    dispatch({ type: PRIVATE_MENUS_DATA_RECIEVED, payload: true });
    dispatch({ type: FETCH_PRIVATE_MENUS, payload: snapshot.val() || {} });
  });
};

/**
 * Fetch all public menus
 * @param {current user id} uid
 */
export const fetchPublicMenus = uid => async dispatch => {
  var ref = publicMenusDbRef();
  ref.orderByChild("menu/ownerUid").on("value", snapshot => {
    var payload = {
      publicMenus: snapshot.val() || {},
      uid: uid
    };
    dispatch({ type: FETCH_PUBLIC_MENUS, payload: payload });
    dispatch({ type: PUBLIC_MENUS_DATA_RECIEVED, payload: true });
  });
};

export const addToFavorites = (menu, uid) => async dispatch => {
  // Set the menu under current user
  menusDbRef(uid)
    .child("/" + menu._id)
    .set({
      menu
    });

  // Mark this user as a favorite under this public menu
  var ref = publicMenusDbRef();
  return ref
    .child(`${menu._id}/menu`)
    .once("value")
    .then(function(snapshot) {
      var menuToUpdate = (snapshot.val() && snapshot.val()) || {};
      var favoriteUsers = menuToUpdate.favoriteUsers;
      favoriteUsers.push(uid);
      ref.child(`${menu._id}/menu/`).update({ favoriteUsers: favoriteUsers });
    });
};
