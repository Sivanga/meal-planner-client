import {
  SET_MENU,
  SET_MENU_LOCALLY,
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
      return [action.payload.menu, ...state];
    case REMOVE_MENU:
      return [...state].filter(menu => menu.id !== action.payload);
    case FETCH_PRIVATE_MENUS:
      // Remove non local menus as they will be on the fetched list?
      var menusCopy = [...state].filter(menu => menu.local === false);
      // Append menus to previos array
      return menusCopy.concat(action.payload);
    default:
      return state;
  }
}

function menu(state = { menu: null, local: null }, action) {
  switch (action.type) {
    case FETCH_MENU:
      // menuData.dishes can arrive with undefined valus from backend,
      // change it to empty array.
      var menuCopy = { ...action.payload.menu };
      if (menuCopy.meals && menuCopy.dishes) {
        menuCopy.meals.map((meal, mealIndex) => {
          if (!menuCopy.dishes[mealIndex]) {
            menuCopy.dishes[mealIndex] = [];
            menuCopy.days.map((day, dayIndex) => {
              menuCopy.dishes[mealIndex][dayIndex] = null;
            });
          }
        });
      }
      return { menu: menuCopy, local: false };
    case SET_MENU:
      return action.payload;
    case SET_MENU_LOCALLY:
      return action.payload;
    case RESET_MENU:
      return { menu: null, local: null };
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
