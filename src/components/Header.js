import React from "react";
import Jumbotron from "react-bootstrap/Jumbotron";
import NavBar from "./NavBar";
import { useHistory } from "react-router-dom";
import "../scss/Header.scss";

const Header = () => {
  let history = useHistory();

  return (
    <div>
      <div className="header-wrapper" onClick={() => history.push(`/public`)}>
        <div className="jumbotron">
          {" "}
          <span className="header-small">PURE</span> MEAL PLAN
        </div>
      </div>
      <hr />
      <NavBar />
    </div>
  );
};

export default Header;
