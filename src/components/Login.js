import React from "react";
import { Button } from "mdbreact";
import firebase, { authProviders } from "../firebase";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import "../scss/Login.scss";
import FirebaseContext from "./auth/FirebaseContext";

const Login = () => {
  var uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: () => false
    },
    signInFlow: "popup",
    signInOptions: authProviders
  };

  return (
    <FirebaseContext.Consumer>
      {authState => (
        <div>
          {!authState.authStatusReported ? (
            <div>Loading...</div>
          ) : !authState.user ? (
            <div className="login-container">
              {console.log("user", authState.user)}
              <p>Please sign-in:</p>
              <StyledFirebaseAuth
                uiConfig={uiConfig}
                firebaseAuth={firebase.auth()}
              />
            </div>
          ) : (
            <div className="login-container">
              {console.log("user", authState.user)}
              <p>Welcome {authState.user.displayName}!</p>
              <Button
                className="login-btn"
                onClick={() => firebase.auth().signOut()}
              >
                Sign-out
              </Button>
            </div>
          )}
        </div>
      )}
    </FirebaseContext.Consumer>
  );
};

export default Login;
