import React from "react";
import { Droppable } from "react-beautiful-dnd";
import classNames from "classnames";
import TableDraggable from "./TableDraggable";

const TableDroppable = ({ mealIndex, meal, days, randomDishes }) => {
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
        >
          <div key={mealIndex} className="attribute meal-name">
            {meal}
          </div>
          {days.map((day, dayIndex) => (
            <TableDraggable
              id={matrixToIndex(mealIndex, dayIndex).toString()}
              dayIndex={dayIndex}
              dayEnabled={day.enabled}
              dish={randomDishes[mealIndex][dayIndex]}
              dishIndex={matrixToIndex(mealIndex, dayIndex)}
            />
          ))}
          {provided.placeholder}
        </li>
      )}
    </Droppable>
  );
};

export default TableDroppable;
