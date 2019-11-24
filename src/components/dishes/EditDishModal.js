import React from "react";
import { Modal } from "react-bootstrap";
import NewDish from "./NewDish";

const EditDishModal = ({ show, dish, onEditDishHide, onDishEdit }) => {
  return (
    <Modal show={show} onHide={onEditDishHide}>
      <Modal.Header className="text-center" closeButton>
        <Modal.Title className="w-100 m-auto">Edit</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <NewDish dish={dish} onDishAdded={dish => onDishEdit(dish)} />
      </Modal.Body>
    </Modal>
  );
};

export default EditDishModal;
