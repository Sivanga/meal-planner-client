import React from "react";
import { Modal, Button } from "react-bootstrap";

const ResetMenuModal = ({ show, handleHide, handleResetClick }) => {
  return (
    <Modal show={show} onHide={handleHide}>
      <Modal.Header>Reset Menu</Modal.Header>
      <Modal.Body>Are you sure you want to discard this menu?</Modal.Body>
      <Modal.Footer>
        <Button className="meal-plan-btn" onClick={handleHide}>
          Cancel
        </Button>
        <Button className="meal-plan-btn" onClick={handleResetClick}>
          Ok
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResetMenuModal;
