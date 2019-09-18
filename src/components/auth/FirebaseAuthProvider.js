import React, { useEffect, useState } from "react";
import { auth } from "../../firebase";
import FirebaseAuthContext from "./FirebaseContext";

const FirebaseAuthProvider = props => {
  const [authState, setAuthState] = useState({
    authStatusReported: false,
    isUserSignedIn: false
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setAuthState({ authStatusReported: false, isUserSignedIn: !!user });
    });
    return () => unsubscribe();
  }, []);

  return (
    <FirebaseAuthContext.Provider value={{ authState }}>
      {props.children}
    </FirebaseAuthContext.Provider>
  );
};

export default FirebaseAuthProvider;
