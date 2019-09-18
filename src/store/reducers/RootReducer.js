import { combineReducers } from "redux";
import DishReducer from "./DishReducer";

const RootReducer = combineReducers({ dishes: DishReducer });

export default RootReducer;
