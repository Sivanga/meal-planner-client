import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import NewDish from "./NewDish";

const NewDishmodal = ({ addDish }) => {
  /**
   *  New dish modal state
   */
  const [newDishModalShow, setNewDishModalShow] = useState(false);

  const onDishAdd = dish => {
    addDish(dish);
    setNewDishModalShow(false);
  };

  return (
    <>
      <Modal show={newDishModalShow} onHide={() => setNewDishModalShow(false)}>
        <Modal.Header className="text-center" closeButton>
          <Modal.Title className="w-100 m-auto">Add new dish</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <NewDish onDishAdded={dish => onDishAdd(dish)} />
        </Modal.Body>
      </Modal>

      <i
        className="fas fa-plus-circle new-dish"
        onClick={() => setNewDishModalShow(true)}
      />
    </>
  );
};

export default NewDishmodal;
