import React from "react";
import {
  addDish,
  updateDish,
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
  updateDish: (dish, uid) => dispatch(updateDish(dish, uid)),
  fetchPublicDishes: (uid, filters, next, lastFavCount) =>
    dispatch(fetchPublicDishes(uid, filters, next, lastFavCount)),
  cleanUpFetchPublicDishesListener: () =>
    dispatch(cleanUpFetchPublicDishesListener()),
  fetchMenus: uid => dispatch(fetchMenus(uid)),
  addToFavorites: (dish, uid) => dispatch(addToFavorites(dish, uid)),
  removeFromFavorites: (id, uid) => dispatch(removeDish(id, uid)),
  searchPublicDishes: (uid, query, next) =>
    dispatch(searchPublicDishes(uid, query, next)),
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
  updateDish,
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
    clearSearchPublicDishes,
    searchReceived
  );

  const getUid = () => {
    var uid = null;
    if (auth.authState.user && auth.authState.user.uid) {
      uid = auth.authState.user.uid;
    }
    return uid;
  };

  const onDishAdd = dish => {
    addDish(dish, getUid());
  };

  const handleDishFavorite = (dish, uid) => {
    addToFavorites(dish, uid);
  };

  const handleDishUnfavorite = id => {
    removeFromFavorites(id, getUid());
  };

  const handleAddToMenuClick = (dish, menuId) => {
    // Add public dish under this user
    addToFavorites(dish, getUid());
    addToMenu(dish, menuId, privateMenus);
  };

  const onDishEdit = dish => {
    setShowEditDishModal({ show: false, dish: null, edit: false });
    updateDish(dish, auth.authState.user.uid);
  };

  const showMoreButton = () => {
    var received = null;
    if (isSearchMode.active) received = searchReceived;
    else received = dataReceived;

    // Not search mode
    if (received && received.next && received.next !== END_PAGINATION) {
      return true;
    }

    return false;
  };

  /**
   * If dishes data is still loading, show message
   */
  if (dataReceived && !dataReceived.received) {
    return <div className="center-text">Loading...</div>;
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
          onDishEdit={dish => onDishEdit(dish)}
        />
      )}
      <SearchComponent
        onSearch={value => {
          onSearch(value);
        }}
        onSearchClear={onSearchClear}
      />
      {/* Searching */}
      {isSearchMode.active && !searchReceived.received && (
        <div className="center-text">Searching...</div>
      )}
      {/* No search result to show */}
      {isSearchMode.active &&
        searchReceived.received &&
        (!searchResult || searchResult.length === 0) && (
          <div className="center-text">
            Couldn't find what you've search for
          </div>
        )}
      <DishesList
        dishes={isSearchMode.active ? searchResult : publicDishes}
        menus={privateMenus}
        dishListEnum={DishListEnum.PUBLIC_LIST}
        currentUid={getUid()}
        handleDishFavorite={(dish, uid) => handleDishFavorite(dish, uid)}
        handleDishRemove={id => handleDishUnfavorite(id)}
        onDishAddToMenuClick={(dish, menuId) =>
          handleAddToMenuClick(dish, menuId)
        }
        onDishEditClick={dish =>
          setShowEditDishModal({ show: true, dish: dish })
        }
        onDishAdd={dish => onDishAdd(dish)}
      />
      {showMoreButton() && (
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
