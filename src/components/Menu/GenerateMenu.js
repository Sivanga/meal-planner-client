import React, { useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { MDBTable, MDBTableBody, MDBTableHead, Button } from "mdbreact";
import classNames from "classnames";
import "../../scss/TemplateMenu.scss";
import "../../scss/GenerateMenu.scss";
import { fetchDishes } from "../../store/actions/Actions";
import { disableNewlines } from "../Menu/SharedContentEdible";
import { useAuth } from "../auth/UseAuth";

import { connect } from "react-redux";

const mapStateToProps = state => {
  return {
    dishes: state.dishes.dishes,
    dataReceived: state.dishes.dataReceived.dataReceived
  };
};

const mapDispatchToProps = dispatch => ({
  fetchDishes: uid => dispatch(fetchDishes(uid))
});

const GenerateMenu = props => {
  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  /**
   * Get days and meals from previous steap (menu template)
   */
  const days = props.location.state.menuData.days;
  const meals = props.location.state.menuData.meals;

  useEffect(() => {
    if (!auth.authState.user) return;
    props.fetchDishes(auth.authState.user.uid);
  }, [auth]);

  /**
   * useMemo in order to not recompute randomDishes on each render.
   * Assign random dishes by the length of enabled days and meals
   */
  var computeRandomDishes = useMemo(() => {
    if (props.dishes.length === 0) {
      return;
    }
    var randomDishes = [];
    meals.map((meal, mealIndex) => {
      randomDishes[mealIndex] = [];

      days.map((day, dayIndex) => {
        if (!day.enabled) return false;
        var random =
          props.dishes[Math.floor(Math.random() * props.dishes.length)];
        randomDishes[mealIndex][dayIndex] = random;
        return true;
      });

      return true;
    });
    return randomDishes;
  }, [days, meals, props.dishes]);

  /**
   * Used to update the state with the edited dishes in randomDishes
   * using onBlur as workaround as onChange is not being called.
   * @param {onBlur} event
   */
  const onDishChange = (event, dayIndex, mealIndex) => {
    const newDish = event.currentTarget.textContent;
    var newComputeRandomDishes = [...computeRandomDishes];
    newComputeRandomDishes[mealIndex][dayIndex] = newDish;
    computeRandomDishes = newComputeRandomDishes;
  };

  const onDoneClick = () => {
    console.log("computeRandomDishes: ", computeRandomDishes);
  };

  /**
   * If there's no logged in user, show message
   */
  if (!auth.authState.user && auth.authState.authStatusReported) {
    return (
      <div className="center-text">Please log in to create your own menu!</div>
    );
  }

  /**
   * If dishes data is still loading, show message
   */
  if (!props.dataReceived) {
    return <div className="center-text">Loading...</div>;
  }

  if (props.dishes.length === 0) {
    return <div className="center-text">No Dishes</div>;
  }

  return (
    <>
      <MDBTable className="table-bordered">
        <MDBTableHead>
          {/*Empty cell for table left top corner*/}
          <tr>
            <th />
            {/*Days headers*/}
            {days.map((day, index) => (
              <th
                id="generated-day"
                key={index}
                className={classNames("day-column", {
                  dayEnabled: day.enabled
                })}
              >
                {day.day}
              </th>
            ))}
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {meals.map((meal, mealIndex) => (
            <tr key={mealIndex} className="meal-row">
              {/* Row for each meal */}
              <th>{meal}</th>
              {days.map((day, dayIndex) => (
                <td
                  key={dayIndex}
                  className={classNames({
                    mealEnabled: day.enabled
                  })}
                  contentEditable={day.enabled ? "true" : "false"}
                  suppressContentEditableWarning={true}
                  onKeyPress={disableNewlines}
                  onBlur={e => onDishChange(e, dayIndex, mealIndex)}
                >
                  {/* Random dish */}
                  {day.enabled
                    ? computeRandomDishes[mealIndex][dayIndex].name
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </MDBTableBody>
      </MDBTable>
      <Button className="generate-btn" onClick={() => onDoneClick()}>
        Done
      </Button>
    </>
  );
};

GenerateMenu.propTypes = {
  menuData: PropTypes.shape({
    days: PropTypes.array,
    meals: PropTypes.array
  })
};
const GenerateMenuComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(GenerateMenu);
export default GenerateMenuComponent;
