import React, { useState, useEffect } from "react";
import "../../scss/TemplateMenu.scss";
import {
  MDBTable,
  MDBTableBody,
  MDBTableHead,
  Button,
  MDBInput
} from "mdbreact";
import { Alert } from "react-bootstrap";
import classNames from "classnames/bind";
import PropTypes from "prop-types";
import GenerateMenu from "./GenerateMenu";
import { connect } from "react-redux";
import { setMeals, fetchMeals } from "../../store/actions/Actions";
import { useAuth } from "../auth/UseAuth";

const mapStateToProps = state => {
  console.log("state: ", state);
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
    { name: "Breakfast", id: 300 },
    { name: "Lunch", id: 301 },
    { name: "Snack", id: 302 },
    { name: "Dinner", id: 303 }
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

  const [showDaysAlert, setShowDaysAlert] = useState(true);

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
    setMealsState(newMeals);
  };

  /**
   * Add a new meal to state
   */
  const addMeal = () => {
    setAddingNewValue(true);
    var nextId = meals[meals.length - 1].id;
    setMealsState([...meals].concat({ name: "", id: nextId++ }));
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
    setShowDaysAlert(false);
  };

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
      newMenuErros.push("Please add at least one meal");
    }
    setMenuErrors(newMenuErros);
  }, [days, meals]);

  /**
   * Fetch once the user's saved meals
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
  }, [props.dataReceived]);

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
    const newMeal = event.currentTarget.textContent;
    var newMeals = [...meals];
    newMeals[index] = newMeal;
    setMealsState(newMeals);
  };

  const chooseDaysAlert = (
    <Alert show={showDaysAlert} variant="success">
      <p>Choose your wanted days by clicking the headers</p>
      <div className="d-flex justify-content-end">
        <Button
          onClick={() => setShowDaysAlert(false)}
          variant="outline-success"
        >
          OK
        </Button>
      </div>
    </Alert>
  );

  const handleGenerateMenu = () => {
    if (auth.authState.user) {
      props.setMealsBackend(meals, auth.authState.user.uid);
      props.handleGenerateMenu(days, meals);
    }
  };

  if (!props.dataReceived) {
    return <div>Loading... </div>;
  }

  return (
    <>
      {chooseDaysAlert}
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
      <div id="template-menu-table">
        <MDBTable>
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
        <Button
          className={classNames("generate-btn", {
            disabled: menuErrors.length > 0
          })}
          onClick={() => handleGenerateMenu(days, meals)}
        >
          Generate Menu
        </Button>
      </div>
      <span>
        <i
          className="fa fa-plus-square-o fa-xs"
          aria-hidden="false"
          id="plus-icon"
          onClick={() => addMeal()}
        />
      </span>
    </>
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
