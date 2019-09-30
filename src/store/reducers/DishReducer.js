import {
  FETCH_DISHES,
  ADD_DISH,
  DATA_RECEIVED,
  FETCH_PUBLIC_DISHES
} from "../constants/Action-types";

function dishes(state = [], action) {
  switch (action.type) {
    case ADD_DISH:
      // Set isLocal. This will be overidden in beckend
      var newDish = Object.assign({}, action.payload, {
        isLocal: true
      });
      // newDish.isLocal = true;
      return [newDish, ...state];
    case FETCH_DISHES:
      // // Create new state for updated dishes array
      // // Give each dish it's backend generated id for future reference
      var newDishes = [];
      Object.keys(action.payload).map(key => {
        action.payload[key].dish._id = key;
        return newDishes.unshift(action.payload[key].dish);
      });
      return newDishes;

    default:
      return state;
  }
}

function publicDishes(state = [], action) {
  switch (action.type) {
    case FETCH_PUBLIC_DISHES:
      var publicDishes = [];
      Object.keys(action.payload.publicDishes).map(key => {
        action.payload.publicDishes[key].dish._id = key;
        // Return only public dishes that aren't the current user's
        if (
          action.payload.publicDishes[key].dish.ownerUid !== action.payload.uid
        ) {
          publicDishes.push(action.payload.publicDishes[key].dish);
        }
      });
      return publicDishes;
    default:
      return state;
  }
}

function dataReceived(state = {}, action) {
  switch (action.type) {
    case DATA_RECEIVED:
      return Object.assign({}, state, {
        dataReceived: action.payload
      });

    default:
      return state;
  }
}

export default function DishReducer(state = {}, action) {
  return {
    dishes: dishes(state.dishes, action),
    publicDishes: publicDishes(state.publicDishes, action),
    dataReceived: dataReceived(state.dataReceived, action)
  };
}
