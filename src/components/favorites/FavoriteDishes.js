import React, { useEffect, useState } from "react";
import {
  addDish,
  removeDish,
  fetchDishes,
  searchPrivateDishes
} from "../../store/actions/Actions";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import "../../scss/Dishes.scss";
import DishesList from "../dishes/DishesList";
import { DishListEnum } from "../dishes/DishCard";
import ImportDish from "../dishes/ImportDish";
import SearchComponent from "../SearchComponent";

const mapStateToProps = state => {
  return {
    dishes: state.dishes.dishes,
    dataReceived:
      state.dishes.privateDishesDataReceived.privateDishesDataReceived,
    searchReceived:
      state.dishes.privateDishesSearchDataReceived
        .privateDishesSearchDataReceived,
    searchResult: state.dishes.privateDishesSearchResult
  };
};

const mapDispatchToProps = dispatch => ({
  addDish: (dish, uid) => dispatch(addDish(dish, uid)),
  removeDish: (id, uid) => dispatch(removeDish(id, uid)),
  fetchDishes: uid => dispatch(fetchDishes(uid)),
  searchPrivateDishes: (uid, query) => dispatch(searchPrivateDishes(uid, query))
});

const FavoriteDishes = ({
  auth,
  fetchDishes,
  searchPrivateDishes,
  addDish,
  removeDish,
  dishes,
  dataReceived,
  searchReceived,
  searchResult
}) => {
  /** Used to determine if to show results from searchResult object */
  const [isSearchMode, setIsSearchMode] = useState(false);

  /**
   * Fetch dishes in first render.
   * FETCH_DISHES Action creator will have an observable to notify for further changes
   */
  useEffect(() => {
    if (!auth.authState.user) return;
    fetchDishes(auth.authState.user.uid);
  }, [auth, fetchDishes]);

  const onDishAdd = dish => {
    addDish(dish, auth.authState.user.uid);
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
  if (!dataReceived) {
    return <div className="center-text">Loading...</div>;
  }

  /**
   * No dishes saved for user
   */
  if (dishes.length === 0)
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
      {/* Show search only if there's dishes */}
      {dishes && dishes.length > 0 && (
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
      <DishesList
        dishes={isSearchMode ? searchResult : dishes}
        handleDishRemove={id => handleDishRemove(id)}
        dishListEnum={DishListEnum.MY_FAVORITES_LIST}
        currentUid={currentUid}
        onSearch={query => onSearch(query)}
        onSearchClear={() => onSearchClear()}
      />
      <ImportDish addDish={dish => onDishAdd(dish)} />
    </>
  );
};

FavoriteDishes.propTypes = {
  dishes: PropTypes.arrayOf(PropTypes.object),
  dataReceived: PropTypes.bool
};

const FavoriteDishesList = connect(
  mapStateToProps,
  mapDispatchToProps
)(FavoriteDishes);
export default FavoriteDishesList;
