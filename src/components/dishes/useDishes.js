import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/UseAuth";
import { useHistory } from "react-router-dom";

function useDishes(
  dishesReceived,
  fetchDishes,
  dishesCleanUpListener,
  menuReceived,
  fetchMenus,
  searchDishes,
  clearSearchDishes
) {
  /** Show editDishModal */
  const [showEditDishModal, setShowEditDishModal] = useState({
    show: false,
    dish: null,
    edit: false
  });

  /** Used to determine if to show results from searchResult object */
  const [isSearchMode, setIsSearchMode] = useState(false);

  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  /** Used to redirect to specific menu after choosing add dish to a menu */
  let history = useHistory();

  /**
   * Fetch dishes
   */
  useEffect(() => {
    var uid = getUid();

    if (!dishesReceived.received) fetchDishes(uid);

    // Clean up listener
    return () => {
      if (dishesCleanUpListener) dishesCleanUpListener();
    };
  }, [auth, dishesReceived]);

  /**
   * Fetch menus
   */
  useEffect(() => {
    var uid = getUid();
    if (!uid) return;

    if (!menuReceived) {
      fetchMenus(uid);
    }
  }, [auth, menuReceived]);

  const getUid = () => {
    var uid = null;
    if (auth.authState.user && auth.authState.user.uid) {
      uid = auth.authState.user.uid;
    }
    return uid;
  };

  const addToMenu = (dish, menuId, menus) => {
    // Redirect to wanted menu and send the dish as extraDish info
    const chosenMenu = menus.find(menu => menu.id === menuId);
    if (!chosenMenu) {
      history.push("/menu/newMenu", {
        extraDishInfo: dish
      });
      return;
    }

    // If wanted menu wasn't found, create a new one
    history.push("/menu/generate", {
      menuData: chosenMenu,
      extraDishInfo: dish
    });
  };

  const onNextPage = () => {
    fetchDishes(auth.authState.user.uid, null, dishesReceived.next);
  };

  const onSearch = query => {
    setIsSearchMode(true);
    searchDishes(auth.authState.user.uid, query);
  };

  const onSearchClear = () => {
    setIsSearchMode(false);
    clearSearchDishes();
  };

  return {
    showEditDishModal,
    setShowEditDishModal,
    addToMenu,
    onNextPage,
    isSearchMode,
    onSearch,
    onSearchClear
  };
}

export default useDishes;
