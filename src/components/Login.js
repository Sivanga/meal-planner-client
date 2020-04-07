import React from "react";
import { Button } from "mdbreact";
import { logout } from "../store/actions/Actions";
import firebase, { authProviders } from "../firebase";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import "../scss/Login.scss";
import { useAuth } from "./auth/UseAuth";
import { connect } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";

const mapDispatchToProps = dispatch => ({
  logout: (dish, uid) => dispatch(logout())
});

const Login = ({ logout }) => {
  const history = useHistory();
  const location = useLocation();
  var uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: () => {
        // Check if redirect is needed
        if (location.state && location.state.from) {
          const from = location.state.from;
          history.push(from);
        }
      }
    },
    signInFlow: "popup",
    signInOptions: authProviders
  };

  const auth = useAuth();

  return (
    <div>
      {!auth.authState.authStatusReported ? (
        <div>Loading...</div>
      ) : !auth.authState.user ? (
        <div className="login-container">
          <p>Please sign-in:</p>
          <StyledFirebaseAuth
            uiConfig={uiConfig}
            firebaseAuth={firebase.auth()}
          />
        </div>
      ) : (
        <div className="login-container">
          <p>Hello {auth.authState.user.displayName}!</p>
          <Button
            className="login-btn"
            onClick={() => {
              logout();
              firebase.auth().signOut();
            }}
          >
            Sign-out
          </Button>
        </div>
      )}
    </div>
  );
};

const LoginComponent = connect(
  null,
  mapDispatchToProps
)(Login);
export default LoginComponent;
