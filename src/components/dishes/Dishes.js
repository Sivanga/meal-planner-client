import React, { useEffect, useState } from "react";
import {
  addDish,
  fetchPublicDishes,
  addToFavorites,
  removeDish,
  fetchMenus,
  searchPublicDishes,
  clearSearchPublicDishes
} from "../../store/actions/Actions";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../auth/UseAuth";
import "../../scss/Dishes.scss";
import DishesList from "./DishesList";
import { DishListEnum } from "./DishCard";
import ImportDish from "./ImportDish";
import SearchComponent from "../SearchComponent";

const mapStateToProps = state => {
  return {
    publicDishes: state.dishes.publicDishes,
    dataReceived:
      state.dishes.publicDishesDataReceived.publicDishesDataReceived,
    searchReceived: state.dishes.publicDishesSearchDataReceived,
    searchResult: state.dishes.publicDishesSearchResult,
    privateMenus: state.menus.menus
  };
};

const mapDispatchToProps = dispatch => ({
  addDish: (dish, uid) => dispatch(addDish(dish, uid)),
  fetchPublicDishes: uid => dispatch(fetchPublicDishes(uid)),
  fetchMenus: uid => dispatch(fetchMenus(uid)),
  addToFavorites: (dish, uid) => dispatch(addToFavorites(dish, uid)),
  removeFromFavorites: (id, uid) => dispatch(removeDish(id, uid)),
  searchPublicDishes: (uid, query) => dispatch(searchPublicDishes(uid, query)),
  clearSearchPublicDishes: () => dispatch(clearSearchPublicDishes())
});

const Dishes = ({
  publicDishes,
  dataReceived,
  searchReceived,
  searchResult,
  fetchPublicDishes,
  fetchMenus,
  privateMenus,
  addDish,
  addToFavorites,
  removeFromFavorites,
  searchPublicDishes,
  clearSearchPublicDishes
}) => {
  /** Used to redirect to specific menu after choosing add dish to a menu */
  let history = useHistory();
  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  /** Used to determine if to use search result */
  const [isSearchMode, setIsSearchMode] = useState(false);

  /**
   * Fetch dishes in first render.
   * FETCH_DISHES Action creator will have an observable to notify for further changes
   */
  useEffect(() => {
    var uid = null;
    if (auth.authState.user && auth.authState.user.uid) {
      uid = auth.authState.user.uid;
    }
    fetchPublicDishes(uid);
    fetchMenus(uid);
  }, [auth, fetchPublicDishes, fetchMenus]);

  const onDishAdd = dish => {
    addDish(dish, auth.authState.user.uid);
  };

  const handleDishFavorite = (dish, uid) => {
    addToFavorites(dish, uid);
  };

  const handleDishUnfavorite = id => {
    removeFromFavorites(id, auth.authState.user.uid);
  };

  const onSearch = value => {
    setIsSearchMode(true);
    var uid = null;
    if (auth.authState.user && auth.authState.user.uid) {
      uid = auth.authState.user.uid;
    }
    searchPublicDishes(uid, value);
  };

  const onSearchClear = () => {
    setIsSearchMode(false);
    clearSearchPublicDishes();
  };

  const handleAddToMenuClick = (dish, menuId) => {
    // Add public dish under this user
    addToFavorites(dish, auth.authState.user.uid);

    // Redirect to wanted menu and send the dish as extraDish info
    const chosenMenu = privateMenus.find(menu => menu.id === menuId);
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

  /**
   * If dishes data is still loading, show message
   */
  if (!dataReceived) {
    return <div className="center-text">Loading...</div>;
  }

  /**
   * Dishes list */
  var currentUid = null;
  if (auth.authState.user && auth.authState.user.uid) {
    currentUid = auth.authState.user.uid;
  }

  return (
    <>
      <SearchComponent
        onSearch={value => {
          onSearch(value);
        }}
        onSearchClear={onSearchClear}
      />
      {/* Searching */}
      {isSearchMode && !searchReceived && (
        <div className="center-text">Searching...</div>
      )}
      {/* No search result to show */}
      {isSearchMode &&
        searchReceived &&
        (!searchResult || searchResult.length === 0) && (
          <div className="center-text">
            Couldn't find what you've search for
          </div>
        )}
      <DishesList
        dishes={isSearchMode ? searchResult : publicDishes}
        menus={privateMenus}
        dishListEnum={DishListEnum.PUBLIC_LIST}
        currentUid={currentUid}
        handleDishFavorite={(dish, uid) => handleDishFavorite(dish, uid)}
        handleDishRemove={id => handleDishUnfavorite(id)}
        onDishAddToMenuClick={(dish, menuId) =>
          handleAddToMenuClick(dish, menuId)
        }
      />
      <ImportDish addDish={dish => onDishAdd(dish)} />
    </>
  );
};

Dishes.propTypes = {
  publicDishes: PropTypes.arrayOf(PropTypes.object)
};

const AllDishesList = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dishes);
export default AllDishesList;
