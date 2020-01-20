import React, { useState } from "react";
import {
  addDish,
  updateDish,
  removeDish,
  fetchDishes,
  fetchMenus,
  cleanUpFetchMenusListener,
  searchPrivateDishes,
  clearSearchPrivateDishes,
  END_PAGINATION
} from "../../store/actions/Actions";
import EditDishModal from "../dishes/EditDishModal";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import "../../scss/Dishes.scss";
import DishesList from "../dishes/DishesList";
import { DishListEnum } from "../dishes/DishCard";
import ImportDish from "../dishes/ImportDish";
import SearchComponent from "../SearchComponent";
import { Button } from "react-bootstrap";
import useDishes from "../dishes/useDishes";

const mapStateToProps = state => {
  return {
    dishes: state.dishes.dishes,
    privateMenus: state.menus.menus,
    dataReceived: state.dishes.privateDishesDataReceived,
    menuDataReceived: state.menus.privateMenusDataReceived.received,
    searchReceived: state.dishes.privateDishesSearchReceived,
    searchResult: state.dishes.privateDishesSearchResult
  };
};

const mapDispatchToProps = dispatch => ({
  addDish: (dish, uid) => dispatch(addDish(dish, uid)),
  updateDish: (dish, uid) => dispatch(updateDish(dish, uid)),
  removeDish: (id, uid) => dispatch(removeDish(id, uid)),
  fetchDishes: (uid, filters, next) =>
    dispatch(fetchDishes(uid, filters, next)),
  fetchMenus: uid => dispatch(fetchMenus(uid)),
  cleanUpFetchMenusListener: uid => dispatch(cleanUpFetchMenusListener(uid)),
  searchPrivateDishes: (uid, query) =>
    dispatch(searchPrivateDishes(uid, query)),
  clearSearchPrivateDishes: () => dispatch(clearSearchPrivateDishes())
});

const FavoriteDishes = ({
  auth,
  fetchDishes,
  fetchMenus,
  cleanUpFetchMenusListener,
  searchPrivateDishes,
  addDish,
  updateDish,
  removeDish,
  dishes,
  privateMenus,
  dataReceived,
  menuDataReceived,
  searchReceived,
  searchResult,
  clearSearchPrivateDishes
}) => {
  /** Used to determine if to show results from searchResult object */
  const [isSearchMode, setIsSearchMode] = useState(false);

  const {
    showEditDishModal,
    setShowEditDishModal,
    addToMenu,
    onNextPage
  } = useDishes(dataReceived, fetchDishes, null, menuDataReceived, fetchMenus);

  const onDishAdd = dish => {
    addDish(dish, auth.authState.user.uid);
  };

  const onDishEdit = dish => {
    setShowEditDishModal({ show: false, dish: null, edit: false });
    updateDish(dish, auth.authState.user.uid);
  };

  const handleDishRemove = id => {
    removeDish(id, auth.authState.user.uid);
  };

  const onSearch = query => {
    setIsSearchMode(true);
    searchPrivateDishes(auth.authState.user.uid, query);
  };

  const onSearchClear = () => {
    setIsSearchMode(false);
    clearSearchPrivateDishes();
  };

  const handleAddToMenuClick = (dish, menuId) => {
    addToMenu(dish, menuId, privateMenus);
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
   * If dishes data is still loading, show message
   */
  if (!dataReceived.received) {
    return <div className="center-text">Loading...</div>;
  }

  /**
   * No dishes saved for user
   */
  if (dataReceived.received && dishes.length === 0)
    return <ImportDish addDish={dish => onDishAdd(dish)} />;

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
          onDishEdit={dish => onDishEdit(dish)}
          edit={showEditDishModal.edit}
        />
      )}
      {/* Show search only if there's dishes */}
      {dishes && dishes.length > 0 && (
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
        <div className="center-text">Couldn't find what you've search for</div>
      )}
      <DishesList
        dishes={isSearchMode ? searchResult : dishes}
        menus={privateMenus}
        handleDishRemove={id => handleDishRemove(id)}
        dishListEnum={DishListEnum.MY_FAVORITES_LIST}
        currentUid={currentUid}
        onSearch={query => onSearch(query)}
        onSearchClear={() => onSearchClear()}
        onDishEditClick={dish =>
          setShowEditDishModal({ show: true, dish: dish, edit: true })
        }
        onDishViewClick={dish =>
          setShowEditDishModal({ show: true, dish: dish, edit: false })
        }
        onDishAddToMenuClick={(dish, menuId) =>
          handleAddToMenuClick(dish, menuId)
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

FavoriteDishes.propTypes = {
  dishes: PropTypes.arrayOf(PropTypes.object),
  dataReceived: PropTypes.object
};

const FavoriteDishesList = connect(
  mapStateToProps,
  mapDispatchToProps
)(FavoriteDishes);
export default FavoriteDishesList;
