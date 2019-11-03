import { combineReducers } from "redux";
import DishReducer from "./DishReducer";
import MealsReducer from "./MealsReducer";
import MenuReducer from "./MenuReducer";

const RootReducer = combineReducers({
  dishes: DishReducer,
  meals: MealsReducer,
  menus: MenuReducer
});

export default RootReducer;
