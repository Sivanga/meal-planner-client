import React, { useEffect, useState } from "react";
import { Button } from "mdbreact";
import firebase, { auth } from "../firebase";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import "../scss/Login.scss";

const useAuth = auth => {
  const [authState, setAuthState] = useState({
    isLoading: true,
    user: null
  });
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(authState => {
      setAuthState({ isLoading: false, user: authState });
    });
    return () => unsubscribe();
  }, [auth]);

  return authState;
};

const Login = () => {
  var uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: () => false
    },
    signInFlow: "popup",
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID
    ]
  };

  const { isLoading, user } = useAuth(auth);

  if (isLoading) return <div>Loading...</div>;
  if (!user)
    return (
      <div className="login-container">
        <p>Please sign-in:</p>
        <StyledFirebaseAuth
          uiConfig={uiConfig}
          firebaseAuth={firebase.auth()}
        />
      </div>
    );
  if (user)
    return (
      <div className="login-container">
        <p>Welcome {firebase.auth().currentUser.displayName}!</p>
        <Button className="login-btn" onClick={() => firebase.auth().signOut()}>
          Sign-out
        </Button>
      </div>
    );
};

export default Login;
