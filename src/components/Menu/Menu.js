import React, { useEffect, useState } from "react";
import MenuList from "./MenuList";
import { MenuListEnum } from "./MenuItem";
import { connect } from "react-redux";
import {
  removeMenu,
  fetchPublicMenus,
  cleanupListenerPublicMenus,
  addMenuToFavorites,
  searchPublicMenus,
  clearSearchMenus,
  END_PAGINATION
} from "../../store/actions/Actions";
import { Button } from "react-bootstrap";
import SearchComponent from "../SearchComponent";
import useMenus from "../Menu/useMenus";

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
  fetchPublicMenus: (uid, nextPage) =>
    dispatch(fetchPublicMenus(uid, nextPage)),
  cleanupListenerPublicMenus: uid => dispatch(cleanupListenerPublicMenus(uid)),
  searchPublicMenus: (uid, query) => dispatch(searchPublicMenus(uid, query)),
  clearSearchMenus: () => dispatch(clearSearchMenus())
});

function Menu({
  publicMenus,
  fetchPublicMenus,
  cleanupListenerPublicMenus,
  addToFavorites,
  removeFromFavorites,
  dataReceived,
  searchResult,
  searchReceived,
  searchPublicMenus,
  clearSearchMenus,
  auth
}) {
  const { onNextPage } = useMenus(
    dataReceived,
    fetchPublicMenus,
    cleanupListenerPublicMenus
  );

  var currentUid = null;
  if (auth.authState.user && auth.authState.user.uid) {
    currentUid = auth.authState.user.uid;
  }

  /** Used to determine if to use search result */
  const [isSearchMode, setIsSearchMode] = useState(false);

  const handleMenuFavorite = (menu, uid) => {
    addToFavorites(menu, uid);
  };

  const handleMenuUnfavorite = id => {
    removeFromFavorites(id, auth.authState.user.uid);
  };

  const onSearch = query => {
    setIsSearchMode(true);
    searchPublicMenus(currentUid, query);
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
      {dataReceived &&
        dataReceived.next &&
        dataReceived.next !== END_PAGINATION && (
          <Button
            className="meal-plan-btn more-btn"
            type="button"
            onClick={onNextPage}
          >
            More
          </Button>
        )}
    </>
  );
}

const PublicMenusList = connect(
  mapStateToProps,
  mapDispatchToProps
)(Menu);
export default PublicMenusList;
