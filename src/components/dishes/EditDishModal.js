import React from "react";
import { Modal } from "react-bootstrap";
import NewDish from "./NewDish";

const EditDishModal = ({
  show,
  dish,
  onEditDishHide,
  onDishEdit,
  allowRedirectAfterEdit
}) => {
  return (
    <Modal show={show} onHide={onEditDishHide} size="lg">
      <Modal.Header className="text-center" closeButton>
        <Modal.Title className="w-100 m-auto">{"Edit Dish"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <NewDish
          dish={dish}
          onDishAdded={dish => {
            if (onDishEdit) {
              onDishEdit(dish);
            }
          }}
          onClose={onEditDishHide}
          allowRedirect={allowRedirectAfterEdit}
        />
      </Modal.Body>
    </Modal>
  );
};

export default EditDishModal;
