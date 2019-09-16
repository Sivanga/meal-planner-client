import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { MDBTable, MDBTableBody, MDBTableHead, Button } from "mdbreact";
import classNames from "classnames";
import "../../scss/TemplateMenu.scss";
import "../../scss/GenerateMenu.scss";
import { disableNewlines } from "../Menu/SharedContentEdible";
import { connect } from "react-redux";

const mapStateToProps = state => {
  return { dishes: state.dishes };
};

const GenerateMenu = props => {
  const days = props.location.state.menuData.days;
  const meals = props.location.state.menuData.meals;

  /**
   * useMemo in order to not recompute randomDishes on each render.
   * Assign random dishes by the length of enabled days and meals
   */
  var computeRandomDishes = useMemo(() => {
    var randomDishes = [];
    meals.map((meal, mealIndex) => {
      randomDishes[mealIndex] = [];

      days.map((day, dayIndex) => {
        if (day.disabled) return false;
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
                  "day-disable": day.disabled
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
                    "meal-disable": day.disabled
                  })}
                  contentEditable={day.disabled ? "false" : "true"}
                  suppressContentEditableWarning={true}
                  onKeyPress={disableNewlines}
                  onBlur={e => onDishChange(e, dayIndex, mealIndex)}
                >
                  {/* Random dish */}
                  {!day.disabled
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
const GenerateMenuComponent = connect(mapStateToProps)(GenerateMenu);
export default GenerateMenuComponent;
