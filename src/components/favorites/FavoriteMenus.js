import React, { useEffect } from "react";
import {
  removeMenu,
  fetchMenus,
  addMenuToFavorites
} from "../../store/actions/Actions";
import { MenuListEnum } from "../Menu/MenuItem";
import { connect } from "react-redux";
import MenuList from "../Menu/MenuList";
import CreateNewMenu from "../Menu/CreateNewMenu";

const mapStateToProps = state => {
  return {
    menus: state.menus.menus,
    dataReceived: state.menus.privateMenusDataReceived
  };
};

const mapDispatchToProps = dispatch => ({
  removeMenu: (id, uid) => dispatch(removeMenu(id, uid)),
  fetchMenus: uid => dispatch(fetchMenus(uid)),
  addToFavorites: (menu, uid) => dispatch(addMenuToFavorites(menu, uid))
});

const FavoriteMenus = ({
  auth,
  fetchMenus,
  addToFavorites,
  removeMenu,
  menus,
  dataReceived
}) => {
  /**
   * Fetch menus in first render.
   * FETCH_MENUS Action creator will have an observable to notify for further changes
   */
  useEffect(() => {
    if (!auth.authState.user) return;
    fetchMenus(auth.authState.user.uid);
  }, [auth, fetchMenus]);

  const handleMenuRemove = id => {
    removeMenu(id, auth.authState.user.uid);
  };

  /**
   * If there's no logged in user, show message
   */
  if (!auth.authState.user && auth.authState.authStatusReported) {
    return (
      <div className="center-text">Please log in to see your favorites!</div>
    );
  }

  /**
   * If  data is still loading, show message
   */
  if (!dataReceived) {
    return <div className="center-text">Loading...</div>;
  }

  /**
   * Menus list */
  var currentUid = null;
  if (auth.authState.user && auth.authState.user.uid) {
    currentUid = auth.authState.user.uid;
  }
  return (
    <>
      <MenuList
        menus={menus}
        handleMenuRemove={id => handleMenuRemove(id)}
        handleMenuAdd={menu => addToFavorites(menu, currentUid)}
        menuListEnum={MenuListEnum.MY_FAVORITES_LIST}
        currentUid={currentUid}
      />
      <CreateNewMenu />
    </>
  );
};

const FavoriteMenusList = connect(
  mapStateToProps,
  mapDispatchToProps
)(FavoriteMenus);
export default FavoriteMenusList;
