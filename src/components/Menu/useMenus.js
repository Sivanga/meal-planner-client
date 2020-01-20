import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/UseAuth";

function useMenus(
  menusReceived,
  fetchMenus,
  menusCleanUpListener,
  searchMenus,
  clearSearchMenus
) {
  /** Used to determine if to show results from searchResult object */
  const [isSearchMode, setIsSearchMode] = useState(false);

  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  /**
   * Fetch menus
   */
  useEffect(() => {
    var uid = getUid();
    if (!uid) return;

    if (!menusReceived.received) {
      fetchMenus(uid);
    }

    return () => {
      menusCleanUpListener();
    };
  }, [auth, menusReceived]);

  const getUid = () => {
    var uid = null;
    if (auth.authState.user && auth.authState.user.uid) {
      uid = auth.authState.user.uid;
    }
    return uid;
  };

  const onNextPage = () => {
    fetchMenus(auth.authState.user.uid, menusReceived.next);
  };

  const onSearch = query => {
    setIsSearchMode(true);
    searchMenus(auth.authState.user.uid, query);
  };

  const onSearchClear = () => {
    clearSearchMenus();
    setIsSearchMode(false);
  };

  return {
    onNextPage,
    onSearch,
    onSearchClear,
    isSearchMode
  };
}

export default useMenus;
