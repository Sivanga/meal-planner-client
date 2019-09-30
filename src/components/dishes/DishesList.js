import React, { useState } from "react";
import { Card, CardColumns, Collapse, Modal, Button } from "react-bootstrap";
import classNames from "classnames";
import PropTypes from "prop-types";

export const DishListEnum = { MY_FAVORITES_LIST: 1, PUBLIC_LIST: 2 };

const DishesList = ({
  dishes,
  handleDishRemove,
  handleDishFavorite,
  dishListEnum,
  currentUid
}) => {
  /**
   * Show recipe for chosen card
   */
  const [expandCardsArray, setExpandCardsArray] = useState([]);

  /**
   *  Dish id to be deleted
   */
  const [deleteDishId, setUnfavoriteDishId] = useState(-1);

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
    setUnfavoriteDishId(-1);
  };

  const favoriteDish = dish => {
    if (!currentUid) {
      alert("Please log in first!");
      return;
    }
    handleDishFavorite(dish, currentUid);
  };

  const deleteDishModal = (
    <Modal
      show={deleteDishId !== -1}
      onHide={() => setUnfavoriteDishId(-1)}
      size="sm"
      centered
    >
      <Modal.Header className="text-center" closeButton>
        <Modal.Title className="w-100 m-auto">Unfavorite dish?</Modal.Title>
      </Modal.Header>
      <Modal.Footer>
        <Button
          className="btn-modal"
          onClick={() => setUnfavoriteDishId(-1)}
          size="sm"
        >
          No
        </Button>
        <Button
          size="sm"
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
                <span
                  className="btn btn-flat red-text p-1 my-1 mr-0 mml-1 collapsed read-more bc-white"
                  style={{ visibility: dish.recipe ? "visible" : "hidden" }}
                  onClick={() => {
                    handleExpandCard(index);
                  }}
                  aria-controls="recipe"
                  aria-expanded={expandCardsArray[index] === true}
                >
                  {expandCardsArray[index] === true ? "READ LESS" : "READ MORE"}
                </span>

                {/** Show unfavorite icon for my favorite or public dishes that were favorite by current user */}
                {(dishListEnum === DishListEnum.MY_FAVORITES_LIST ||
                  (dishListEnum === DishListEnum.PUBLIC_LIST &&
                    dish.favoriteUsers.indexOf(currentUid) !== -1)) && (
                  <span onClick={() => setUnfavoriteDishId(dish._id)}>
                    <i className="fas fa-heart fa-sm"></i>
                  </span>
                )}

                {/** Show favorite icon for public dishes that aren't already favorite by the user
                 */}
                {dishListEnum === DishListEnum.PUBLIC_LIST &&
                  dish.favoriteUsers.indexOf(currentUid) === -1 && (
                    <span onClick={() => favoriteDish(dish)}>
                      <i className="far fa-heart fa-sm"></i>
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
  handleDishRemove: PropTypes.func,
  handleDishFavorite: PropTypes.func,
  dishListEnum: PropTypes.oneOf([
    DishListEnum.MY_FAVORITES_LIST,
    DishListEnum.PUBLIC_LIST
  ]),
  currentUid: PropTypes.number
};

export default DishesList;
