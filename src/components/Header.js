import React from "react";
import Jumbotron from "react-bootstrap/Jumbotron";
import NavBar from "./NavBar";
import "../scss/Header.scss";

function Header(props) {
  var style = {
    marginBottom: "0px",
    height: "270px"
  };
  return (
    <div>
      <div className="header-wrapper" style={style}>
        <Jumbotron>
          {" "}
          <span className="header-small">WEEKLY</span> MENU PLANNER
        </Jumbotron>
      </div>
      <hr />
      <NavBar />
    </div>
  );
}

export default Header;
