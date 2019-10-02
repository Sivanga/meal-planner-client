import React, { useState } from "react";
import { CardColumns, Alert } from "react-bootstrap";
import DishCard from "./DishCard";
import PropTypes from "prop-types";
import { DishListEnum } from "./DishCard";
import classNames from "classnames";

const DishesList = ({
  dishes,
  handleDishRemove,
  handleDishFavorite,
  dishListEnum,
  currentUid
}) => {
  /**
   * Show/ hide login alert
   */
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  const onDishRemove = id => {
    handleDishRemove(id);
  };

  const loginAlert = (
    <Alert
      show={showLoginAlert}
      variant="danger"
      onClose={() => setShowLoginAlert(false)}
      dismissible
    >
      <Alert.Heading>Please log in first!</Alert.Heading>
    </Alert>
  );

  return (
    <>
      {loginAlert}
      <CardColumns
        className={classNames({
          singleColumn: dishListEnum === DishListEnum.GENERATE_MENU
        })}
      >
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
    DishListEnum.GENERATE_MENU,
    DishListEnum.PUBLIC_LIST,
    DishListEnum.NO_LIST
  ]),
  currentUid: PropTypes.string
};

export default DishesList;
