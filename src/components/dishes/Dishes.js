import React, { useEffect, useState } from "react";
import NewDish from "./NewDish";
import { Modal } from "react-bootstrap";
import {
  addDish,
  removeDish,
  fetchDishes,
  fetchPublicDishes
} from "../../store/actions/Actions";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { useAuth } from "../auth/UseAuth";
import "../../scss/Dishes.scss";
import DishesList from "./DishesList";

const mapStateToProps = state => {
  return {
    publicDishes: state.dishes.publicDishes,
    dataReceived: state.dishes.dataReceived.dataReceived
  };
};

const mapDispatchToProps = dispatch => ({
  fetchPublicDishes: uid => dispatch(fetchPublicDishes(uid))
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
    if (!auth.authState.user) return;
    props.fetchPublicDishes(auth.authState.user.uid);
  }, [auth]);

  /**
   * If dishes data is still loading, show message
   */
  if (!props.dataReceived) {
    return <div className="center-text">Loading...</div>;
  }

  /**
   * Dishes list */
  return <DishesList dishes={props.publicDishes} isPublicDishes={true} />;
};

Dishes.propTypes = {
  publicDishes: PropTypes.arrayOf(PropTypes.object)
};

const AllDishesList = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dishes);
export default AllDishesList;
