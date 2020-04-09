import {
  FETCH_MEALS,
  FETCH_MEALS_DATA_RECIEVED,
  SET_MEALS_STATE,
  SET_MEALS_BACKEND
} from "../constants/Action-types";
import { combineReducers } from "redux";

function mealsBackend(state = [], action) {
  switch (action.type) {
    case FETCH_MEALS:
    case SET_MEALS_BACKEND:
      return action.payload;
    default:
      return state;
  }
}

function mealsState(
  state = [
    { name: "Breakfast" },
    { name: "Lunch" },
    { name: "Snack" },
    { name: "Dinner" }
  ],
  action
) {
  switch (action.type) {
    case SET_MEALS_STATE:
    case FETCH_MEALS:
      return action.payload;
    default:
      return state;
  }
}

function dataReceived(state = false, action) {
  switch (action.type) {
    case FETCH_MEALS_DATA_RECIEVED:
      return action.payload;
    default:
      return state;
  }
}

const MealsReducer = combineReducers({
  mealsState,
  mealsBackend,
  dataReceived
});

export default MealsReducer;
