import React, { useState } from "react";
import { Card, Collapse, Button } from "react-bootstrap";
import classNames from "classnames";
import PropTypes from "prop-types";
import "../../scss/DishCard.scss";

export const DishListEnum = {
  MY_FAVORITES_LIST: 1,
  PUBLIC_LIST: 2,
  NO_LIST: 3
};

const DishCard = ({
  dishListEnum,
  dish,
  index,
  currentUid,
  handleDishFavorite,
  handleDishUnfavorite,
  onLoginNeeded
}) => {
  /**
   * Show recipe for chosen card
   */
  const [expandCardsArray, setExpandCardsArray] = useState([]);

  /**
   * Show delete overlay on top of the dish
   */
  const [showDeleteOverlay, setShowDeletOverlay] = useState(false);

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

  const favoriteDish = dish => {
    if (!currentUid) {
      onLoginNeeded();
      return;
    }
    handleDishFavorite(dish);
  };

  const unfavoriteDish = id => {
    handleDishUnfavorite(id);
    setShowDeletOverlay(false);
  };

  return (
    <div className="dish-card">
      <Card
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
          {dishListEnum !== DishListEnum.NO_LIST && (
            <>
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
                  <span onClick={() => setShowDeletOverlay(true)}>
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
            </>
          )}

          <Collapse in={expandCardsArray[index] === true}>
            <div id="recipe">{dish.recipe}</div>
          </Collapse>
        </Card.Body>
      </Card>
      {showDeleteOverlay && (
        <div className="deleteOverlay">
          Unfavorite dish?
          <div>
            <Button
              className="btn-modal"
              onClick={() => setShowDeletOverlay(false)}
              size="sm"
            >
              NO
            </Button>
            <Button
              size="sm"
              className="btn-modal"
              onClick={() => unfavoriteDish(dish._id)}
            >
              YES
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

DishCard.propTypes = {
  dish: PropTypes.object,
  handleDishRemove: PropTypes.func,
  handleDishFavorite: PropTypes.func,
  dishListEnum: PropTypes.oneOf([
    DishListEnum.MY_FAVORITES_LIST,
    DishListEnum.PUBLIC_LIST,
    DishListEnum.NO_LIST
  ]),
  currentUid: PropTypes.string,
  onLoginNeeded: PropTypes.func
};

export default DishCard;
