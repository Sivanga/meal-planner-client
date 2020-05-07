import {
  FETCH_DISHES,
  CLEAR_PRIVATE_DISHES,
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
  FETCH_PUBLIC_DISHES_FOR_MEAL,
  PUBLIC_DISHES_FOR_MEAL_DATA_RECEIVED,
  SEARCH_ALL_DISHES_RECEIVED,
  SEARCH_ALL_DISHES,
  CLEAR_SEARCH_ALL_DISHES,
  POPULAR_TAGS
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
      if (foundIndex > -1) {
        // Update existing dish
        dishesCopy[foundIndex] = action.payload;
        return dishesCopy;
      } else {
        // This dish isn't in the array yet, add it locally
        // Set isLocal. This will be overidden in beckend
        var dishCopy = Object.assign({}, action.payload, {
          isLocal: true
        });
        return [dishCopy, ...state];
      }

    case FETCH_DISHES:
      // Append dishes to previos array
      var dishesFetchCopy = [...state];
      return dishesFetchCopy.concat(action.payload);
    case REMOVE_DISH:
      // Remove dish from the local state
      return [...state].filter(dish => {
        return dish.id !== action.payload;
      });
    case CLEAR_PRIVATE_DISHES:
      return [];
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
      return [...state].concat(action.payload);
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
      return [...state].filter(dish => {
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
      // Append dishes to previos array
      var dishesCopy = [...state];
      return dishesCopy.concat(action.payload);
    case REMOVE_DISH_FROM_FAVORITE:
    case ADD_DISH_TO_FAVORITE:
      // Update dish in local state
      var index = state.findIndex(dish => {
        return dish.id === action.payload.dishId;
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

function publicDishesPerMeal(state = [], action) {
  switch (action.type) {
    case FETCH_PUBLIC_DISHES_FOR_MEAL:
      // Append dishes to previos array
      var dishesCopy = [...state];
      return dishesCopy.concat(action.payload);
    default:
      return state;
  }
}

function publicDishesDataReceived(
  state = { received: false, next: null, lastFavCount: null },
  action
) {
  switch (action.type) {
    case PUBLIC_DISHES_DATA_RECEIVED:
      return action.payload;
    default:
      return state;
  }
}

function publicDishesPerMealDataReceived(state = false, action) {
  switch (action.type) {
    case PUBLIC_DISHES_FOR_MEAL_DATA_RECEIVED:
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

function publicDishesSearchDataReceived(
  state = { received: false, next: null },
  action
) {
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

function popularTags(state = [], action) {
  switch (action.type) {
    case POPULAR_TAGS:
      return action.payload;
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
    publicDishesPerMeal: publicDishesPerMeal(state.publicDishesPerMeal, action),
    publicDishesPerMealDataReceived: publicDishesPerMealDataReceived(
      state.publicDishesPerMealDataReceived,
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
    allDishesSearchResult: searchDishes(state.allDishesSearchResult, action),
    popularTags: popularTags(state.popularTags, action)
  };
}
