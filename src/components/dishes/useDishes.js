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
  clearSearchDishes,
  searchReceived
) {
  /** Show editDishModal */
  const [showEditDishModal, setShowEditDishModal] = useState({
    show: false,
    dish: null
  });

  /** Used to determine if to show results from searchResult object */
  const [isSearchMode, setIsSearchMode] = useState({
    active: false,
    query: ""
  });

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

    // If wanted menu wasn't found, create a new one
    if (!chosenMenu) {
      history.push("/menu/newMenu", {
        extraDishInfo: dish,
        resetMenu: true
      });
      return;
    }

    history.push("/menu/generate", {
      menuData: chosenMenu,
      extraDishInfo: dish
    });
  };

  const onNextPage = () => {
    if (!isSearchMode.active) {
      fetchDishes(
        getUid(),
        null,
        dishesReceived.next,
        dishesReceived.lastFavCount
      );
    } else {
      searchDishes(getUid(), isSearchMode.query, searchReceived.next);
    }
  };

  const onSearch = query => {
    setIsSearchMode({ active: true, query: query });
    searchDishes(getUid(), query);
  };

  const onSearchClear = () => {
    setIsSearchMode({ active: false, query: "" });
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
