import React, { Component } from "react";
import NewDish from "./NewDish";
import { Modal, Card, CardColumns } from "react-bootstrap";
import { addDish, removeDish } from "../store/actions/Actions";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import "../scss/Dishes.scss";

const mapStateToProps = state => {
  return { dishes: state.dishes };
};

const mapDispatchToProps = dispatch => ({
  addDish: dish => dispatch(addDish(dish)),
  removeDish: id => dispatch(removeDish(id))
});

function AddDish(props) {
  return (
    <i className="fas fa-plus-circle new-dish" onClick={props.handleShow} />
  );
}

class Dishes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalShow: false
    };
    this.handleDishRemove = this.handleDishRemove.bind(this);
  }

  handleClose = () => {
    this.setState({ modalShow: false });
  };
  handleShow = () => {
    this.setState({ modalShow: true });
  };

  onDishAdded(dish) {
    this.props.addDish({ dish });
    this.handleClose();
  }

  handleDishRemove(id) {
    this.props.removeDish({ id });
  }

  render() {
    const modal = (
      <Modal show={this.state.modalShow} onHide={this.handleClose}>
        <Modal.Header className="text-center" closeButton>
          <Modal.Title className="w-100 m-auto">Add new dish</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <NewDish onDishAdded={this.onDishAdded.bind(this)} />
        </Modal.Body>
      </Modal>
    );

    if (!this.props.dishes || this.props.dishes.length === 0) {
      return (
        <>
          <div className="empty-dishes">
            <div>
              Looks like you don't have any dishes yet :(
              <br /> Want to add one?
              <AddDish handleShow={this.handleShow} />
            </div>
          </div>
          {modal}
        </>
      );
    }

    return (
      <div>
        <CardColumns>
          {this.props.dishes.map((dish, index) => (
            <Card key={index}>
              {dish.image && (
                <Card.Img
                  variant="top"
                  src={
                    dish.image.isSample
                      ? process.env.PUBLIC_URL + "/" + dish.image
                      : dish.image
                  }
                  alt={dish.name}
                />
              )}

              <Card.Body>
                <Card.Title>{dish.name}</Card.Title>
                {dish.tags && (
                  <ul className="list-unstyled d-flex flex-wrap justify-content-start mb-0">
                    {dish.tags.map(tag => (
                      <li
                        key={tag.id}
                        className="badge badge-pill badge-primary"
                      >
                        {tag.name}
                      </li>
                    ))}
                  </ul>
                )}
                <span
                  onClick={() => {
                    this.handleDishRemove(dish.id);
                  }}
                >
                  <i className="fas fa-trash-alt fa-sm trash"></i>
                </span>
              </Card.Body>
            </Card>
          ))}
        </CardColumns>

        <AddDish handleShow={this.handleShow} />
        {modal}
      </div>
    );
  }
}

Dishes.propTypes = {
  dishes: PropTypes.arrayOf(PropTypes.object)
};

const DishesList = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dishes);
export default DishesList;
