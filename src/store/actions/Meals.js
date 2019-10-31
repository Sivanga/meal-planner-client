import {
  FETCH_MEALS,
  FETCH_MEALS_DATA_RECIEVED
} from "../constants/Action-types";
import { mealsDbRef } from "../../firebase";

/**
 * Set meals to backend
 */
export const setMeals = (payload, uid) => async dispatch => {
  mealsDbRef(uid).set(payload);
};

/**
 * Fetch meals
 */
export const fetchMeals = uid => async dispatch => {
  mealsDbRef(uid).once("value", snapshot => {
    dispatch({ type: FETCH_MEALS_DATA_RECIEVED, payload: true });
    dispatch({ type: FETCH_MEALS, payload: snapshot.val() || {} });
  });
};
