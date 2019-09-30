import React from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { MDBBtn } from "mdbreact";
import { useAuth } from "../components/auth/UseAuth";

import "../scss/Navbar.scss";

function NavBar() {
  const auth = useAuth();

  return (
    <Navbar bg="white" expand="sm" collapseOnSelect>
      <div className="container">
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav fill className="w-100">
            {/* Wrapped Links in items otherwise fill contect doesn't work */}
            <Nav.Item>
              <Nav.Link as={Link} to="/menu" href="/menu">
                Menu
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/dishes" href="/dishes">
                Dishes
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/myFavorites" href="/myFavorites">
                My Favorites
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/about" href="/about">
                About
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/contact" href="/contact">
                Contact
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                as={Link}
                to="/login"
                href="/login"
                className="nav-login-btn"
              >
                <MDBBtn outline color="elegant">
                  {auth.authState.user
                    ? auth.authState.user.displayName
                    : "Login"}
                </MDBBtn>
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
}

export default NavBar;
