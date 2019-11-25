import React, { useState, useEffect } from "react";
import { CardColumns } from "react-bootstrap";
import DishCard from "./DishCard";
import PropTypes from "prop-types";
import { DishListEnum } from "./DishCard";
import LoginAlert from "../auth/LoginAlert";
import "../../scss/DishesList.scss";

const DishesList = ({
  dishes,
  menus,
  handleDishRemove,
  handleDishFavorite,
  dishListEnum,
  currentUid,
  onDishEditClick,
  onDishAddToMenuClick
}) => {
  /**
   * Show/ hide login alert
   */
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  /** Show / hide menu on selected dish */
  const [clickedDish, setClickedDish] = useState(null);

  useEffect(() => {
    // Reset the clicked dish id after menu item was clicked
    setClickedDish("");
  }, [onDishEditClick]);

  return (
    <>
      <LoginAlert
        showLoginAlert={showLoginAlert}
        onClose={() => setShowLoginAlert(false)}
      />
      <CardColumns>
        {dishes.map((dish, index) => (
          <DishCard
            key={index}
            dish={dish}
            menus={menus}
            index={index}
            onLoginNeeded={() => setShowLoginAlert(true)}
            handleDishUnfavorite={id => handleDishRemove(id)}
            handleDishFavorite={dish => handleDishFavorite(dish, currentUid)}
            dishListEnum={dishListEnum}
            currentUid={currentUid}
            clickedDish={clickedDish}
            onClick={id => setClickedDish(id)}
            onDishEditClick={dish => onDishEditClick(dish)}
            onDishAddToMenuClick={(dish, menuId) =>
              onDishAddToMenuClick(dish, menuId)
            }
          />
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
    DishListEnum.PUBLIC_LIST,
    DishListEnum.NO_LIST
  ]),
  currentUid: PropTypes.string
};

export default DishesList;
