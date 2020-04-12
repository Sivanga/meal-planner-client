import React from "react";
import Public from "./public/Public";
import Notfound from "./NotFound";
import GenerateMenu from "./Menu/GenerateMenu";
import NewMenu from "./Menu/NewMenu";
import MyFavorites from "../components/favorites/MyFavorites";
import Login from "./Login";
import Contact from "./Contact";
import About from "./About";

import { Switch, Route } from "react-router-dom";

function Main(props) {
  return (
    <Switch>
      <Route exact path="/" component={Public} />
      <Route
        path="/menu/generate/:type/:menuId/:ownerId?"
        render={props => <GenerateMenu {...props} />}
      />
      <Route
        path="/menu/generate"
        render={props => <GenerateMenu {...props} />}
      />
      <Route path="/menu/newMenu" render={props => <NewMenu {...props} />} />
      <Route path="/public" component={Public} />
      <Route path="/myFavorites" component={MyFavorites} />
      <Route path="/login" component={Login} />
      <Route path="/contact" component={Contact} />
      <Route path="/about" component={About} />
      <Route component={Notfound} />
    </Switch>
  );
}

export default Main;
