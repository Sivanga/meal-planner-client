import React from "react";
import {
  addDish,
  fetchPublicDishes,
  cleanUpFetchPublicDishesListener,
  addToFavorites,
  removeDish,
  fetchMenus,
  searchPublicDishes,
  clearSearchPublicDishes,
  END_PAGINATION
} from "../../store/actions/Actions";
import EditDishModal from "../dishes/EditDishModal";
import { Button } from "react-bootstrap";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import "../../scss/Dishes.scss";
import DishesList from "./DishesList";
import { DishListEnum } from "./DishCard";
import SearchComponent from "../SearchComponent";
import useDishes from "./useDishes";

const mapStateToProps = state => {
  return {
    publicDishes: state.dishes.publicDishes,
    dataReceived: state.dishes.publicDishesDataReceived,
    searchReceived: state.dishes.publicDishesSearchDataReceived,
    searchResult: state.dishes.publicDishesSearchResult,
    privateMenus: state.menus.menus,
    privateMenusDataReceived: state.menus.privateMenusDataReceived.received
  };
};

const mapDispatchToProps = dispatch => ({
  addDish: (dish, uid) => dispatch(addDish(dish, uid)),
  fetchPublicDishes: (uid, filters, next) =>
    dispatch(fetchPublicDishes(uid, filters, next)),
  cleanUpFetchPublicDishesListener: () =>
    dispatch(cleanUpFetchPublicDishesListener()),
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
  cleanUpFetchPublicDishesListener,
  fetchMenus,
  privateMenus,
  privateMenusDataReceived,
  addDish,
  addToFavorites,
  removeFromFavorites,
  searchPublicDishes,
  clearSearchPublicDishes,
  auth
}) => {
  /** Show editDishModal */
  const {
    showEditDishModal,
    setShowEditDishModal,
    addToMenu,
    onNextPage,
    isSearchMode,
    onSearch,
    onSearchClear
  } = useDishes(
    dataReceived,
    fetchPublicDishes,
    cleanUpFetchPublicDishesListener,
    privateMenusDataReceived,
    fetchMenus,
    searchPublicDishes,
    clearSearchPublicDishes
  );

  const onDishAdd = dish => {
    addDish(dish, auth.authState.user.uid);
  };

  const handleDishFavorite = (dish, uid) => {
    addToFavorites(dish, uid);
  };

  const handleDishUnfavorite = id => {
    removeFromFavorites(id, auth.authState.user.uid);
  };

  const handleAddToMenuClick = (dish, menuId) => {
    // Add public dish under this user
    addToFavorites(dish, auth.authState.user.uid);
    addToMenu(dish, menuId, privateMenus);
  };

  /**
   * If dishes data is still loading, show message
   */
  if (dataReceived && !dataReceived.received) {
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
      {showEditDishModal.show && (
        <EditDishModal
          show={showEditDishModal.show}
          dish={showEditDishModal.dish}
          onEditDishHide={() =>
            setShowEditDishModal({ show: false, dish: null })
          }
          edit={false}
        />
      )}
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
        onDishViewClick={dish =>
          setShowEditDishModal({ show: true, dish: dish, edit: false })
        }
        onDishAdd={dish => onDishAdd(dish)}
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

Dishes.propTypes = {
  publicDishes: PropTypes.arrayOf(PropTypes.object)
};

const AllDishesList = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dishes);
export default AllDishesList;
