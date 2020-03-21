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
import { setMeals, fetchMeals } from "../../store/actions/Actions";
import { useAuth } from "../auth/UseAuth";
import LoginAlert from "../auth/LoginAlert";

const mapStateToProps = state => {
  return {
    backendMeals: state.meals.meals,
    dataReceived: state.meals.dataReceived
  };
};

const mapDispatchToProps = dispatch => ({
  setMealsBackend: (payload, uid) => dispatch(setMeals(payload, uid)),
  fetchMeals: uid => dispatch(fetchMeals(uid))
});

const TemplateMenu = props => {
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
   * Maels of the day
   */
  const [meals, setMealsState] = useState([
    { name: "Breakfast" },
    { name: "Lunch" },
    { name: "Snack" },
    { name: "Dinner" }
  ]);

  /**
   * Determine if a new value is being added.
   * Used to focus on the new added value in order to allow editing
   */
  const [addingNewValue, setAddingNewValue] = useState(false);

  /** Used to show login modal */
  const [showLoginModal, setShowLoginModal] = useState(false);

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
    if (meals.length < 1) {
      newMenuErros.push("Please have at least one meal");
    }

    setMenuErrors(newMenuErros);
  }, [days, meals]);

  /**
   * Fetch only once the user's saved meals
   */
  useEffect(() => {
    if (!auth.authState.user) return;
    props.fetchMeals(auth.authState.user.uid);
  }, []);

  /**
   * After the saved meals are fetched, set the result into local meals
   */
  useEffect(() => {
    if (!auth.authState.user) return;

    // If data already recieved set it to state
    if (
      props.dataReceived &&
      props.backendMeals &&
      props.backendMeals.length > 0
    ) {
      setMealsState(props.backendMeals);
    }
  }, [props.dataReceived, props.backendMeals, auth]);

  /**
   * Remove a meal from state
   */
  const removeMeal = index => {
    // Make sure there's at least one meal
    if (meals.length === 1) {
      return;
    }

    var newMeals = [...meals];
    newMeals.splice(index, 1);
    setMealsState(newMeals);
  };

  /**
   * Add a new meal to state
   */
  const addMeal = index => {
    // Generate new meal id
    const mealsCopy = [...meals];
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
    const newMeal = { ...meals[index] };
    newMeal.name = newMealText;
    const mealsCopy = [...meals];
    mealsCopy[index] = newMeal;
    setMealsState(mealsCopy);
  };

  const handleGenerateMenu = () => {
    if (auth.authState.user) {
      props.setMealsBackend(meals, auth.authState.user.uid);
      props.handleGenerateMenu(days, meals);
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="wrapper">
      <LoginAlert
        showLoginAlert={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

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
          className={classNames("save-template-btn", {
            disabled: menuErrors.length > 0
          })}
          onClick={() => handleGenerateMenu(days, meals)}
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
          {meals.map((meal, index) => (
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
