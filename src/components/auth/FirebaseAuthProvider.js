import React, { useEffect, useState } from "react";
import { auth, userDbRef } from "../../firebase";
import FirebaseAuthContext from "./FirebaseContext";

const FirebaseAuthProvider = props => {
  const [authState, setAuthState] = useState({
    authStatusReported: false,
    user: null
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log("Firebase provider auth on change. user: ", user);
      setAuthState({ authStatusReported: true, user: user });

      if (user) {
        userDbRef(user.uid).set({ name: user.displayName, email: user.email });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <FirebaseAuthContext.Provider value={authState}>
      {props.children}
    </FirebaseAuthContext.Provider>
  );
};

export default FirebaseAuthProvider;
