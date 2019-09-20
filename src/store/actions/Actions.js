import { FETCH_DISHES } from "../constants/Action-types";
import { dishesDbRef, storageRef } from "../../firebase";

/**
 * Add dish to backend. Update list will be invoked by fetchDishes observer
 */
export const addDish = payload => async dispatch => {
  if (!payload.dish.imageFile) {
    return pushToDb(payload.dish);
  }

  // First upload dish image to storage
  const storageRefChild = storageRef.child(
    "images/" + payload.dish.imageFile.name
  );
  storageRefChild.put(payload.dish.imageFile).then(function(snapshot) {
    // Update the dish image file and save to db
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
  dishesDbRef.child(payload.id).remove();
};

/**
 * Fetch list of dishes and observe for changes.
 * Dispatch action FETCH_DISHES on chahnge.
 */
export const fetchDishes = () => async dispatch =>
  dishesDbRef.on("value", snapshot => {
    dispatch({ type: FETCH_DISHES, payload: snapshot.val() || {} });
  });
