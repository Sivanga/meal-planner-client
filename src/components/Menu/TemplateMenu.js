import React, { useState, useEffect } from "react";
import "../../scss/TemplateMenu.scss";
import { MDBTable, MDBTableBody, MDBTableHead, Button } from "mdbreact";
import classNames from "classnames/bind";
import PropTypes from "prop-types";
import GenerateMenu from "./GenerateMenu";
import { disableNewlines } from "../Menu/SharedContentEdible";

const TemplateMenu = props => {
  /**
   * day: Name of the day
   * disabled: if disabled by the user it will not be editable
   */
  const [days, setDays] = useState([
    { day: "Monday", disabled: false },
    { day: "Tuesday", disabled: false },
    { day: "Wednesday", disabled: false },
    { day: "Thursday", disabled: false },
    { day: "Friday", disabled: false },
    { day: "Saturday", disabled: false },
    { day: "Sunday", disabled: false }
  ]);

  /**
   * Maels of the day
   */
  const [meals, setMeals] = useState(["Breakfast", "Lunch", "Dinner"]);

  /**
   * Determine if a new value is being added.
   * Used to focus on the new added value in order to allow editing
   */
  const [addingNewValue, setAddingNewValue] = useState(false);

  /**
   * Used when validate menu before generating a new one
   */
  const [menuErrors, setMenuErrors] = useState([]);

  /**
   * Used to focus on the newest cell that was created when adding a new meal
   */
  const newlyAddedCell = React.createRef();

  /**
   * Remove a meal from state
   */
  const removeMeal = index => {
    var newMeals = [...meals];
    newMeals.splice(index, 1);
    setMeals(newMeals);
  };

  /**
   * Add a new meal to state
   */
  const addMeal = () => {
    setAddingNewValue(true);
    setMeals([...meals].concat(""));
  };

  /**
   * Toggle disable/enable day and update state
   */
  const toggleDisableDay = index => {
    var newDays = [...days];
    newDays.map((day, i) => {
      if (index === i) {
        return (day.disabled = !day.disabled);
      } else {
        return day;
      }
    });
    setDays(newDays);
  };

  /**
   * Focus the newlyAddedCell after render is done
   * Validate the menu after render
   */
  useEffect(function use() {
    if (addingNewValue && newlyAddedCell.current) {
      newlyAddedCell.current.focus();
    }
  });

  /**
   * Depends on days and meals array - if there's any change in this states,
   * validate the menu and update the error state.
   *
   */
  useEffect(() => {
    // Make sure there's at least one day
    // Make sure there's at least one meal
    var newMenuErros = [];
    var enabledDays = days.filter(day => !day.disabled);
    if (enabledDays.length < 1) {
      newMenuErros.push("Please enable at least one day");
    }
    if (meals.length < 1) {
      newMenuErros.push("Please add at least one meal");
    }
    setMenuErrors(newMenuErros);
  }, [days, meals]);

  /**
   * Set addingNewValue to false when edit is done (Tab key)
   */
  const onKeyDown = event => {
    if (event.keyCode === 9) {
      setAddingNewValue(false);
    }
  };

  /**
   * Used to update the state with the new meal
   * This is a workaround as onChange is not being called.
   * @param {onBlur} event
   */
  const onMealChange = (event, index) => {
    const newMeal = event.currentTarget.textContent;
    var newMeals = [...meals];
    newMeals[index] = newMeal;
    setMeals(newMeals);
  };

  return (
    <>
      <MDBTable>
        <MDBTableHead>
          <tr>
            {/*Empty cells for table left top corner*/}
            <th />
            <th />

            {/*Days headers*/}
            {days.map((day, index) => (
              <th
                key={index}
                className={classNames("day-column", {
                  "day-disable": day.disabled
                })}
                onClick={() => toggleDisableDay(index)}
              >
                {day.day}
              </th>
            ))}
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {meals.map((meal, index) => (
            <tr key={index} className="meal-row">
              {/* First cell is a button to remove meal row */}
              <td className="remove-row-wrapper">
                <i
                  className="fa fa-minus-square-o"
                  id="remove-row"
                  aria-hidden="false"
                  onClick={() => removeMeal(index)}
                ></i>
              </td>

              {/* Row for each meal */}
              <th
                contentEditable="true"
                suppressContentEditableWarning={true}
                onKeyPress={disableNewlines}
                onKeyDown={onKeyDown}
                ref={newlyAddedCell}
                onBlur={e => onMealChange(e, index)}
              >
                {meal}
              </th>
              {days.map((day, index) => (
                <td
                  key={index}
                  className={classNames({
                    "meal-disable": day.disabled
                  })}
                >
                  {/* Empty cell for meal. 
                  This will be auto generated in the next step!*/}
                </td>
              ))}
            </tr>
          ))}
        </MDBTableBody>
      </MDBTable>
      <span>
        <i
          className="fa fa-plus-square-o fa-xs"
          aria-hidden="false"
          id="plus-icon"
          onClick={() => addMeal()}
        />
      </span>
      {/* Validation Error*/}
      {menuErrors.length > 0 && (
        <div>
          {menuErrors.map((error, index) => (
            <div key={index} className="menu-error">
              {error}
            </div>
          ))}
        </div>
      )}
      <Button
        className={classNames("generate-btn", {
          disabled: menuErrors.length > 0
        })}
        onClick={() => props.handleGenerateMenu(days, meals)}
      >
        Generate Menu
      </Button>
    </>
  );
};

GenerateMenu.propTypes = {
  handleGenerateMenu: PropTypes.func
};

export default TemplateMenu;
