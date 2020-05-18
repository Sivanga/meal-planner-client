import React from "react";
import { useAuth } from "../auth/UseAuth";
import "../../scss/Dishes.scss";
import "../../scss/MyFavorite.scss";
import { MDBBadge } from "mdbreact";
import FavoriteDishes from "./FavoriteDishes";
import FavoriteMenus from "./FavoriteMenus";
import classNames from "classnames";
import { connect } from "react-redux";
import {
  setPreviousLocationFavorites,
  ACTIVE_VIEW_DISHES,
  ACTIVE_VIEW_MENUS
} from "../../store/actions/PreviousLocation";
import { analytics } from "../../firebase";

const mapStateToProps = state => {
  return {
    activeView: state.previousLocation.myFavoriteLocation
  };
};

const mapDispatchToProps = dispatch => ({
  setActiveView: activeView =>
    dispatch(setPreviousLocationFavorites(activeView))
});

const MyFavorites = ({ activeView, setActiveView }) => {
  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  return (
    <div>
      <h5 className="sub-title"> My Favorite</h5>
      <div className="favorite-pills">
        <MDBBadge
          pill
          color="primary"
          className={classNames("meal-pill", {
            active: activeView === ACTIVE_VIEW_DISHES
          })}
          onClick={() => {
            setActiveView(ACTIVE_VIEW_DISHES);
            analytics.logEvent("list_tab_clicked", {
              location: "FAVORITES",
              type: "DISHES"
            });
          }}
        >
          Dishes
        </MDBBadge>

        <MDBBadge
          pill
          color="primary"
          className={classNames("meal-pill", {
            active: activeView === ACTIVE_VIEW_MENUS
          })}
          onClick={() => {
            setActiveView(ACTIVE_VIEW_MENUS);
            analytics.logEvent("list_tab_clicked", {
              location: "FAVORITES",
              type: "MENUS"
            });
          }}
        >
          Menus
        </MDBBadge>
      </div>
      {activeView === ACTIVE_VIEW_DISHES && <FavoriteDishes auth={auth} />}
      {activeView === ACTIVE_VIEW_MENUS && <FavoriteMenus auth={auth} />}
    </div>
  );
};

const MyFavoritesComp = connect(
  mapStateToProps,
  mapDispatchToProps
)(MyFavorites);
export default MyFavoritesComp;
