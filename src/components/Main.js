import React from "react";
import Dishes from "../components/dishes/Dishes";
import Menu from "./Menu/Menu";
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
      <Route exact path="/" component={Dishes} />
      <Route
        path="/menu/generate/:type/:menuId"
        render={props => <GenerateMenu {...props} />}
      />
      <Route
        path="/menu/generate"
        render={props => <GenerateMenu {...props} />}
      />
      <Route path="/menu/newMenu" render={props => <NewMenu {...props} />} />
      <Route path="/menu" component={Menu} />
      <Route path="/dishes" component={Dishes} />
      <Route path="/myFavorites" component={MyFavorites} />
      <Route path="/login" component={Login} />
      <Route path="/contact" component={Contact} />
      <Route path="/about" component={About} />

      <Route component={Notfound} />
    </Switch>
  );
}

export default Main;
