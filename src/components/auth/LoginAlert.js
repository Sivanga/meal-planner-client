import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useHistory, useLocation } from "react-router-dom";

const LoginAlert = ({ showLoginAlert, onClose }) => {
  let history = useHistory();
  const location = useLocation();

  return (
    <>
      <Modal show={showLoginAlert} onHide={onClose} centered size="sm">
        <Modal.Body>Please log in first!</Modal.Body>
        <Modal.Footer>
          <Button className="btn-modal" onClick={onClose}>
            Close
          </Button>
          <Button
            className="btn-modal"
            onClick={() => history.push(`/login`, { from: location.pathname })}
          >
            LOGIN
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LoginAlert;
