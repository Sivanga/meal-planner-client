import React from "react";
import "../components/App.js";
import Header from "./Header";
import Main from "./Main.js";
import "../scss/App.scss";

function App() {
  return (
    <div className="App">
      <Header />
      <div className="Main">
        <Main />
      </div>
    </div>
  );
}

export default App;
