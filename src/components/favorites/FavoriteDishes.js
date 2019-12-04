import React, { useEffect, useState } from "react";
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
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import "../../scss/Dishes.scss";
import DishesList from "../dishes/DishesList";
import { DishListEnum } from "../dishes/DishCard";
import ImportDish from "../dishes/ImportDish";
import SearchComponent from "../SearchComponent";
import { Button } from "react-bootstrap";

const mapStateToProps = state => {
  return {
    dishes: state.dishes.dishes,
    privateMenus: state.menus.menus,
    dataReceived: state.dishes.privateDishesDataReceived,
    menuDataReceived: state.menus.privateMenusDataReceived,
    searchReceived: state.dishes.privateDishesSearchReceived,
    searchResult: state.dishes.privateDishesSearchResult
  };
};

const mapDispatchToProps = dispatch => ({
  addDish: (dish, uid) => dispatch(addDish(dish, uid)),
  updateDish: (dish, uid) => dispatch(updateDish(dish, uid)),
  removeDish: (id, uid) => dispatch(removeDish(id, uid)),
  fetchDishes: (uid, next) => dispatch(fetchDishes(uid, next)),
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
  /** Used to redirect to specific menu after choosing add dish to a menu */
  let history = useHistory();

  /** Used to determine if to show results from searchResult object */
  const [isSearchMode, setIsSearchMode] = useState(false);

  /** Show editDishModal */
  const [showEditDishModal, setShowEditDishModal] = useState({
    show: false,
    dish: null
  });

  /**
   * Fetch dishes in first render.
   * FETCH_DISHES Action creator will have an observable to notify for further changes
   */
  useEffect(() => {
    if (!auth.authState.user) return;
    const uid = auth.authState.user.uid;
    if (!dataReceived.received) fetchDishes(uid);
    if (!menuDataReceived) fetchMenus(uid);

    // Clean up listener
    return () => {
      cleanUpFetchMenusListener(uid);
    };
  }, [auth, dataReceived, menuDataReceived]);

  const onDishAdd = dish => {
    addDish(dish, auth.authState.user.uid);
  };

  const onDishEdit = dish => {
    setShowEditDishModal({ show: false, dish: null });
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

  const onNextPage = () => {
    fetchDishes(auth.authState.user.uid, dataReceived.next);
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
    return (
      <>
        <div className="empty-dishes">
          <div>
            You don't have any dishes saved yet
            <br />
            Would you like to add one?
            <ImportDish addDish={dish => onDishAdd(dish)} />
          </div>
        </div>
      </>
    );

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
          setShowEditDishModal({ show: true, dish: dish })
        }
        onDishAddToMedataReceivednuClick={(dish, menuId) =>
          handleAddToMenuClick(dish, menuId)
        }
      />
      {dataReceived &&
        dataReceived.next &&
        dataReceived.next !== END_PAGINATION && (
          <Button className="meal-plan-btn" type="button" onClick={onNextPage}>
            More
          </Button>
        )}
      <ImportDish addDish={dish => onDishAdd(dish)} />
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
