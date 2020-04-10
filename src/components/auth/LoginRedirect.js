import React from "react";
import { Button } from "react-bootstrap";
import { useHistory, useLocation } from "react-router-dom";

const LoginRedirect = () => {
  const history = useHistory();
  const location = useLocation();

  return (
    <div className="center-text">
      <span style={{ display: "block" }}>Please log in first!</span>
      <Button
        className="btn-modal"
        onClick={() => history.push(`/login`, { from: location.pathname })}
      >
        LOGIN
      </Button>
    </div>
  );
};

export default LoginRedirect;
