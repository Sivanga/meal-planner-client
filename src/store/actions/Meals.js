import {
  FETCH_MEALS,
  FETCH_MEALS_DATA_RECIEVED,
  SET_MEALS_STATE,
  SET_MEALS_BACKEND
} from "../constants/Action-types";
import { mealsDbRef } from "../../firebase";

/**
  Set meals in backend
 */
export const setMealsBackend = (payload, uid) => async dispatch => {
  mealsDbRef(uid).set(payload);

  dispatch({
    type: SET_MEALS_BACKEND,
    payload: payload
  });
};

/**
Set meals in store
 */
export const setMealsState = payload => async dispatch => {
  dispatch({
    type: SET_MEALS_STATE,
    payload: payload
  });
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
