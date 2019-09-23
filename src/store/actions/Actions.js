import {
  FETCH_DISHES,
  ADD_DISH,
  DATA_RECEIVED
} from "../constants/Action-types";
import { dishesDbRef, storageRef } from "../../firebase";

/**
 * Add dish to backend. Update list will be invoked by fetchDishes observer
 */
export const addDish = payload => async dispatch => {
  // Add the dish locally
  dispatch({ type: ADD_DISH, payload: payload.dish });

  // Dishes without images can be push in db as is
  if (!payload.dish.imageFile) {
    return pushToDb(payload.dish);
  }

  // First upload dish image to storage
  // Then update the image url of the dish and push to db
  const storageRefChild = storageRef.child(
    "images/" + payload.dish.imageFile.name
  );
  storageRefChild.put(payload.dish.imageFile).then(function(snapshot) {
    storageRefChild.getDownloadURL().then(url => {
      payload.dish.imageFile = url;
      pushToDb(payload.dish);
    });
  });
};

const pushToDb = dish => {
  dishesDbRef.push().set({
    dish: dish
  });
};

/**
 * Remove dish from backend. Update list will be invoked by fetchDishes observer
 */
export const removeDish = payload => async dispatch => {
  if (payload.id) {
    dishesDbRef.child(payload.id).remove();
  }
};

/**
 * Fetch list of dishes and observe for changes.
 * Dispatch action FETCH_DISHES on chahnge.
 */
export const fetchDishes = () => async dispatch =>
  dishesDbRef.on("value", snapshot => {
    dispatch({ type: DATA_RECEIVED, payload: true });
    dispatch({ type: FETCH_DISHES, payload: snapshot.val() || {} });
  });
