import { ADD_DISH } from "../constants/Action-types";
import { REMOVE_DISH } from "../constants/Action-types";

export function addDish(payload) {
  return { type: ADD_DISH, payload };
}

export function removeDish(payload) {
  return { type: REMOVE_DISH, payload };
}
