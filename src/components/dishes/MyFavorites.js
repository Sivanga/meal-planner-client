import React, { useEffect, useState } from "react";
import NewDish from "./NewDish";
import { Modal } from "react-bootstrap";
import { addDish, removeDish, fetchDishes } from "../../store/actions/Actions";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { useAuth } from "../auth/UseAuth";
import "../../scss/Dishes.scss";
import DishesList from "./DishesList";
import { DishListEnum } from "./DishCard";

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

function AddDish(props) {
  return (
    <i className="fas fa-plus-circle new-dish" onClick={props.handleShow} />
  );
}

const MyFavorites = props => {
  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  /**
   *  New dish modal state
   */
  const [newDishModalShow, setNewDishModalShow] = useState(false);

  /**
   * Fetch dishes in first render.
   * FETCH_DISHES Action creator will have an observable to notify for further changes
   */
  useEffect(() => {
    if (!auth.authState.user) return;
    props.fetchDishes(auth.authState.user.uid);
  }, [auth]);

  const onDishAdd = dish => {
    props.addDish({ dish }, auth.authState.user.uid);
    setNewDishModalShow(false);
  };

  const handleDishRemove = id => {
    props.removeDish(id, auth.authState.user.uid);
  };

  const newDishmodal = (
    <Modal show={newDishModalShow} onHide={() => setNewDishModalShow(false)}>
      <Modal.Header className="text-center" closeButton>
        <Modal.Title className="w-100 m-auto">Add new dish</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <NewDish onDishAdded={dish => onDishAdd(dish)} />
      </Modal.Body>
    </Modal>
  );

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
  if (!props.dataReceived) {
    return <div className="center-text">Loading...</div>;
  }

  /**
   * No dishes saved for user
   */
  if (props.dishes.length === 0)
    return (
      <>
        <div className="empty-dishes">
          <div>
            Looks like you don't have any favorites yet :(
            <br /> Want to add your own dish?
            <AddDish handleShow={() => setNewDishModalShow(true)} />
          </div>
        </div>
        {newDishmodal}
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
        dishes={props.dishes}
        handleDishRemove={id => handleDishRemove(id)}
        dishListEnum={DishListEnum.MY_FAVORITES_LIST}
        currentUid={currentUid}
      />

      <AddDish handleShow={() => setNewDishModalShow(true)} />
      {newDishmodal}
    </>
  );
};

MyFavorites.propTypes = {
  dishes: PropTypes.arrayOf(PropTypes.object),
  dataReceived: PropTypes.bool
};

const MyFavoritesList = connect(
  mapStateToProps,
  mapDispatchToProps
)(MyFavorites);
export default MyFavoritesList;
