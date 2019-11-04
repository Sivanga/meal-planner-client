import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useAuth } from "../auth/UseAuth";
import { fetchMenus } from "../../store/actions/Actions";
import { useHistory } from "react-router-dom";

const mapStateToProps = state => {
  return {
    menus: state.menus.menus,
    dataReceived: state.menus.dataReceived
  };
};

const mapDispatchToProps = dispatch => ({
  fetchMenus: uid => dispatch(fetchMenus(uid))
});

const MenuList = ({ menus, dataReceived, fetchMenus }) => {
  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  let history = useHistory();

  useEffect(() => {
    if (!auth.authState.user) return;

    if (!dataReceived) {
      fetchMenus(auth.authState.user.uid);
    }
  }, [dataReceived, auth, fetchMenus]);

  if (!dataReceived) {
    return <div>Loading...</div>;
  }

  const prettyDate = time => {
    var date = new Date(time);
    return date.toLocaleDateString("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div>
      {menus.map(menu => {
        return (
          <div
            key={menu._id}
            onClick={() => history.push("/menu/generate", { menuData: menu })}
          >
            {prettyDate(menu.date)}
          </div>
        );
      })}
    </div>
  );
};

const MenuListComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(MenuList);
export default MenuListComponent;
