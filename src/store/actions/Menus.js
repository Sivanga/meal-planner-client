import {
  FETCH_MENUS,
  FETCH_MENUS_DATA_RECIEVED,
  SET_MENU
} from "../constants/Action-types";
import { menusDbRef } from "../../firebase";

/**
 * Set menu to backend
 */
export const setMenu = (payload, uid) => async dispatch => {
  // Add the menu locally
  dispatch({
    type: SET_MENU,
    payload: payload
  });

  menusDbRef(uid)
    .push()
    .set(payload);
};

/**
 * Fetch meals
 */
export const fetchMenus = uid => async dispatch => {
  menusDbRef(uid).on("value", snapshot => {
    dispatch({ type: FETCH_MENUS_DATA_RECIEVED, payload: true });
    dispatch({ type: FETCH_MENUS, payload: snapshot.val() || {} });
  });
};
