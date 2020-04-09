import React, { useState } from "react";
import "../../scss/Dishes.scss";
import "../../scss/MyFavorite.scss";
import { MDBBadge } from "mdbreact";
import classNames from "classnames";
import Menu from "../Menu/Menu";
import Dishes from "../../components/dishes/Dishes";
import { useAuth } from "../auth/UseAuth";
import { connect } from "react-redux";
import {
  setPreviousLocationPublic,
  ACTIVE_VIEW_DISHES,
  ACTIVE_VIEW_MENUS
} from "../../store/actions/PreviousLocation";

const mapStateToProps = state => {
  return {
    activeView: state.previousLocation.publicLocation
  };
};

const mapDispatchToProps = dispatch => ({
  setActiveView: activeView => dispatch(setPreviousLocationPublic(activeView))
});

const Public = ({ activeView, setActiveView }) => {
  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

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

const PublicComp = connect(
  mapStateToProps,
  mapDispatchToProps
)(Public);
export default PublicComp;
