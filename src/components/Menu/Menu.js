import React, { useEffect, useState } from "react";
import MenuList from "./MenuList";
import { MenuListEnum } from "./MenuItem";
import CreateNewMenu from "./CreateNewMenu";
import { connect } from "react-redux";
import {
  removeMenu,
  fetchPublicMenus,
  addMenuToFavorites,
  searchPublicMenus,
  clearSearchMenus
} from "../../store/actions/Actions";
import { useAuth } from "../auth/UseAuth";
import SearchComponent from "../SearchComponent";

const mapStateToProps = state => {
  return {
    publicMenus: state.menus.publicMenus,
    dataReceived: state.menus.publicMenusDataReceived,
    searchReceived: state.menus.publicMenusSearchReceived,
    searchResult: state.menus.searchMenus
  };
};

const mapDispatchToProps = dispatch => ({
  removeFromFavorites: (id, uid) => dispatch(removeMenu(id, uid)),
  addToFavorites: (menu, uid) => dispatch(addMenuToFavorites(menu, uid)),
  fetchPublicMenus: uid => dispatch(fetchPublicMenus(uid)),
  searchPublicMenus: (uid, query) => dispatch(searchPublicMenus(uid, query)),
  clearSearchMenus: () => dispatch(clearSearchMenus())
});

function Menu({
  publicMenus,
  fetchPublicMenus,
  addToFavorites,
  removeFromFavorites,
  dataReceived,
  searchResult,
  searchReceived,
  searchPublicMenus,
  clearSearchMenus
}) {
  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  /** Used to determine if to use search result */
  const [isSearchMode, setIsSearchMode] = useState(false);

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

  const onSearch = query => {
    setIsSearchMode(true);
    var uid = null;
    if (auth.authState.user && auth.authState.user.uid) {
      uid = auth.authState.user.uid;
    }
    searchPublicMenus(uid, query);
  };

  const onSearchClear = () => {
    setIsSearchMode(false);
    clearSearchMenus();
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
      <SearchComponent
        onSearch={value => onSearch(value)}
        onSearchClear={onSearchClear}
      />
      {/* Searching */}
      {isSearchMode && !searchReceived && (
        <div className="center-text">Searching...</div>
      )}
      {/* No search result to show */}
      {isSearchMode && searchReceived && searchResult.length === 0 && (
        <div className="center-text">Couldn't find what you've search for</div>
      )}
      <MenuList
        menus={isSearchMode ? searchResult : publicMenus}
        handleMenuAdd={menu => handleMenuFavorite(menu, currentUid)}
        handleMenuRemove={menuId => handleMenuUnfavorite(menuId, currentUid)}
        menuListEnum={MenuListEnum.PUBLIC_LIST}
        currentUid={currentUid}
      />
      <CreateNewMenu />
    </>
  );
}

const PublicMenusList = connect(
  mapStateToProps,
  mapDispatchToProps
)(Menu);
export default PublicMenusList;
