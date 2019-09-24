import React, { useEffect, useState } from "react";
import NewDish from "./NewDish";
import { Modal, Card, CardColumns } from "react-bootstrap";
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
  const auth = useAuth();
  /**
   * Show modal state
   */
  const [modalShow, setModalShow] = useState(false);

  /**
   * Fetch dishes in first render.
   * FETCH_DISHES Action creator will have an observable to notify for further changes
   */
  useEffect(() => {
    if (!auth.authState.user) return;
    props.fetchDishes(auth.authState.user.uid);
  }, [auth]);

  const onDishAdded = dish => {
    props.addDish({ dish }, auth.authState.user.uid);
    setModalShow(false);
  };

  const handleDishRemove = id => {
    props.removeDish({ id }, auth.authState.user.uid);
  };

  const modal = (
    <Modal show={modalShow} onHide={() => setModalShow(false)}>
      <Modal.Header className="text-center" closeButton>
        <Modal.Title className="w-100 m-auto">Add new dish</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <NewDish onDishAdded={dish => onDishAdded(dish)} />
      </Modal.Body>
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
            <AddDish handleShow={() => setModalShow(true)} />
          </div>
        </div>
        {modal}
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
              <span
                onClick={() => {
                  handleDishRemove(dish._id);
                }}
              >
                <i className="fas fa-trash-alt fa-sm trash"></i>
              </span>
            </Card.Body>
          </Card>
        ))}
      </CardColumns>

      <AddDish handleShow={() => setModalShow(true)} />
      {modal}
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
