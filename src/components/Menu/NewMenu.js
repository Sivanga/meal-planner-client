import React, { useState } from "react";
import TemplateMenu from "./TemplateMenu";
import { Redirect } from "react-router-dom";

const NewMenu = props => {
  /**
   * Menu data to be generated
   */
  const [menuData, setMenuData] = useState(null);

  /**
   * After menu template has been chosen, set the menu data to be generated
   * @param {days, meals} param0 which days and meals user chose to genereate the menu
   */
  const handleGenerateMenu = (days, meals) => {
    var menuData = {
      days: days,
      meals: meals
    };

    setMenuData(menuData);
  };

  return (
    <>
      {menuData ? (
        <Redirect
          push
          to={{
            pathname: "/generate",
            state: {
              menuData: menuData
            }
          }}
        />
      ) : (
        <TemplateMenu
          handleGenerateMenu={(days, meals) => handleGenerateMenu(days, meals)}
        />
      )}
    </>
  );
};

export default NewMenu;
