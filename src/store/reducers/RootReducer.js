import { combineReducers } from "redux";
import DishReducer from "./DishReducer";
import MealsReducer from "./MealsReducer";
import MenuReducer from "./MenuReducer";
import PreviousLocationReducer from "./PreviousLocationReducer";

import { LOG_OUT } from "../constants/Action-types";

const appReducer = combineReducers({
  dishes: DishReducer,
  meals: MealsReducer,
  menus: MenuReducer,
  previousLocation: PreviousLocationReducer
});

// Delete state after logout
const RootReducer = (state, action) => {
  if (action.type === LOG_OUT) {
    state = undefined;
  }

  return appReducer(state, action);
};

export default RootReducer;
