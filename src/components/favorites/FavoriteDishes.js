import React, { useEffect } from "react";
import { addDish, removeDish, fetchDishes } from "../../store/actions/Actions";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import "../../scss/Dishes.scss";
import DishesList from "../dishes/DishesList";
import { DishListEnum } from "../dishes/DishCard";
import ImportDish from "../dishes/ImportDish";

const mapStateToProps = state => {
  return {
    dishes: state.dishes.dishes,
    dataReceived:
      state.dishes.privateDishesDataReceived.privateDishesDataReceived
  };
};

const mapDispatchToProps = dispatch => ({
  addDish: (dish, uid) => dispatch(addDish(dish, uid)),
  removeDish: (id, uid) => dispatch(removeDish(id, uid)),
  fetchDishes: uid => dispatch(fetchDishes(uid))
});

const FavoriteDishes = ({
  auth,
  fetchDishes,
  addDish,
  removeDish,
  dishes,
  dataReceived
}) => {
  /**
   * Fetch dishes in first render.
   * FETCH_DISHES Action creator will have an observable to notify for further changes
   */
  useEffect(() => {
    if (!auth.authState.user) return;
    fetchDishes(auth.authState.user.uid);
  }, [auth, fetchDishes]);

  const onDishAdd = dish => {
    addDish({ dish }, auth.authState.user.uid);
  };

  const handleDishRemove = id => {
    removeDish(id, auth.authState.user.uid);
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
            Looks like you don't have any favorites yet :(
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
      <DishesList
        dishes={dishes}
        handleDishRemove={id => handleDishRemove(id)}
        dishListEnum={DishListEnum.MY_FAVORITES_LIST}
        currentUid={currentUid}
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