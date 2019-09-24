import React from "react";
import "../components/App.js";
import Header from "./Header";
import Main from "./Main.js";
import "../scss/App.scss";
import { ProvideAuth } from "./auth/UseAuth";

const App = () => {
  return (
    <ProvideAuth>
      <div className="App">
        <Header />
        <div className="Main">
          <Main />
        </div>
      </div>
    </ProvideAuth>
  );
};

export default App;
