import React from "react";
import { Modal } from "react-bootstrap";

const LoginAlert = ({ showLoginAlert, onClose }) => {
  return (
    <>
      <Modal
        // display={{ positions: "fixed" }}
        show={showLoginAlert}
        // variant="danger"
        onHide={onClose}
        // dismissible
        centered
        size="sm"
      >
        <Modal.Body>Please log in first!</Modal.Body>
      </Modal>
    </>
  );
};

export default LoginAlert;
