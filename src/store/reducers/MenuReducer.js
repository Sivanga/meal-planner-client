import {
  SET_MENU,
  FETCH_MENU,
  RESET_MENU,
  REMOVE_MENU,
  REMOVE_MENU_FROM_FAVORITE,
  ADD_MENU_TO_FAVORITE,
  FETCH_PUBLIC_MENUS,
  FETCH_PRIVATE_MENUS,
  PRIVATE_MENUS_DATA_RECIEVED,
  PUBLIC_MENUS_DATA_RECIEVED,
  SEARCH_FAVORITE_MENUS_RECEIVED,
  SEARCH_FAVORITE_MENUS,
  SEARCH_PUBLIC_MENUS_RECEIVED,
  SEARCH_PUBLIC_MENUS,
  CLEAR_SEARCH_MENUS,
  SEEN_TOUR
} from "../constants/Action-types";
import { combineReducers } from "redux";

function menus(state = [], action) {
  switch (action.type) {
    case SET_MENU:
      return [action.payload, ...state];
    case REMOVE_MENU:
      return [...state].filter(menu => menu.id !== action.payload);
    case FETCH_PRIVATE_MENUS:
      // Append menus to previos array
      var menusCopy = [...state];
      return menusCopy.concat(action.payload);
    default:
      return state;
  }
}

function menu(state = {}, action) {
  switch (action.type) {
    case SET_MENU:
      return action.payload;
    case FETCH_MENU:
      return action.payload;
    case RESET_MENU:
      return {};
    default:
      return state;
  }
}

function publicMenus(state = [], action) {
  switch (action.type) {
    case FETCH_PUBLIC_MENUS:
      // Append dishes to previos array
      var menuCopy = [...state];
      return menuCopy.concat(action.payload);
    case ADD_MENU_TO_FAVORITE:
    case REMOVE_MENU_FROM_FAVORITE:
      // Update menu in local state
      var index = state.findIndex(menu => {
        return menu.id === action.payload.menuId;
      });
      if (index > -1) {
        var stateCopy = [...state];
        stateCopy[index].favoriteUsers = action.payload.favoriteUsers;
        return stateCopy;
      }
      return state;
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

function searchMenus(state = [], action) {
  switch (action.type) {
    case SEARCH_FAVORITE_MENUS:
      return action.payload;
    case SEARCH_PUBLIC_MENUS:
      return action.payload;
    case CLEAR_SEARCH_MENUS:
      return [];
    default:
      return state;
  }
}

function privateMenusSearchReceived(state = false, action) {
  switch (action.type) {
    case SEARCH_FAVORITE_MENUS_RECEIVED:
      return action.payload;
    case CLEAR_SEARCH_MENUS:
      return false;
    default:
      return state;
  }
}

function publicMenusSearchReceived(state = false, action) {
  switch (action.type) {
    case SEARCH_PUBLIC_MENUS_RECEIVED:
      return action.payload;
    case CLEAR_SEARCH_MENUS:
      return false;
    default:
      return state;
  }
}

function seenTour(state = {}, action) {
  switch (action.type) {
    case SEEN_TOUR:
      return action.payload;
    default:
      return state;
  }
}
const MenuReducer = combineReducers({
  menu,
  menus,
  publicMenus,
  privateMenusDataReceived,
  publicMenusDataReceived,
  searchMenus,
  privateMenusSearchReceived,
  publicMenusSearchReceived,
  seenTour
});

export default MenuReducer;
