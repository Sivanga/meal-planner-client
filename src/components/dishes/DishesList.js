import React, { useState } from "react";
import { CardColumns } from "react-bootstrap";
import DishCard from "./DishCard";
import PropTypes from "prop-types";
import { DishListEnum } from "./DishCard";
import LoginAlert from "../auth/LoginAlert";
import "../../scss/DishesList.scss";

const DishesList = ({
  dishes,
  handleDishRemove,
  handleDishFavorite,
  dishListEnum,
  currentUid
}) => {
  const onDishRemove = id => {
    handleDishRemove(id);
  };

  /**
   * Show/ hide login alert
   */
  const [showLoginAlert, setShowLoginAlert] = useState(false);

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
            index={index}
            onLoginNeeded={() => setShowLoginAlert(true)}
            handleDishUnfavorite={id => onDishRemove(id)}
            handleDishFavorite={dish => handleDishFavorite(dish, currentUid)}
            dishListEnum={dishListEnum}
            currentUid={currentUid}
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
