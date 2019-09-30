import React, { useEffect } from "react";
import {
  fetchPublicDishes,
  addToFavorites,
  removeDish
} from "../../store/actions/Actions";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { useAuth } from "../auth/UseAuth";
import "../../scss/Dishes.scss";
import DishesList, { DishListEnum } from "./DishesList";

const mapStateToProps = state => {
  return {
    publicDishes: state.dishes.publicDishes,
    dataReceived: state.dishes.dataReceived.dataReceived
  };
};

const mapDispatchToProps = dispatch => ({
  fetchPublicDishes: uid => dispatch(fetchPublicDishes(uid)),
  addToFavorites: (dish, uid) => dispatch(addToFavorites(dish, uid)),
  removeFromFavorites: (id, uid) => dispatch(removeDish(id, uid))
});

const Dishes = props => {
  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  /**
   * Fetch dishes in first render.
   * FETCH_DISHES Action creator will have an observable to notify for further changes
   */
  useEffect(() => {
    var uid = null;
    if (auth.authState.user && auth.authState.user.uid) {
      uid = auth.authState.user.uid;
    }
    props.fetchPublicDishes(uid);
  }, [auth]);

  const handleDishFavorite = (dish, uid) => {
    props.addToFavorites(dish, uid);
  };

  const handleDishUnfavorite = id => {
    props.removeFromFavorites(id, auth.authState.user.uid);
  };

  /**
   * If dishes data is still loading, show message
   */
  if (!props.dataReceived) {
    return <div className="center-text">Loading...</div>;
  }

  /**
   * Dishes list */
  var currentUid = null;
  if (auth.authState.user && auth.authState.user.uid) {
    currentUid = auth.authState.user.uid;
  }
  return (
    <DishesList
      dishes={props.publicDishes}
      dishListEnum={DishListEnum.PUBLIC_LIST}
      currentUid={currentUid}
      handleDishFavorite={(dish, uid) => handleDishFavorite(dish, uid)}
      handleDishRemove={id => handleDishUnfavorite(id)}
    />
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
