import React, { useEffect, useState } from "react";
import NewDish from "./NewDish";
import { Modal, Card, CardColumns, Collapse, Button } from "react-bootstrap";
import { addDish, removeDish, fetchDishes } from "../store/actions/Actions";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import classNames from "classnames";
import { useAuth } from "../components/auth/UseAuth";

import "../scss/Dishes.scss";

const mapStateToProps = state => {
  return {
    dishes: state.dishes.dishes,
    dataReceived: state.dishes.dataReceived.dataReceived
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

const Dishes = props => {
  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  /**
   *  New dish modal state
   */
  const [newDishModalShow, setNewDishModalShow] = useState(false);

  /**
   *  Dish id to be deleted
   */
  const [deleteDishId, setDeleteDishId] = useState(-1);

  /**
   * Show recipe for chosen card
   */
  const [expandCardsArray, setExpandCardsArray] = useState([]);

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
    setDeleteDishId(-1);
  };

  /**
   * Toggle the card open state by id
   * @param {card index to be togelled} index
   */
  const handleExpandCard = index => {
    var newArray = { ...expandCardsArray };
    newArray[index]
      ? (newArray[index] = !newArray[index])
      : (newArray[index] = true);
    setExpandCardsArray(newArray);
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

  const deleteDishModal = (
    <Modal
      show={deleteDishId !== -1}
      onHide={() => setDeleteDishId(-1)}
      size="sm"
      centered
    >
      <Modal.Header className="text-center" closeButton>
        <Modal.Title className="w-100 m-auto">Delete dish?</Modal.Title>
      </Modal.Header>
      <Modal.Footer>
        <Button className="btn-modal" onClick={() => setDeleteDishId(-1)}>
          No
        </Button>
        <Button
          className="btn-modal"
          onClick={() => handleDishRemove(deleteDishId)}
        >
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  );

  /**
   * If there's no logged in user, show message
   */
  if (!auth.authState.user && auth.authState.authStatusReported) {
    return (
      <div className="center-text">Please log in to see your saved dishes!</div>
    );
  }

  /**
   * If dishes data is still loading, show message
   */
  if (!props.dataReceived) {
    return <div className="center-text">Loading...</div>;
  }

  if (props.dishes.length === 0)
    return (
      <>
        <div className="empty-dishes">
          <div>
            Looks like you don't have any dishes yet :(
            <br /> Want to add one?
            <AddDish handleShow={() => setNewDishModalShow(true)} />
          </div>
        </div>
        {newDishmodal}
      </>
    );

  return (
    <div>
      <CardColumns>
        {props.dishes.map((dish, index) => (
          <Card
            key={index}
            className={classNames({
              "local-dish": dish.isLocal
            })}
          >
            {dish.imageFile && (
              <Card.Img
                variant="top"
                src={dish.isLocal ? dish.localImageUrl : dish.imageFile}
                alt={dish.name}
              />
            )}
            {dish.isLocal && <i className="fas fa-spinner fa-pulse"></i>}
            <Card.Body>
              <Card.Title>{dish.name}</Card.Title>
              {dish.tags && (
                <ul className="list-unstyled d-flex flex-wrap justify-content-start mb-0">
                  {dish.tags.map(tag => (
                    <li key={tag.id} className="badge badge-pill badge-primary">
                      {tag.name}
                    </li>
                  ))}
                </ul>
              )}
              <div className="card-footer-container">
                <a
                  className="btn btn-flat red-text p-1 my-1 mr-0 mml-1 collapsed read-more"
                  style={{ visibility: dish.recipe ? "visible" : "hidden" }}
                  onClick={() => {
                    handleExpandCard(index);
                  }}
                  aria-controls="recipe"
                  aria-expanded={expandCardsArray[index] === true}
                >
                  {expandCardsArray[index] === true ? "READ LESS" : "READ MORE"}
                </a>

                <span onClick={() => setDeleteDishId(dish._id)}>
                  <i className="fas fa-trash-alt fa-sm trash"></i>
                </span>
              </div>
              <Collapse in={expandCardsArray[index] === true}>
                <div id="recipe">{dish.recipe}</div>
              </Collapse>
            </Card.Body>
          </Card>
        ))}
      </CardColumns>

      <AddDish handleShow={() => setNewDishModalShow(true)} />
      {newDishmodal}
      {deleteDishModal}
    </div>
  );
};

Dishes.propTypes = {
  dishes: PropTypes.arrayOf(PropTypes.object)
};

const DishesList = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dishes);
export default DishesList;
