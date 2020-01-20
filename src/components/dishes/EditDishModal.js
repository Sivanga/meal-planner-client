import React from "react";
import { Modal } from "react-bootstrap";
import NewDish from "./NewDish";

const EditDishModal = ({ show, dish, edit, onEditDishHide, onDishEdit }) => {
  return (
    <Modal show={show} onHide={onEditDishHide}>
      <Modal.Header className="text-center" closeButton>
        <Modal.Title className="w-100 m-auto">
          {edit ? "Edit Dish" : "View Dish"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <NewDish
          dish={dish}
          onDishAdded={dish => {
            if (onDishEdit) {
              onDishEdit(dish);
            }
          }}
          edit={edit}
          onClose={onEditDishHide}
        />
      </Modal.Body>
    </Modal>
  );
};

export default EditDishModal;
