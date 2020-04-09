import {
  PREVIOUS_LOCATION_FAVORITES,
  PREVIOUS_LOCATION_PUBLIC
} from "../constants/Action-types";

export const ACTIVE_VIEW_DISHES = "ACTIVE_VIEW_DISHES";
export const ACTIVE_VIEW_MENUS = "ACTIVE_VIEW_MENUS";

export const setPreviousLocationFavorites = activeView => async dispatch => {
  return dispatchPreviousLocationFavoritesOrPublic(
    activeView,
    PREVIOUS_LOCATION_FAVORITES,
    dispatch
  );
};

export const setPreviousLocationPublic = activeView => async dispatch => {
  return dispatchPreviousLocationFavoritesOrPublic(
    activeView,
    PREVIOUS_LOCATION_PUBLIC,
    dispatch
  );
};

const dispatchPreviousLocationFavoritesOrPublic = (
  activeView,
  type,
  dispatch
) => {
  if (
    activeView &&
    (activeView === ACTIVE_VIEW_DISHES || activeView === ACTIVE_VIEW_MENUS)
  ) {
    dispatch({ type: type, payload: activeView });
  }
};
