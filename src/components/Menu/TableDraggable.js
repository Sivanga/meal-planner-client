import React from "react";
import { Draggable } from "react-beautiful-dnd";
import classNames from "classnames";
import DishCard, { DishListEnum } from "../dishes/DishCard";
import "../../scss/TableDraggable.scss";
import { analytics } from "../../firebase";

const TableDraggable = ({
  id,
  dayIndex,
  dish,
  dayEnabled,
  dishIndex,
  onMinusClick,
  onPlusClick,
  showPlusButton,
  isEditMode,
  handleDishUnlock,
  handleDishLock,
  onDishClicked,
  setComment
}) => {
  return (
    <Draggable
      draggableId={id}
      index={dayIndex}
      key={dayIndex}
      isDragDisabled={!dayEnabled || !isEditMode}
    >
      {(provided, snapshot) => (
        <div
          key={dayIndex}
          className={classNames("attribute", {
            mealDisabled: !dayEnabled,
            isDragging: snapshot.isDragging
          })}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {dayEnabled && dish ? (
            <DishCard
              dish={dish}
              index={dishIndex}
              dishListEnum={DishListEnum.NO_LIST}
              handleDishMinusClick={() => onMinusClick()}
              isEditMode={isEditMode}
              handleDishLock={handleDishLock}
              handleDishUnlock={handleDishUnlock}
              onClick={dish => {
                analytics.logEvent("view/edit_dish_clicked", {
                  location: "MENU",
                  dish: dish
                });
                onDishClicked(dish);
              }}
              setComment={comment => setComment(comment)}
            />
          ) : (
            isEditMode && (
              <span
                className="tableDraggabblePlusWrapper"
                onClick={() => onPlusClick()}
              >
                <i
                  className={classNames("fas fa-plus-circle", {
                    hide: !showPlusButton || !dayEnabled
                  })}
                ></i>
              </span>
            )
          )}
        </div>
      )}
    </Draggable>
  );
};

export default TableDraggable;
