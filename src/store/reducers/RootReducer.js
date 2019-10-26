import { combineReducers } from "redux";
import DishReducer from "./DishReducer";
import MealsReducer from "./MealsReducer";

const RootReducer = combineReducers({
  dishes: DishReducer,
  meals: MealsReducer
});

export default RootReducer;
