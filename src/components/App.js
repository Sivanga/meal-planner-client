import React from "react";
import "../components/App.js";
import Header from "./Header";
import Main from "./Main.js";
import "../scss/App.scss";
import FirebaseAuthProvider from "./auth/FirebaseAuthProvider";

const App = () => {
  return (
    <FirebaseAuthProvider>
      <div className="App">
        <Header />
        <div className="Main">
          <Main />
        </div>
      </div>
    </FirebaseAuthProvider>
  );
};

export default App;
