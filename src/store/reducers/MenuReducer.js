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

function publicMenus(state = [], action) {
  switch (action.type) {
    case FETCH_PUBLIC_MENUS:
      var publicMenus = [];
      Object.keys(action.payload.publicMenus).map(key => {
        action.payload.publicMenus[key]._id = key;
        // Return only public dishes that aren't the current user's
        if (action.payload.publicMenus[key].ownerUid !== action.payload.uid) {
          publicMenus.push(action.payload.publicMenus[key]);
        }
      });
      return publicMenus;
    default:
      return state;
  }
}

function privateMenusDataReceived(state = false, action) {
  switch (action.type) {
    case PRIVATE_MENUS_DATA_RECIEVED:
      return action.payload;
    default:
      return state;
  }
}

function publicMenusDataReceived(state = false, action) {
  switch (action.type) {
    case PUBLIC_MENUS_DATA_RECIEVED:
      return action.payload;
    default:
      return state;
  }
}

const MealsReducer = combineReducers({
  menus,
  publicMenus,
  privateMenusDataReceived,
  publicMenusDataReceived
});

export default MealsReducer;
