import React from "react";
import { getContainerStyle } from "./Helpers";
import classNames from "classnames";
import TableDroppable from "./TableDroppable";

const MenuTabel = ({
  days,
  meals,
  randomDishes,
  onMinusClick,
  handleDishLock,
  handleDishUnlock,
  setShowPanel,
  showPlusButton,
  isEditMode
}) => {
  return (
    <ol className="generateMenuTable">
      <li className="item-container" style={getContainerStyle(days)}>
        <div key="day/meal" className="attribute">
          Day/Meal
        </div>
        {/* Days headers */}
        {days.map((day, index) => (
          <div
            id="generated-day"
            key={index}
            className={classNames("day-column", "attribute", {
              dayDisabled: !day.enabled
            })}
          >
            {day.day}
          </div>
        ))}
      </li>

      {/* Meals */}
      {meals.map((meal, mealIndex) => (
        <TableDroppable
          key={mealIndex}
          mealIndex={mealIndex}
          meal={meal}
          days={days}
          randomDishes={randomDishes}
          onMinusClick={dayIndex => onMinusClick(mealIndex, dayIndex)}
          handleDishLock={dayIndex => handleDishLock(mealIndex, dayIndex)}
          handleDishUnlock={dayIndex => handleDishUnlock(mealIndex, dayIndex)}
          onPlusClick={dayIndex => setShowPanel(true)}
          showPlusButton={showPlusButton}
          isEditMode={isEditMode}
        />
      ))}
    </ol>
  );
};

export default MenuTabel;
