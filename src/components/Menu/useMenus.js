import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/UseAuth";
import { useHistory } from "react-router-dom";

function useMenus(menusReceived, fetchMenus, menusCleanUpListener, addMenu) {
  /** Show editDishModal */
  const [showEditDishModal, setShowEditDishModal] = useState({
    show: false,
    dish: null,
    edit: false
  });

  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  /** Used to redirect to specific menu after choosing add dish to a menu */
  let history = useHistory();

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
    console.log("use menus onNextPage. menusReceived: ", menusReceived);
    fetchMenus(auth.authState.user.uid, menusReceived.next);
  };

  return {
    onNextPage
  };
}

export default useMenus;
