import React from "react";
import { Button } from "mdbreact";
import firebase, { authProviders } from "../firebase";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import "../scss/Login.scss";
import { useAuth } from "./auth/UseAuth";

const Login = () => {
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
            onClick={() => firebase.auth().signOut()}
          >
            Sign-out
          </Button>
        </div>
      )}
    </div>
  );
};

export default Login;
