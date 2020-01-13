import React, { useState } from "react";
import { Form, Row, Col } from "react-bootstrap";
import {
  MDBBtn,
  MDBModal,
  MDBModalBody,
  MDBModalHeader,
  MDBModalFooter
} from "mdbreact";

const SaveModal = ({ saveModalShow, toggle, onSaveClick }) => {
  /** Share menu value */
  const [menuShareState, setMenuShareState] = useState(true);

  const [menuNameState, setMenuNameState] = useState("");

  return (
    <MDBModal isOpen={saveModalShow} toggle={toggle}>
      <MDBModalHeader toggle={toggle}>One Last Step!</MDBModalHeader>
      <MDBModalBody>
        <Form.Group controlId="menuName" as={Row}>
          <Form.Label column sm="2">
            Name
          </Form.Label>
          <Col sm="8">
            <Form.Control
              type="text"
              placeholder={menuNameState}
              onChange={event => setMenuNameState(event.target.value)}
            />
          </Col>
        </Form.Group>

        <Form.Group controlId="menuShare" as={Row}>
          <Form.Label column sm="2">
            Visibility
          </Form.Label>
          <Col sm="8">
            <Form.Check
              className="menuShareLable"
              type="checkbox"
              label=" Share with our community and get others
                inspired!"
              checked={menuShareState}
              onChange={() => setMenuShareState(!menuShareState)}
            />
          </Col>
        </Form.Group>
      </MDBModalBody>
      <MDBModalFooter>
        <MDBBtn
          onClick={() => onSaveClick(menuShareState, menuNameState)}
          className="generate-btn"
        >
          SAVE
        </MDBBtn>
      </MDBModalFooter>
    </MDBModal>
  );
};

export default SaveModal;
