import React, { useState } from "react";
import {
  removeMenu,
  fetchMenus,
  cleanUpFetchMenusListener,
  addMenuToFavorites,
  searchPrivateMenus,
  clearSearchMenus,
  END_PAGINATION
} from "../../store/actions/Actions";
import { Button } from "react-bootstrap";
import { MenuListEnum } from "../Menu/MenuItem";
import { connect } from "react-redux";
import MenuList from "../Menu/MenuList";
import CreateNewMenu from "../Menu/CreateNewMenu";
import SearchComponent from "../SearchComponent";
import useMenus from "../Menu/useMenus";

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
  fetchMenus: (uid, nextPage) => dispatch(fetchMenus(uid, nextPage)),
  cleanUpFetchMenusListener: uid => dispatch(cleanUpFetchMenusListener(uid)),
  addToFavorites: (menu, uid) => dispatch(addMenuToFavorites(menu, uid)),
  searchPrivateMenus: (uid, query) => dispatch(searchPrivateMenus(uid, query)),
  clearSearchMenus: () => dispatch(clearSearchMenus())
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
  searchResult,
  clearSearchMenus
}) => {
  const { onNextPage } = useMenus(
    dataReceived,
    fetchMenus,
    cleanUpFetchMenusListener
  );

  /** Used to determine if to show results from searchResult object */
  const [isSearchMode, setIsSearchMode] = useState(false);

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
  if (!dataReceived.received) {
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
        clearSearchMenus();

    setIsSearchMode(false);
  };

  if (!menus || menus.length === 0) {
    return (
      <>
        <div style={{ textAlign: "center" }}>
          You don't have manus saved yet.. <br />
          Would you like to add one?
          <CreateNewMenu />
        </div>
      </>
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

      {/* Searching */}
      {isSearchMode && !searchReceived && (
        <div className="center-text">Searching...</div>
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
};

const FavoriteMenusList = connect(
  mapStateToProps,
  mapDispatchToProps
)(FavoriteMenus);
export default FavoriteMenusList;
