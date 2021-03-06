import React from "react";
import { Droppable } from "react-beautiful-dnd";
import classNames from "classnames";
import TableDraggable from "./TableDraggable";
import { getContainerStyle } from "./Helpers";
import "../../scss/TableDraggable.scss";

const TableDroppable = ({
  mealIndex,
  meal,
  days,
  randomDishes,
  onMinusClick,
  onPlusClick,
  handleDishLock,
  handleDishUnlock,
  showPlusButton,
  isEditMode,
  onDishClicked,
  setComment
}) => {
  /**
   * Used to create unique index from the matrix
   */
  const matrixToIndex = (mealIndex, dayIndex) => {
    var index = days.length * mealIndex + dayIndex;
    return index;
  };

  return (
    <Droppable
      droppableId={mealIndex.toString()}
      key={mealIndex.toString()}
      direction="horizontal"
    >
      {(provided, snapshot) => (
        <li
          key={mealIndex}
          className={classNames("item item-container", {
            isDraggingOver: snapshot.isDraggingOver
          })}
          ref={provided.innerRef}
          {...provided.droppableProps}
          {...provided.droppablePlaceholder}
          style={getContainerStyle(days)}
        >
          <div key={mealIndex} className="attribute meal-name">
            {meal.name}
          </div>
          {days.map((day, dayIndex) => (
            <TableDraggable
              isEditMode={isEditMode}
              key={dayIndex}
              id={matrixToIndex(mealIndex, dayIndex).toString()}
              dayIndex={dayIndex}
              dayEnabled={day.enabled}
              dish={
                randomDishes[mealIndex]
                  ? randomDishes[mealIndex][dayIndex]
                  : null
              }
              dishIndex={matrixToIndex(mealIndex, dayIndex)}
              onMinusClick={() => onMinusClick(dayIndex)}
              onPlusClick={() => onPlusClick(dayIndex)}
              handleDishLock={() => handleDishLock(dayIndex)}
              handleDishUnlock={() => handleDishUnlock(dayIndex)}
              showPlusButton={showPlusButton}
              onDishClicked={dish => onDishClicked(dish, dayIndex)}
              setComment={comment => setComment(dayIndex, comment)}
            />
          ))}
          {provided.placeholder}
        </li>
      )}
    </Droppable>
  );
};

export default TableDroppable;
