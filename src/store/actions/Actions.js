import { FETCH_DISHES } from "../constants/Action-types";
import { dishesDbRef } from "../../firebase";

/**
 * Add dish to backend. Update list will be invoked by fetchDishes observer
 */
export const addDish = payload => async dispatch => {
  dishesDbRef.push().set({ dish: payload.dish });
};

/**
 * Remove dish from backend. Update list will be invoked by fetchDishes observer
 */
export const removeDish = payload => async dispatch => {
  dishesDbRef.child(payload.id).remove();
};

/**
 * Fetch list of dishes and observe for changes.
 * Dispatch action FETCH_DISHES on chahnge.
 */
export const fetchDishes = () => async dispatch =>
  dishesDbRef.on("value", snapshot => {
    dispatch({ type: FETCH_DISHES, payload: snapshot.val() || {} });
  });
