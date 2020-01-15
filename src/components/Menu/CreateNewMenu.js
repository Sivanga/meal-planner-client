import React from "react";
import { useHistory } from "react-router-dom";
import { Card } from "react-bootstrap";

import "../../scss/PlusItem.scss";
import "../../scss/CreateNewMenu.scss";

const CreateNewMenu = () => {
  /** Used to redirect to template menu after button click */
  let history = useHistory();

  return (
    <Card className="create-menu-card">
      <Card.Body>
        <i
          className="fas fa-plus-circle fa-3x plus-item menu-plus-item"
          onClick={() => history.push("/menu/newMenu")}
        />
      </Card.Body>
      <Card.Footer>Create Menu</Card.Footer>
    </Card>
  );
};

export default CreateNewMenu;
