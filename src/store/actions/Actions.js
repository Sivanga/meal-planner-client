import { LOG_OUT } from "../constants/Action-types";

export * from "./Meals";
export * from "./Menus";
export * from "./Dishes";

export const END_PAGINATION = "END_PAGINATION";
export const PAGINATION_SIZE = 20;

export const logout = () => async dispatch => {
  dispatch({ type: LOG_OUT });
};
