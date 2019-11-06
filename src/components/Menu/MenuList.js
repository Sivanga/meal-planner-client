import React from "react";
import MenuItem from "./MenuItem";
import "../../scss/MenuList.scss";

const MenuList = ({ menus }) => {
  return (
    <div className="menu-list-container">
      {menus.map(menu => {
        return <MenuItem menu={menu} key={menu._id} />;
      })}
    </div>
  );
};

export default MenuList;
