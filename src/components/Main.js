import React from "react";
import Dishes from "./Dishes.js";
import Menu from "./Menu/Menu";
import Notfound from "./NotFound";
import GenerateMenu from "./Menu/GenerateMenu";

import { Switch, Route } from "react-router-dom";

function Main(props) {
  return (
    <Switch>
      <Route exact path="/" component={Menu} />
      <Route path="/menu" component={Menu} />
      <Route path="/generate" render={props => <GenerateMenu {...props} />} />
      <Route path="/dishes" component={Dishes} />
      <Route component={Notfound} />
    </Switch>
  );
}

export default Main;
