/**
This class created in order to wrap a Dish Card in a portal when needed.
Dish card that are presented in a sliding panel (for example in GenerateMenu class) has position absolute with translate 
property. Using beautiful-react-dnd for dragging will misplace this item and therefor a prtal is needed:
https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/patterns/using-a-portal.md */

import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import DishCard, { DishListEnum } from "./DishCard";
import "../../scss/Portal.scss";

const portal: HTMLElement = document.createElement("div");

if (!document.body) {
  throw new Error("body not ready for portal creation!");
}

const PortalDishCard = ({ provided, snapshot, dish, index }) => {
  const usePortal: boolean = snapshot.isDragging;

  useEffect(() => {
    const root = document.getElementById("root");
    root.appendChild(portal);
  });

  const child = (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      <DishCard
        key={index}
        dish={dish}
        index={index}
        dishListEnum={DishListEnum.GENERATE_MENU_LIST}
      />
    </div>
  );

  // if dragging - put the item in a portal, else return the actual child
  if (!usePortal) {
    return child;
  }
  return ReactDOM.createPortal(child, portal);
};

export default PortalDishCard;
