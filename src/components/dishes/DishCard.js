import React, { useState } from "react";
import {
  Card,
  Collapse,
  Button,
  Dropdown,
  ButtonToolbar,
  DropdownButton
} from "react-bootstrap";
import classNames from "classnames";
import PropTypes from "prop-types";
import "../../scss/DishCard.scss";

export const DishListEnum = {
  MY_FAVORITES_LIST: 1,
  PUBLIC_LIST: 2,
  NO_LIST: 3,
  GENERATE_MENU_LIST: 4,
  EXTRA_DISH_INFO: 5
};

const DishCard = ({
  dishListEnum,
  dish,
  menus,
  index,
  currentUid,
  handleDishFavorite,
  handleDishUnfavorite,
  handleDishMinusClick,
  handleDishLock,
  handleDishUnlock,
  onLoginNeeded,
  isEditMode,
  clickedDish,
  onClick,
  onDishEditClick,
  onDishViewClick,
  onDishAddToMenuClick,
  handleCloseExtraDishClick,
  setComment
}) => {
  /**
   * Show ingredients for chosen card
   */
  const [expandCardsArray, setExpandCardsArray] = useState([]);

  /**
   * Show delete overlay on top of the dish
   */
  const [showDeleteOverlay, setShowDeletOverlay] = useState(false);

  /** Used to ref the comment value */
  const dishCommentRef = React.createRef();

  /**
   * Toggle the card open state by id
   * @param {card index to be togelled} index
   */
  const handleExpandCard = (e, index) => {
    e.stopPropagation();
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

  const unfavoriteDish = (e, id) => {
    e.stopPropagation();
    handleDishUnfavorite(id);
    setShowDeletOverlay(false);
  };

  const onMinusClick = e => {
    e.stopPropagation();
    handleDishMinusClick();
  };

  const onUnLockClick = e => {
    e.stopPropagation();
    handleDishUnlock();
  };

  const onLockClick = e => {
    e.stopPropagation();
    handleDishLock();
  };

  const onCloseExtraDishClick = e => {
    e.stopPropagation();
    handleCloseExtraDishClick();
  };

  const handleAddToMenu = (eventKey, event) => {
    event.stopPropagation();
    onDishAddToMenuClick(dish, eventKey);
  };

  const preventDishClick = event => {
    event.stopPropagation();
  };

  const handleCommentAdd = event => {
    if (dishCommentRef && dishCommentRef.current && setComment) {
      setComment(dishCommentRef.current.innerText);
    }
  };

  const onKeyDown = (event, index) => {
    // Loose focus on Enter key
    if (event.keyCode === 13) {
      event.preventDefault();
      event.stopPropagation();
      event.target.blur();
      handleCommentAdd(event);
    }
  };

  return (
    <div
      className={classNames("dish-card", {
        "card-with-margin": dishListEnum === DishListEnum.GENERATE_MENU_LIST,
        "small-card": dishListEnum === DishListEnum.EXTRA_DISH_INFO
      })}
      onClick={() => {
        if (onClick) {
          onClick(dish);
        }
      }}
    >
      <span
        className={classNames("dish-card-menu", {
          show:
            (dishListEnum === DishListEnum.MY_FAVORITES_LIST ||
              dishListEnum === DishListEnum.PUBLIC_LIST) &&
            clickedDish === dish.id
        })}
      >
        <ul className="dish-card-menu-list">
          <li
            onClick={() => {
              onDishViewClick(dish);
            }}
          >
            View
          </li>
          {dishListEnum === DishListEnum.MY_FAVORITES_LIST && (
            <li
              onClick={() => {
                onDishEditClick(dish);
              }}
            >
              Edit
            </li>
          )}
          {menus && (
            <li>
              <ButtonToolbar>
                <DropdownButton
                  drop="right"
                  title="Add to menu"
                  id="dropdown"
                  onSelect={(eventKey, event) =>
                    handleAddToMenu(eventKey, event)
                  }
                  className="add-to-menu-dropdown-btn"
                >
                  <Dropdown.Item eventKey={"createNew"}>
                    + Create New Menu
                  </Dropdown.Item>
                  {menus.map(menu => {
                    return (
                      <Dropdown.Item key={menu.id} eventKey={menu.id}>
                        {menu.name
                          ? menu.name
                          : new Date(menu.date).toLocaleDateString("en-EN")}
                      </Dropdown.Item>
                    );
                  })}
                </DropdownButton>
              </ButtonToolbar>
            </li>
          )}
        </ul>
      </span>
      <Card>
        {dishListEnum === DishListEnum.NO_LIST && isEditMode && (
          <div className="lock-dish">
            {dish.locked && handleDishLock && (
              <span onClick={e => onUnLockClick(e)}>
                <span className="fa-stack fa-xs">
                  <i className="fa fa-circle fa-stack-2x lock-background"></i>
                  <i className="far fa-circle fa-stack-2x lock-border"></i>
                  <i className="fa fa-lock fa-stack-1x"></i>
                </span>
              </span>
            )}
            {!dish.locked && handleDishUnlock && (
              <span onClick={e => onLockClick(e)}>
                <span className="fa-stack fa-xs">
                  <i className="fa fa-circle fa-stack-2x lock-background"></i>
                  <i className="far fa-circle fa-stack-2x lock-border"></i>
                  <i className="fa fa-lock-open fa-stack-1x"></i>
                </span>
              </span>
            )}
          </div>
        )}

        {(dishListEnum === DishListEnum.NO_LIST ||
          dishListEnum === DishListEnum.GENERATE_MENU_LIST) &&
          isEditMode && (
            <span>
              <i className="fas fa-grip-vertical"></i>
            </span>
          )}
        {dishListEnum === DishListEnum.EXTRA_DISH_INFO && (
          <span
            className="close-extra-dish fa-stack fa-xs"
            onClick={e => onCloseExtraDishClick(e)}
          >
            <i className="fa fa-circle fa-stack-2x close-background"></i>
            <i className="far fa-circle fa-stack-2x lock-border"></i>
            <i className="fa fa-times fa-stack-1x"></i>
          </span>
        )}
        {(dish.imageUrl || dish.localImageUrl) && (
          <Card.Img
            variant="top"
            src={dish.isLocal ? dish.localImageUrl : dish.imageUrl}
            alt={dish.name}
          />
        )}
        {dish.isLocal && <i className="fas fa-spinner fa-pulse"></i>}
        <Card.Body>
          <Card.Title>{dish.name}</Card.Title>
          {dishListEnum !== DishListEnum.NO_LIST &&
            dishListEnum !== DishListEnum.EXTRA_DISH_INFO && (
              <>
                {dish.meals && (
                  <ul className="list-unstyled d-flex flex-wrap justify-content-start mb-0">
                    {dish.meals.map((meal, index) => (
                      <li key={index} className="badge badge-pill badge-meals">
                        {meal.name}
                      </li>
                    ))}
                  </ul>
                )}
                {dish.tags && (
                  <ul className="list-unstyled d-flex flex-wrap justify-content-start mb-0">
                    {dish.tags.map((tag, index) => (
                      <li key={index} className="badge badge-pill badge-tags">
                        {tag.name}
                      </li>
                    ))}
                  </ul>
                )}
                {dish.link && (
                  <a
                    href={dish.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dishLink"
                    onClick={e => e.stopPropagation()}
                  >
                    {dish.link}
                  </a>
                )}

                <div className="card-footer-container">
                  <span
                    className="btn btn-flat red-text p-1 my-1 mr-0 mml-1 collapsed read-more bc-white"
                    style={{
                      visibility: dish.ingredient ? "visible" : "hidden"
                    }}
                    onClick={e => {
                      handleExpandCard(e, index);
                    }}
                    aria-controls="ingredient"
                    aria-expanded={expandCardsArray[index] === true}
                  >
                    {expandCardsArray[index] === true
                      ? "READ LESS"
                      : "READ MORE"}
                  </span>

                  {/** Show unfavorite icon for my favorite or public dishes that were favorite by current user */}
                  {(dishListEnum === DishListEnum.MY_FAVORITES_LIST ||
                    (dishListEnum === DishListEnum.PUBLIC_LIST &&
                      dish.favoriteUsers &&
                      dish.favoriteUsers.indexOf(currentUid) !== -1)) && (
                    <span
                      onClick={e => {
                        e.stopPropagation();
                        setShowDeletOverlay(true);
                      }}
                    >
                      <i className="fas fa-heart fa-sm"></i>
                    </span>
                  )}

                  {/** Show favorite icon for public dishes that aren't already favorite by the user
                   */}
                  {dishListEnum === DishListEnum.PUBLIC_LIST &&
                    dish.favoriteUsers &&
                    dish.favoriteUsers.indexOf(currentUid) === -1 && (
                      <span
                        onClick={e => {
                          e.stopPropagation();
                          favoriteDish(dish);
                        }}
                      >
                        <i className="far fa-heart fa-sm"></i>
                      </span>
                    )}
                </div>
              </>
            )}

          {dishListEnum === DishListEnum.NO_LIST && isEditMode && (
            <span onClick={e => onMinusClick(e)}>
              <i className="far fas fa-minus-circle"></i>
            </span>
          )}

          <Collapse in={expandCardsArray[index] === true}>
            <div id="ingredient">{dish.ingredient}</div>
          </Collapse>
        </Card.Body>

        {/** Show footer id there's a comment or it's edit mode */}
        {dishListEnum === DishListEnum.NO_LIST &&
          ((isEditMode || dish.comment) && (
            <Card.Footer onClick={preventDishClick}>
              {/* {dish.comment ? ( */}
              {isEditMode ? (
                <div
                  ref={dishCommentRef}
                  contentEditable="true"
                  onKeyDown={event => onKeyDown(event, index)}
                  data-text="Add comment"
                  className="dish-comment"
                >
                  {dish.comment}
                </div>
              ) : (
                <div>{dish.comment}</div>
              )}
            </Card.Footer>
          ))}
      </Card>
      <div
        className={classNames("deleteOverlay", {
          show: showDeleteOverlay
        })}
      >
        <span>Unfavorite dish?</span>
        <div>
          <Button
            className="btn-modal"
            onClick={e => {
              e.stopPropagation();
              setShowDeletOverlay(false);
            }}
            size="sm"
          >
            NO
          </Button>
          <Button
            size="sm"
            className="btn-modal"
            onClick={e => unfavoriteDish(e, dish.id)}
          >
            YES
          </Button>
        </div>
      </div>
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
    DishListEnum.NO_LIST,
    DishListEnum.GENERATE_MENU_LIST,
    DishListEnum.EXTRA_DISH_INFO
  ]),
  currentUid: PropTypes.string,
  onLoginNeeded: PropTypes.func
};

export default DishCard;
