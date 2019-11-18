import React, { useEffect, useState } from "react";
import {
  removeMenu,
  fetchMenus,
  addMenuToFavorites,
  searchPrivateMenus
} from "../../store/actions/Actions";
import { MenuListEnum } from "../Menu/MenuItem";
import { connect } from "react-redux";
import MenuList from "../Menu/MenuList";
import CreateNewMenu from "../Menu/CreateNewMenu";
import SearchComponent from "../SearchComponent";

const mapStateToProps = state => {
  return {
    menus: state.menus.menus,
    dataReceived: state.menus.privateMenusDataReceived,
    searchResult: state.menus.searchMenus,
    searchReceived: state.menus.privateMenusSearchReceived
  };
};

const mapDispatchToProps = dispatch => ({
  removeMenu: (id, uid) => dispatch(removeMenu(id, uid)),
  fetchMenus: uid => dispatch(fetchMenus(uid)),
  addToFavorites: (menu, uid) => dispatch(addMenuToFavorites(menu, uid)),
  searchPrivateMenus: (uid, query) => dispatch(searchPrivateMenus(uid, query))
});

const FavoriteMenus = ({
  auth,
  fetchMenus,
  addToFavorites,
  searchPrivateMenus,
  removeMenu,
  menus,
  dataReceived,
  searchReceived,
  searchResult
}) => {
  /** Used to determine if to show results from searchResult object */
  const [isSearchMode, setIsSearchMode] = useState(false);

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

  const onSearch = query => {
    setIsSearchMode(true);
    searchPrivateMenus(auth.authState.user.uid, query);
  };

  const onSearchClear = () => {
    setIsSearchMode(false);
  };

  if (!menus || menus.length === 0) {
    return (
      <div style={{ textAlign: "center" }}>
        You don't have manus saved yet.. <br />
        Would you like to add one?
      </div>
    );
  }

  return (
    <>
      {/* Show search only if there's menus */}

      {menus && menus.length > 0 && (
        <SearchComponent
          onSearch={value => onSearch(value)}
          onSearchClear={onSearchClear}
        />
      )}
      {/* No search result to show */}
      {isSearchMode && searchReceived && searchResult.length === 0 && (
        <div className="center-text">
          Couldn't find what you've search for...
        </div>
      )}
      <MenuList
        menus={isSearchMode ? searchResult : menus}
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
