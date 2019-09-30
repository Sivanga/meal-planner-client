import {
  FETCH_DISHES,
  ADD_DISH,
  DATA_RECEIVED,
  FETCH_PUBLIC_DISHES
} from "../constants/Action-types";
import { dishesDbRef, storageRef, publicDishesDbRef } from "../../firebase";

/**
 * Add dish to backend. Update list will be invoked by fetchDishes observer
 */
export const addDish = (payload, uid) => async dispatch => {
  // Add the dish locally
  dispatch({ type: ADD_DISH, payload: payload.dish });

  // Add to backend if there's authenticated user
  if (!uid) {
    noAuthError("addDish");
    return;
  }

  // Dishes without images can be push in db as is
  if (!payload.dish.imageFile) {
    return pushToDb(payload.dish, uid);
  }

  // First upload dish image to storage
  // Then update the image url of the dish and push to db
  const storageRefChild = storageRef(uid).child(
    "images/" + payload.dish.imageFile.name
  );
  storageRefChild.put(payload.dish.imageFile).then(function(snapshot) {
    storageRefChild.getDownloadURL().then(url => {
      payload.dish.imageFile = url;
      pushToDb(payload.dish, uid);
    });
  });
};

const pushToDb = (dish, uid) => {
  dishesDbRef(uid)
    .push()
    .set({
      dish: dish
    });

  // push to public dishes if needed
  if (dish.sharePublic) {
    dish.ownerUid = uid;
    publicDishesDbRef()
      .push()
      .set({ dish: dish });
  }
};

/**
 * Remove dish from backend. Update list will be invoked by fetchDishes observer
 */
export const removeDish = (payload, uid) => async dispatch => {
  if (!uid) {
    noAuthError("addDish");
    return;
  }

  dishesDbRef(uid)
    .child(payload)
    .remove();
};

/**
 * Fetch list of dishes and observe for changes.
 * Dispatch action FETCH_DISHES on chahnge.
 */
export const fetchDishes = uid => async dispatch => {
  if (!uid) {
    noAuthError("addDish");
    return;
  }
  dishesDbRef(uid).on("value", snapshot => {
    dispatch({ type: DATA_RECEIVED, payload: true });
    dispatch({ type: FETCH_DISHES, payload: snapshot.val() || {} });
  });
};

const noAuthError = methodName => {
  console.error(
    methodName + " No auth found. User should login for this action"
  );
};

/**
 * Fetch all public dishes that aren't the user's owned dishes
 * @param {current user id} uid
 */
export const fetchPublicDishes = uid => async dispatch => {
  var ref = publicDishesDbRef();
  ref.orderByChild("dish/ownerUid").on("value", snapshot => {
    var payload = {
      publicDishes: snapshot.val() || {},
      uid: uid
    };
    dispatch({ type: FETCH_PUBLIC_DISHES, payload: payload });
  });
};
