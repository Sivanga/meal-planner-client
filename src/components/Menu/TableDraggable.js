import React from "react";
import { Draggable } from "react-beautiful-dnd";
import classNames from "classnames";
import DishCard, { DishListEnum } from "../dishes/DishCard";

const TableDraggable = ({ id, dayIndex, dish, dayEnabled, dishIndex }) => {
  return (
    <Draggable draggableId={id} index={dayIndex} key={dayIndex}>
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
            />
          ) : null}
        </div>
      )}
    </Draggable>
  );
};

export default TableDraggable;
