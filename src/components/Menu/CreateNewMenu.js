import React from "react";
import { useHistory } from "react-router-dom";
import { Card } from "react-bootstrap";
import { analytics } from "../../firebase";

import "../../scss/PlusItem.scss";
import "../../scss/CreateNewMenu.scss";

const CreateNewMenu = ({ location }) => {
  /** Used to redirect to template menu after button click */
  let history = useHistory();
  return (
    <Card className="create-menu-card">
      <Card.Body>
        <i
          className="fas fa-plus-circle fa-3x plus-item menu-plus-item"
          onClick={() => {
            history.push("/menu/newMenu");
            analytics.logEvent("create_menu_clicked", {
              location: location
            });
          }}
        />
      </Card.Body>
      <Card.Footer>Create Menu</Card.Footer>
    </Card>
  );
};

export default CreateNewMenu;
