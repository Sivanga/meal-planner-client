import React from "react";

const defaultFirebaseContext = {
  authStatusReported: false,
  isUserSignedIn: false
};

const FirebaseContext = React.createContext(defaultFirebaseContext);

export default FirebaseContext;
