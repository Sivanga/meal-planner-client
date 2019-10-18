import React from "react";
import Jumbotron from "react-bootstrap/Jumbotron";
import NavBar from "./NavBar";
import "../scss/Header.scss";
function Header() {
  return (
    <div>
      <div className="header-wrapper">
        <div className="jumbotron">
          {" "}
          <span className="header-small">PURE</span> MEAL PLAN
        </div>
      </div>
      <hr />
      <NavBar />
    </div>
  );
}

export default Header;
