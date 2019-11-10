import {
  FETCH_DISHES,
  ADD_DISH,
  PRIVATE_DISHES_DATA_RECEIVED,
  SEARCH_FAVORITE_DATA_RECEIVED,
  SEARCH_FAVORITE_DATA,
  PUBLIC_DISHES_DATA_RECEIVED,
  FETCH_PUBLIC_DISHES
} from "../constants/Action-types";

function dishes(state = [], action) {
  switch (action.type) {
    case ADD_DISH:
      // Set isLocal. This will be overidden in beckend
      var newDish = Object.assign({}, action.payload, {
        isLocal: true
      });
      return [newDish, ...state];
    case FETCH_DISHES:
      // // Create new state for updated dishes array
      // // Give each dish it's backend generated id for future reference
      var newDishes = [];
      Object.keys(action.payload).map(key => {
        action.payload[key]._id = key;
        return newDishes.unshift(action.payload[key]);
      });
      return newDishes;
    default:
      return state;
  }
}

function searchDishes(state = [], action) {
  switch (action.type) {
    case SEARCH_FAVORITE_DATA:
      var searchResult = [];
      action.payload.map(result => {
        return searchResult.push(result._source);
      });
      return searchResult;
    default:
      return state;
  }
}
function publicDishes(state = [], action) {
  switch (action.type) {
    case FETCH_PUBLIC_DISHES:
      var publicDishes = [];
      Object.keys(action.payload.publicDishes).map(key => {
        action.payload.publicDishes[key]._id = key;
        // Return only public dishes that aren't the current user's
        if (action.payload.publicDishes[key].ownerUid !== action.payload.uid) {
          publicDishes.push(action.payload.publicDishes[key]);
        }
      });
      return publicDishes;
    default:
      return state;
  }
}

function publicDishesDataReceived(state = {}, action) {
  switch (action.type) {
    case PUBLIC_DISHES_DATA_RECEIVED:
      return Object.assign({}, state, {
        publicDishesDataReceived: action.payload
      });

    default:
      return state;
  }
}

function privateDishesDataReceived(state = {}, action) {
  switch (action.type) {
    case PRIVATE_DISHES_DATA_RECEIVED:
      return Object.assign({}, state, {
        privateDishesDataReceived: action.payload
      });

    default:
      return state;
  }
}

function privateDishesSearchDataReceived(state = {}, action) {
  switch (action.type) {
    case SEARCH_FAVORITE_DATA_RECEIVED:
      return Object.assign({}, state, {
        privateDishesSearchDataReceived: action.payload
      });

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
    privateDishesSearchDataReceived: privateDishesSearchDataReceived(
      state.privateDishesSearchDataReceived,
      action
    ),
    searchResult: searchDishes(state.searchResult, action)
  };
}
