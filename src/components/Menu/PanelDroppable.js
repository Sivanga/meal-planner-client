import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import PortalDishCard from "../dishes/PortalDish";

/** Dishes panel droppable id  */
export const PANEL_DROPPABLE_ID = "PANEL_DROPPABLE";

const PanelDroppable = ({ dishes }) => {
  return (
    <Droppable droppableId={PANEL_DROPPABLE_ID} isDropDisabled={true}>
      {(droppableProvided, droppableSnapshot) => (
        <div
          ref={droppableProvided.innerRef}
          {...droppableProvided.droppableProps}
          {...droppableProvided.droppablePlaceholder}
        >
          {dishes.map((dish, index) => (
            <Draggable draggableId={dish._id} index={index} key={index}>
              {(draggebleProvided, draggebleSnapshot) => (
                <PortalDishCard
                  dish={dish}
                  provided={draggebleProvided}
                  snapshot={draggebleSnapshot}
                  index={index}
                />
              )}
            </Draggable>
          ))}
          {droppableProvided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default PanelDroppable;
