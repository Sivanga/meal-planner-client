import React, { useState, useEffect } from "react";
import MenuItem from "./MenuItem";
import "../../scss/MenuList.scss";

const MenuList = ({
  menus,
  handleMenuRemove,
  handleMenuAdd,
  menuListEnum,
  currentUid,
  onOptionItemClick
}) => {
  /** Show / hide options on selected menu */
  const [clickedMenu, setClickedMenu] = useState(null);

  useEffect(() => {
    // Reset the clicked dish id after menu item was clicked
    setClickedMenu("");
  }, [onOptionItemClick]);

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
            clickedMenu={clickedMenu}
            onClick={id => setClickedMenu(id)}
          />
        );
      })}
    </div>
  );
};

export default MenuList;
