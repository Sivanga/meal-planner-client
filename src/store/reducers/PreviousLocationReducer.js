import { combineReducers } from "redux";
import {
  PREVIOUS_LOCATION_FAVORITES,
  PREVIOUS_LOCATION_PUBLIC
} from "../constants/Action-types";
import { ACTIVE_VIEW_DISHES } from "../actions/PreviousLocation";

function myFavoriteLocation(state = ACTIVE_VIEW_DISHES, action) {
  switch (action.type) {
    case PREVIOUS_LOCATION_FAVORITES:
      return action.payload;
    default:
      return state;
  }
}

function publicLocation(state = ACTIVE_VIEW_DISHES, action) {
  switch (action.type) {
    case PREVIOUS_LOCATION_PUBLIC:
      return action.payload;
    default:
      return state;
  }
}

const PreviousLocationReducer = combineReducers({
  myFavoriteLocation,
  publicLocation
});
export default PreviousLocationReducer;
