import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import PortalDishCard from "../dishes/PortalDish";
import { CardColumns } from "react-bootstrap";
import "../../scss/PanelDroppable.scss";

/** Dishes panel droppable id  */
export const PANEL_DROPPABLE_ID = "PANEL_DROPPABLE";

const PanelDroppable = ({ dishes, isEditMode }) => {
  return (
    <Droppable droppableId={PANEL_DROPPABLE_ID} isDropDisabled={true}>
      {(droppableProvided, droppableSnapshot) => (
        <div
          ref={droppableProvided.innerRef}
          {...droppableProvided.droppableProps}
          {...droppableProvided.droppablePlaceholder}
        >
          <CardColumns className="panel-cards">
            {dishes.map((dish, index) => (
              <Draggable
                draggableId={dish.id}
                index={index}
                key={index}
                isDragDisabled={!isEditMode}
              >
                {(draggebleProvided, draggebleSnapshot) => (
                  <PortalDishCard
                    dish={dish}
                    provided={draggebleProvided}
                    snapshot={draggebleSnapshot}
                    index={index}
                    isEditMode={isEditMode}
                  />
                )}
              </Draggable>
            ))}
          </CardColumns>
          {droppableProvided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default PanelDroppable;
