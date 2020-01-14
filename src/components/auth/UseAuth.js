import React, { useEffect, useState, useContext, createContext } from "react";
import { authRef, userDbRef } from "../../firebase";

const authContext = createContext();

export function ProvideAuth({ children }) {
  const auth = useProvideAuth();

  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

// Hook for child components to get the auth object
// and re-render when it changes.
export const useAuth = () => {
  return useContext(authContext);
};

function useProvideAuth() {
  const [authState, setAuthState] = useState({
    authStatusReported: false,
    user: null
  });

  useEffect(() => {
    const unsubscribe = authRef.onAuthStateChanged(user => {
      setAuthState({ authStatusReported: true, user: user });

      if (user) {
        userDbRef(user.uid).update({
          name: user.displayName,
          email: user.email
        });
      }
    });
    return () => unsubscribe();
  }, []);

  return {
    authState
  };
}
