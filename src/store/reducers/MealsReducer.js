import {
  FETCH_MEALS,
  FETCH_MEALS_DATA_RECIEVED
} from "../constants/Action-types";
import { combineReducers } from "redux";

function meals(state = [], action) {
  switch (action.type) {
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
  meals,
  dataReceived
});

export default MealsReducer;
