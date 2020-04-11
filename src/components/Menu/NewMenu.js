import React, { useState } from "react";
import TemplateMenu from "./TemplateMenu";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { useLocation } from "react-router-dom";
import { setMenuInStore, resetMenuState } from "../../store/actions/Menus";

const mapStateToProps = state => {
  return {
    menuData: state.menus.menu.menu,
    isEditMode: state.menus.menu.isEditMode
  };
};

const mapDispatchToProps = dispatch => ({
  setMenuInStore: (menuData, isEditMode) =>
    dispatch(setMenuInStore(menuData, isEditMode)),
  resetMenuState: () => dispatch(resetMenuState())
});

const NewMenu = ({
  menuData,
  setMenuInStore,
  resetMenuState,
  isDraftMenu,
  isEditMode
}) => {
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
    // First reset the saved menu data state in store */
    resetMenuState();

    // Set the newly created menu in store
    var menuData = {
      days: days,
      meals: meals
    };
    setMenuInStore(menuData, true);
  };

  return (
    <>
      {console.log("menuData: ", menuData, " isEditMode: ", isEditMode)}
      {/** If menu data exist and isEditMode, go to the men data,
      Otherwise start a new one */}
      {menuData && isEditMode ? (
        <Redirect
          push
          to={{
            pathname: "/menu/generate",
            state: {
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
