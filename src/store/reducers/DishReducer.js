import {
  FETCH_DISHES,
  ADD_DISH,
  UPDATE_DISH,
  REMOVE_DISH,
  ADD_DISH_TO_FAVORITE,
  REMOVE_DISH_FROM_FAVORITE,
  PRIVATE_DISHES_DATA_RECEIVED,
  SEARCH_FAVORITE_DATA_RECEIVED,
  SEARCH_FAVORITE_DATA,
  CLEAR_SEARCH_PRIVATE_DISHES,
  SEARCH_PUBLIC_DISHES,
  CLEAR_SEARCH_PUBLIC_DISHES,
  SEARCH_PUBLIC_DATA_RECEIVED,
  PUBLIC_DISHES_DATA_RECEIVED,
  FETCH_PUBLIC_DISHES,
  CLEAR_PUBLIC_DISHES,
  SEARCH_ALL_DISHES_RECEIVED,
  SEARCH_ALL_DISHES,
  CLEAR_SEARCH_ALL_DISHES
} from "../constants/Action-types";

function dishes(state = [], action) {
  switch (action.type) {
    case ADD_DISH:
      // Set isLocal. This will be overidden in beckend
      var newDish = Object.assign({}, action.payload, {
        isLocal: true
      });
      return [newDish, ...state];
    case UPDATE_DISH:
      var dishesCopy = [...state];
      var foundIndex = dishesCopy.findIndex(
        dish => dish.id === action.payload.id
      );
      dishesCopy[foundIndex] = action.payload;
      return dishesCopy;
    case FETCH_DISHES:
      // Give each dish it's backend generated id for future reference
      // Append dishes to previos array
      var dishesCopy = [...state];
      Object.keys(action.payload).map(key => {
        action.payload[key].id = key;
        return dishesCopy.unshift(action.payload[key]);
      });
      return dishesCopy;
    default:
      return state;
  }
}

function searchDishes(state = [], action) {
  switch (action.type) {
    case SEARCH_FAVORITE_DATA:
      return action.payload;
    case CLEAR_SEARCH_PRIVATE_DISHES:
      return [];
    case SEARCH_PUBLIC_DISHES:
      return action.payload;
    case CLEAR_SEARCH_PUBLIC_DISHES:
      return [];
    case SEARCH_ALL_DISHES:
      return action.payload;
    case CLEAR_SEARCH_ALL_DISHES:
      return [];
    case ADD_DISH_TO_FAVORITE:
    case REMOVE_DISH_FROM_FAVORITE:
      // Update the search result with this dish state
      var index = state.findIndex(dish => {
        return dish.id === action.payload.dishId;
      });
      if (index > -1) {
        var stateCopy = [...state];
        stateCopy[index].favoriteUsers = action.payload.favoriteUsers;
        return stateCopy;
      }
      return state;
    case REMOVE_DISH:
      // Update the search result with this dish state
      return state.filter(dish => {
        return dish.id !== action.payload;
      });

    default:
      return state;
  }
}
function publicDishes(state = [], action) {
  switch (action.type) {
    case CLEAR_PUBLIC_DISHES:
      return [];
    case FETCH_PUBLIC_DISHES:
      var dishesCopy = [...state];
      Object.keys(action.payload).map(key => {
        action.payload[key].id = key;
        dishesCopy.unshift(action.payload[key]);
      });
      return dishesCopy;
    default:
      return state;
  }
}

function publicDishesDataReceived(
  state = { received: false, next: null },
  action
) {
  switch (action.type) {
    case PUBLIC_DISHES_DATA_RECEIVED:
      return action.payload;
    default:
      return state;
  }
}

function privateDishesDataReceived(
  state = { received: false, next: null },
  action
) {
  switch (action.type) {
    case PRIVATE_DISHES_DATA_RECEIVED:
      return action.payload;
    default:
      return state;
  }
}

function privateDishesSearchReceived(state = false, action) {
  switch (action.type) {
    case SEARCH_FAVORITE_DATA_RECEIVED:
      return action.payload;
    case CLEAR_SEARCH_PRIVATE_DISHES:
      return false;
    default:
      return state;
  }
}

function publicDishesSearchDataReceived(state = false, action) {
  switch (action.type) {
    case SEARCH_PUBLIC_DATA_RECEIVED:
      return action.payload;
    case CLEAR_SEARCH_PUBLIC_DISHES:
      return false;
    default:
      return state;
  }
}

function allDishesSearchReceived(state = false, action) {
  switch (action.type) {
    case SEARCH_ALL_DISHES_RECEIVED:
      return action.payload;
    case CLEAR_SEARCH_ALL_DISHES:
      return false;
    default:
      return state;
  }
}

export default function DishReducer(state = {}, action) {
  return {
    dishes: dishes(state.dishes, action),
    publicDishes: publicDishes(state.publicDishes, action),
    publicDishesDataReceived: publicDishesDataReceived(
      state.publicDishesDataReceived,
      action
    ),
    privateDishesDataReceived: privateDishesDataReceived(
      state.privateDishesDataReceived,
      action
    ),
    privateDishesSearchReceived: privateDishesSearchReceived(
      state.privateDishesSearchReceived,
      action
    ),
    privateDishesSearchResult: searchDishes(
      state.privateDishesSearchResult,
      action
    ),
    publicDishesSearchDataReceived: publicDishesSearchDataReceived(
      state.publicDishesSearchDataReceived,
      action
    ),
    publicDishesSearchResult: searchDishes(
      state.publicDishesSearchResult,
      action
    ),
    allDishesSearchReceived: allDishesSearchReceived(
      state.allDishesSearchReceived,
      action
    ),
    allDishesSearchResult: searchDishes(state.allDishesSearchResult, action)
  };
}
