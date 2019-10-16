import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import classNames from "classnames";
import DishCard, { DishListEnum } from "../dishes/DishCard";

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
            <Draggable
              draggableId={matrixToIndex(mealIndex, dayIndex).toString()}
              index={dayIndex}
              key={dayIndex}
            >
              {(provided, snapshot) => (
                <div
                  key={dayIndex}
                  className={classNames("attribute", {
                    mealDisabled: !day.enabled,
                    isDragging: snapshot.isDragging
                  })}
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  {day.enabled && randomDishes[mealIndex][dayIndex] ? (
                    <DishCard
                      dish={randomDishes[mealIndex][dayIndex]}
                      index={matrixToIndex(mealIndex, dayIndex)}
                      dishListEnum={DishListEnum.NO_LIST}
                    />
                  ) : null}
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </li>
      )}
    </Droppable>
  );
};

export default TableDroppable;
