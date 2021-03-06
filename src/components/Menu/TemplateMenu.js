import React, { useState, useEffect } from "react";
import "../../scss/TemplateMenu.scss";
import {
  MDBTable,
  MDBTableBody,
  MDBTableHead,
  Button,
  MDBInput
} from "mdbreact";
import classNames from "classnames/bind";
import PropTypes from "prop-types";
import GenerateMenu from "./GenerateMenu";
import { connect } from "react-redux";
import {
  setMealsBackend,
  setMealsState,
  fetchMeals
} from "../../store/actions/Actions";
import { useAuth } from "../auth/UseAuth";
import { analytics } from "../../firebase";

const mapStateToProps = state => {
  return {
    mealsBackend: state.meals.mealsBackend,
    mealsState: state.meals.mealsState,
    dataReceived: state.meals.dataReceived
  };
};

const mapDispatchToProps = dispatch => ({
  setMealsBackend: (payload, uid) => dispatch(setMealsBackend(payload, uid)),
  setMealsState: payload => dispatch(setMealsState(payload)),
  fetchMeals: uid => dispatch(fetchMeals(uid))
});

const TemplateMenu = ({
  mealsBackend,
  mealsState,
  dataReceived,
  setMealsBackend,
  setMealsState,
  fetchMeals,
  handleGenerateMenu
}) => {
  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  /**
   * day: Name of the day
   * enabled: if enabled by the user it will be editable
   */
  const [days, setDays] = useState([
    { day: "Monday", enabled: true },
    { day: "Tuesday", enabled: true },
    { day: "Wednesday", enabled: true },
    { day: "Thursday", enabled: true },
    { day: "Friday", enabled: true },
    { day: "Saturday", enabled: true },
    { day: "Sunday", enabled: true }
  ]);

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
   * Focus the newlyAddedCell after render is done
   * Validate the menu after render
   */
  useEffect(() => {
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
    var enabledDays = days.filter(day => day.enabled);
    if (enabledDays.length < 1) {
      newMenuErros.push("Please enable at least one day");
    }
    if (mealsState.length < 1) {
      newMenuErros.push("Please have at least one meal");
    }

    setMenuErrors(newMenuErros);
  }, [days, mealsState]);

  /**
   * Fetch meals from store.
   */
  useEffect(() => {
    if (!auth.authState.user) return;

    if (!dataReceived) {
      fetchMeals(auth.authState.user.uid);
    }
  }, [dataReceived, auth, fetchMeals]);

  /**
   * Remove a meal from state
   */
  const removeMeal = index => {
    // Make sure there's at least one meal
    if (mealsState.length === 1) {
      return;
    }

    var newStateMeals = [...mealsState];
    newStateMeals.splice(index, 1);
    setMealsState(newStateMeals);
  };

  /**
   * Add a new meal to state
   */
  const addMeal = index => {
    // Generate new meal id
    const mealsCopy = [...mealsState];
    mealsCopy.splice(index, 0, { name: "" });
    setMealsState(mealsCopy);
  };

  /**
   * Toggle disable/enable day and update state
   */
  const toggleEnableDay = index => {
    var newDays = [...days];
    newDays.map((day, i) => {
      if (index === i) {
        return (day.enabled = !day.enabled);
      } else {
        return day;
      }
    });
    setDays(newDays);
  };

  /**
   * Set addingNewValue to false when edit is done (Tab key)
   */
  const onKeyDown = (event, index) => {
    // When Tab or Enter are pressed, not new value is being added, this helps to focus on the next value at Render
    if (event.keyCode === 9 || event.keyCode === 13) {
      setAddingNewValue(false);
    }
    // Loose focus on Enter key
    if (event.keyCode === 13) {
      event.preventDefault();
      event.stopPropagation();
      event.target.blur();
    }
  };

  /**
   * Used to update the state with the new meal
   * This is a workaround as onChange is not being called.
   * @param {onBlur} event
   */
  const onMealChange = (event, index) => {
    const newMealText = event.currentTarget.textContent;
    const newMeal = { ...mealsState[index] };
    newMeal.name = newMealText;
    const mealsCopy = [...mealsState];
    mealsCopy[index] = newMeal;
    setMealsState(mealsCopy);
  };

  const onGenerateMenuClick = () => {
    // Filter empty meals
    var finalMeals = mealsState.filter(meal => {
      return meal.name.length > 0;
    });

    // Analytics
    analytics.logEvent("create_menu_template_created", {
      days: days,
      meals: finalMeals
    });

    // Set meals in the backend if user is connected
    if (auth.authState.user) {
      setMealsBackend(finalMeals, auth.authState.user.uid);
    }
    handleGenerateMenu(days, finalMeals);
  };

  return (
    <div className="wrapper">
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

      <MDBTable id="template-menu-table">
        <Button
          className={classNames("save-template-btn", "meal-plan-btn", {
            disabled: menuErrors.length > 0
          })}
          onClick={() => onGenerateMenuClick()}
        >
          GO
        </Button>
        <MDBTableHead>
          <tr>
            {/*Empty cells for table left top corner*/}
            <th />
            <th>Days/Meals</th>

            {/*Days headers*/}
            {days.map((day, index) => (
              <th
                key={index}
                className={classNames("day-column", {
                  dayEnabled: day.enabled
                })}
              >
                <MDBInput
                  checked={day.enabled}
                  type="radio"
                  onClick={() => toggleEnableDay(index)}
                  className="tampleateMenuDayInput"
                />
                {day.day}
              </th>
            ))}
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {mealsState.map((meal, index) => (
            <tr key={index} className="meal-row">
              {/* First cell is a button to remove meal row */}
              <th className="add-remove-meals">
                <i
                  className="fa fa-plus-square fa-xs "
                  onClick={() => addMeal(index)}
                />
                <i
                  className="fa fa-minus-square fa-xs"
                  onClick={() => removeMeal(index)}
                />
              </th>
              {/* Row for each meal */}
              <th
                contentEditable="true"
                suppressContentEditableWarning={true}
                onKeyDown={event => onKeyDown(event, index)}
                ref={newlyAddedCell}
                onBlur={e => onMealChange(e, index)}
                className="meal"
              >
                {meal.name}
              </th>
              {days.map((day, index) => (
                <td
                  key={index}
                  className={classNames({
                    mealEnabled: day.enabled
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
    </div>
  );
};

GenerateMenu.propTypes = {
  handleGenerateMenu: PropTypes.func
};

const TemplateMenuComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(TemplateMenu);
export default TemplateMenuComponent;
