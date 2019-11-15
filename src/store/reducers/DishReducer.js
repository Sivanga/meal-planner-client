import {
  FETCH_DISHES,
  ADD_DISH,
  PRIVATE_DISHES_DATA_RECEIVED,
  SEARCH_FAVORITE_DATA_RECEIVED,
  SEARCH_FAVORITE_DATA,
  SEARCH_PUBLIC_DISHES,
  SEARCH_PUBLIC_DATA_RECEIVED,
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
        action.payload[key].id = key;
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
      var privateDishesSearchResult = [];
      action.payload.map(result => {
        return privateDishesSearchResult.push(result);
      });
      return privateDishesSearchResult;
    case SEARCH_PUBLIC_DISHES:
      var publicDishesSearchResult = [];
      action.payload.map(result => {
        return publicDishesSearchResult.push(result._source);
      });
      return publicDishesSearchResult;
    default:
      return state;
  }
}
function publicDishes(state = [], action) {
  switch (action.type) {
    case FETCH_PUBLIC_DISHES:
      var publicDishes = [];
      Object.keys(action.payload.publicDishes).map(key => {
        action.payload.publicDishes[key].id = key;
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

function publicDishesSearchDataReceived(state = {}, action) {
  switch (action.type) {
    case SEARCH_FAVORITE_DATA_RECEIVED:
      return Object.assign({}, state, {
        publicDishesSearchDataReceived: action.payload
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
    )
  };
}
