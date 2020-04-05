import React from "react";
import { Button } from "react-bootstrap";
import { useHistory } from "react-router-dom";

const LoginRedirect = () => {
  let history = useHistory();

  return (
    <div className="center-text">
      <span style={{ display: "block" }}>
        Please log in to see your favorites!
      </span>
      <Button className="btn-modal" onClick={() => history.push(`/login`)}>
        LOGIN
      </Button>
    </div>
  );
};

export default LoginRedirect;
