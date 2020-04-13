import React from "react";
import ImportDish, { ImportDishType } from "../dishes/ImportDish";
import PrintAndShare from "./PrintAndShare";
import { ButtonGroup, Button } from "mdbreact";

const MenuBar = ({
  isEditMode,
  onEditClick,
  onSaveButtonClick,
  triggerPrintRef,
  triggerShareRef,
  componentRef,
  menuId,
  onAddDish,
  onShareClick,
  handleRandomClick,
  resetClick
}) => {
  return (
    <>
      <ButtonGroup className="menu-bar-btn-group">
        {isEditMode && (
          <>
            <Button
              className="meal-plan-btn first-child"
              onClick={onSaveButtonClick}
            >
              <i className="far fa-save"></i>
              {" SAVE"}
            </Button>

            <ImportDish
              addDish={dish => onAddDish(dish)}
              hideButton={true}
              type={ImportDishType.BUTTON}
              allowRedirect={false}
            />
          </>
        )}
        {!isEditMode && (
          <Button
            className="meal-plan-btn generate-btn generate-menu-edit first-child"
            onClick={onEditClick}
            style={{ marginLeft: 0 }}
          >
            <i className="far fa-edit"></i>
            {" EDIT"}
          </Button>
        )}
        <PrintAndShare
          triggerPrintRef={triggerPrintRef}
          triggerShareRef={triggerShareRef}
          componentRef={componentRef}
          menuId={menuId}
          onShareClick={onShareClick}
          isEditMode={isEditMode}
        />
      </ButtonGroup>
      {isEditMode && (
        <ButtonGroup className="menu-bar-btn-group">
          <Button className="meal-plan-btn first-child" onClick={resetClick}>
            <i className="far fa-trash-alt"></i>
            {" RESET"}
          </Button>

          <Button
            className="generate-btn random-btn"
            onClick={handleRandomClick}
          >
            <i className="fas fa-magic"></i>
            {" Fill Up Automatically!"}
          </Button>
        </ButtonGroup>
      )}
      {!isEditMode && (
        <h6 className="generate-menu-edit-subtitle">
          Want to change dishes and move things around? Click Edit button
        </h6>
      )}
    </>
  );
};

export default MenuBar;
