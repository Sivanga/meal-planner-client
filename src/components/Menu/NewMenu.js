import React, { useState } from "react";
import TemplateMenu from "./TemplateMenu";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { useLocation } from "react-router-dom";
import { setMenuInStore } from "../../store/actions/Menus";

const mapStateToProps = state => {
  return {
    menuData: state.menus.menu
  };
};

const mapDispatchToProps = dispatch => ({
  setMenuInStore: menuData => dispatch(setMenuInStore(menuData))
});

const NewMenu = ({ menuData, setMenuInStore }) => {
  const location = useLocation();

  /** Used to hold extraDishInfo data and pass to generate menu*/
  const [extraDishInfo] = useState(
    location.state && location.state.extraDishInfo
      ? location.state.extraDishInfo
      : null
  );

  /**
   * After menu template has been chosen, set the menu data to be generated
   * @param {days, meals} param0 which days and meals user chose to genereate the menu
   */
  const handleGenerateMenu = (days, meals) => {
    var menuData = {
      days: days,
      meals: meals
    };

    setMenuInStore(menuData);
  };

  return (
    <>
      {menuData ? (
        <Redirect
          push
          to={{
            pathname: "/menu/generate",
            state: {
              newGeneratedMenu: true,
              menuData: menuData,
              extraDishInfo: extraDishInfo
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

const NewMenuComp = connect(
  mapStateToProps,
  mapDispatchToProps
)(NewMenu);
export default NewMenuComp;
