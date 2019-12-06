import React from "react";
import { Button } from "mdbreact";
import { logout } from "../store/actions/Actions";
import firebase, { authProviders } from "../firebase";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import "../scss/Login.scss";
import { useAuth } from "./auth/UseAuth";
import { connect } from "react-redux";

const mapDispatchToProps = dispatch => ({
  logout: (dish, uid) => dispatch(logout())
});

const Login = ({ logout }) => {
  var uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: () => false
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
