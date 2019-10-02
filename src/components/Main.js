import React from "react";
import Dishes from "../components/dishes/Dishes";
import Menu from "./Menu/Menu";
import Notfound from "./NotFound";
import GenerateMenu from "./Menu/GenerateMenu";
import MyFavorites from "../components/dishes/MyFavorites";
import Login from "./Login";

import { Switch, Route } from "react-router-dom";

function Main(props) {
  return (
    <Switch>
      <Route exact path="/" component={Dishes} />
      <Route path="/menu" component={Menu} />
      <Route path="/generate" render={props => <GenerateMenu {...props} />} />
      <Route path="/dishes" component={Dishes} />
      <Route path="/myFavorites" component={MyFavorites} />
      <Route path="/login" component={Login} />
      <Route component={Notfound} />
    </Switch>
  );
}

export default Main;
