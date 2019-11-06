import React, { useState, useEffect } from "react";
import MenuList from "./MenuList";
import CreateNewMenu from "./CreateNewMenu";
import "../..//scss/Menu.scss";
import { connect } from "react-redux";
import {
  setMenu,
  removeMenu,
  fetchPublicMenus,
  addToFavorites
} from "../../store/actions/Actions";
import { useAuth } from "../auth/UseAuth";

const mapStateToProps = state => {
  return {
    publicMenus: state.menus.publicMenus,
    dataReceived: state.menus.publicMenusDataReceived
  };
};

const mapDispatchToProps = dispatch => ({
  setMenu: (menu, uid) => dispatch(setMenu(menu, uid)),
  removeFromFavorites: (id, uid) => dispatch(removeMenu(id, uid)),
  addToFavorites: (menu, uid) => dispatch(addToFavorites(menu, uid)),
  fetchPublicMenus: uid => dispatch(fetchPublicMenus(uid))
});

function Menu({
  publicMenus,
  fetchPublicMenus,
  addToFavorites,
  removeFromFavorites,
  dataReceived
}) {
  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  /**
   * Fetch public menus in first render.
   * FETCH_PUBLIC_MENUS Action creator will have an observable to notify for further changes
   */
  useEffect(() => {
    var uid = null;
    if (auth.authState.user && auth.authState.user.uid) {
      uid = auth.authState.user.uid;
    }
    fetchPublicMenus(uid);
  }, [auth, fetchPublicMenus]);

  const handleMenuFavorite = (menu, uid) => {
    addToFavorites(menu, uid);
  };

  const handleMenuUnfavorite = id => {
    removeFromFavorites(id, auth.authState.user.uid);
  };

  /**
   * If menu data is still loading, show message
   */
  if (!dataReceived) {
    return <div className="center-text">Loading...</div>;
  }

  var currentUid = null;
  if (auth.authState.user && auth.authState.user.uid) {
    currentUid = auth.authState.user.uid;
  }

  return (
    <>
      <MenuList menus={publicMenus} />
      <CreateNewMenu />
    </>
  );
}

const PublicMenusList = connect(
  mapStateToProps,
  mapDispatchToProps
)(Menu);
export default PublicMenusList;
