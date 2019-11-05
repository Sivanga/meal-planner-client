import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useAuth } from "../auth/UseAuth";
import { fetchMenus } from "../../store/actions/Actions";
import MenuItem from "./MenuItem";
import "../../scss/MenuList.scss";

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

  useEffect(() => {
    if (!auth.authState.user) return;

    if (!dataReceived) {
      fetchMenus(auth.authState.user.uid);
    }
  }, [dataReceived, auth, fetchMenus]);

  if (!dataReceived) {
    return <div>Loading...</div>;
  }

  return (
    <div className="menu-list-container">
      {menus.map(menu => {
        return <MenuItem menu={menu} key={menu._id} />;
      })}
    </div>
  );
};

const MenuListComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(MenuList);
export default MenuListComponent;
