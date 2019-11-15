import React from "react";
import MenuItem from "./MenuItem";
import "../../scss/MenuList.scss";

const MenuList = ({
  menus,
  handleMenuRemove,
  handleMenuAdd,
  menuListEnum,
  currentUid
}) => {
  if (!menus || menus.length === 0) {
    return (
      <div style={{ textAlign: "center" }}>
        You don't have manus saved yet.. <br />
        Would you like to add one?
      </div>
    );
  }
  return (
    <div className="menu-list-container">
      {menus.map(menu => {
        return (
          <MenuItem
            menu={menu}
            key={menu.id}
            handleMenuRemove={handleMenuRemove}
            handleMenuAdd={handleMenuAdd}
            menuListEnum={menuListEnum}
            currentUid={currentUid}
          />
        );
      })}
    </div>
  );
};

export default MenuList;
