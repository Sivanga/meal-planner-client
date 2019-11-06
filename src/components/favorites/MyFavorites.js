import React, { useState } from "react";
import { useAuth } from "../auth/UseAuth";
import "../../scss/Dishes.scss";
import "../../scss/MyFavorite.scss";
import { MDBBadge } from "mdbreact";
import FavoriteDishes from "./FavoriteDishes";
import FavoriteMenus from "./FavoriteMenus";
import classNames from "classnames";

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
      {activeView === ACTIVE_VIEW_DISHES && <FavoriteDishes auth={auth} />}
      {activeView === ACTIVE_VIEW_MENUS && <FavoriteMenus auth={auth} />}
    </div>
  );
};

export default MyFavorites;
