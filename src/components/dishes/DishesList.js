import React, { useState } from "react";
import { Card, CardColumns, Collapse, Modal, Button } from "react-bootstrap";
import classNames from "classnames";
import PropTypes from "prop-types";

const DishesList = ({ dishes, handleDishRemove, isPublic }) => {
  /**
   * Show recipe for chosen card
   */
  const [expandCardsArray, setExpandCardsArray] = useState([]);

  /**
   *  Dish id to be deleted
   */
  const [deleteDishId, setDeleteDishId] = useState(-1);

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

  const onDishRemove = id => {
    handleDishRemove(id);
    setDeleteDishId(-1);
  };

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
          onClick={() => onDishRemove(deleteDishId)}
        >
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <>
      {deleteDishModal}

      <CardColumns>
        {dishes.map((dish, index) => (
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
                {!isPublic && (
                  <span onClick={() => setDeleteDishId(dish._id)}>
                    <i className="fas fa-trash-alt fa-sm trash"></i>
                  </span>
                )}
              </div>
              <Collapse in={expandCardsArray[index] === true}>
                <div id="recipe">{dish.recipe}</div>
              </Collapse>
            </Card.Body>
          </Card>
        ))}
      </CardColumns>
    </>
  );
};

DishesList.propTypes = {
  dishes: PropTypes.arrayOf(PropTypes.object),
  handleDishRemove: PropTypes.func
};

export default DishesList;
