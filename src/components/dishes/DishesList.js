import React, { useState } from "react";
import { CardColumns, Modal, Button, Alert } from "react-bootstrap";
import DishCard from "./DishCard";
import PropTypes from "prop-types";
import { DishListEnum } from "./DishCard";

const DishesList = ({
  dishes,
  handleDishRemove,
  handleDishFavorite,
  dishListEnum,
  currentUid
}) => {
  /**
   *  Dish id to be deleted
   */
  const [deleteDishId, setUnfavoriteDishId] = useState(-1);

  /**
   * Show/ hide login alert
   */
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  const onDishRemove = id => {
    handleDishRemove(id);
    setUnfavoriteDishId(-1);
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
      {deleteDishModal}
      {loginAlert}
      <CardColumns>
        {dishes.map((dish, index) => (
          <DishCard
            key={index}
            dish={dish}
            index={index}
            onLoginNeeded={() => setShowLoginAlert(true)}
            handleDishUnfavorite={id => setUnfavoriteDishId(id)}
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
    DishListEnum.PUBLIC_LIST
  ]),
  currentUid: PropTypes.string
};

export default DishesList;
