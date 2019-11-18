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
