import React, { useState } from "react";
import "../../scss/Dishes.scss";
import "../../scss/MyFavorite.scss";
import { MDBBadge } from "mdbreact";
import classNames from "classnames";
import Menu from "../Menu/Menu";
import Dishes from "../../components/dishes/Dishes";
import { useAuth } from "../auth/UseAuth";

const ACTIVE_VIEW_DISHES = "ACTIVE_VIEW_DISHES";
const ACTIVE_VIEW_MENUS = "ACTIVE_VIEW_MENUS";

const MyFavorites = props => {
  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  const [activeView, setActiveView] = useState(ACTIVE_VIEW_DISHES);

  return (
    <div>
      <h5 className="sub-title">Other's dishes and menus</h5>
      <div className="favorite-pills">
        <MDBBadge
          pill
          color="primary"
          className={classNames("meal-pill", {
            active: activeView === ACTIVE_VIEW_DISHES
          })}
          onClick={() => setActiveView(ACTIVE_VIEW_DISHES)}
        >
          Dishes
        </MDBBadge>

        <MDBBadge
          pill
          color="primary"
          className={classNames("meal-pill", {
            active: activeView === ACTIVE_VIEW_MENUS
          })}
          onClick={() => setActiveView(ACTIVE_VIEW_MENUS)}
        >
          Menus
        </MDBBadge>
      </div>
      {activeView === ACTIVE_VIEW_DISHES && <Dishes auth={auth} />}
      {activeView === ACTIVE_VIEW_MENUS && <Menu auth={auth} />}
    </div>
  );
};

export default MyFavorites;
