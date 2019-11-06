import {
  SET_MENU,
  FETCH_PUBLIC_MENUS,
  FETCH_PRIVATE_MENUS,
  PRIVATE_MENUS_DATA_RECIEVED,
  PUBLIC_MENUS_DATA_RECIEVED
} from "../constants/Action-types";
import { combineReducers } from "redux";

function menus(state = [], action) {
  switch (action.type) {
    case SET_MENU:
      return [action.payload, ...state];
    case FETCH_PRIVATE_MENUS:
      // Give each menu it's backend generated id for future reference
      var newMenus = [];
      Object.keys(action.payload).map(key => {
        action.payload[key]._id = key;

        return newMenus.unshift(action.payload[key]);
      });
      return newMenus;
    default:
      return state;
  }
}

function dataReceived(state = false, action) {
  switch (action.type) {
    case PRIVATE_MENUS_DATA_RECIEVED:
      return action.payload;
    default:
      return state;
  }
}

const MealsReducer = combineReducers({
  menus,
  dataReceived
});

export default MealsReducer;
