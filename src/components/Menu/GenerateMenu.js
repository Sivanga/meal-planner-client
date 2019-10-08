import React, { useMemo, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { MDBTable, MDBTableBody, MDBTableHead, Button } from "mdbreact";
import classNames from "classnames";
import "../../scss/TemplateMenu.scss";
import "../../scss/GenerateMenu.scss";
import { fetchDishes } from "../../store/actions/Actions";
import { disableNewlines } from "../Menu/SharedContentEdible";
import { useAuth } from "../auth/UseAuth";

import { connect } from "react-redux";
import DishCard from "../dishes/DishCard";
import { DishListEnum } from "../dishes/DishCard";
import DishesList from "../dishes/DishesList";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const mapStateToProps = state => {
  return {
    dishes: state.dishes.dishes,
    dataReceived:
      state.dishes.privateDishesDataReceived.privateDishesDataReceived
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

  const [showPanel, setShowPanel] = useState(false);

  const onPanelToggle = () => {
    setShowPanel(!showPanel);
  };

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

  /**
   * Used to create unique index from the matrix
   */
  const matrixToIndex = (mealIndex, dayIndex) => {
    var index = days.length * mealIndex + dayIndex;
    return index;
  };

  const onDoneClick = () => {
    console.log("computeRandomDishes: ", computeRandomDishes);
  };

  const onDragEnd = result => {
    console.log("onDragEnd, result: ", result);

    // Dropped outside the table
    if (!result.destination) return;
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
    <div className="generateMenuContainer">
      <div className="generateMenuTableContainer">
        <input id="clicker" type="checkbox" onClick={() => onPanelToggle()} />

        <div className="dummy-wrapper">
          <div className="generateMenuTable">
            <ol className="collection collection-container">
              <li className="item item-container" key="-1">
                <div key="day/meal" className="attribute">
                  Day/Meal
                </div>
                {/* Days headers */}
                {days.map((day, index) => (
                  <div
                    id="generated-day"
                    key={index}
                    className={classNames("day-column", "attribute", {
                      dayEnabled: "day.enabled"
                    })}
                  >
                    {day.day}
                  </div>
                ))}
              </li>
              {meals.map((meal, mealIndex) => (
                <li key={mealIndex} className="item item-container">
                  <div key="meal-name" className="attribute meal-name">
                    {meal}
                  </div>
                  {days.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={classNames("attribute", {
                        mealDisabled: !day.enabled
                      })}
                    >
                      {day.enabled ? (
                        <DishCard
                          dish={computeRandomDishes[mealIndex][dayIndex]}
                          index={matrixToIndex(mealIndex, dayIndex)}
                          currentUid={auth.authState.user.uid}
                          dishListEnum={DishListEnum.NO_LIST}
                        />
                      ) : null}
                    </div>
                  ))}
                </li>
              ))}
            </ol>
          </div>
          <div
            className={classNames("panel-dummy", showPanel ? "show" : "hide")}
          />
          <div
            className={classNames("panel-wrap", showPanel ? "show" : "hide")}
          >
            <div className="generateMenuFavoriteDishes">
              <DishesList
                dishes={props.dishes}
                dishListEnum={DishListEnum.GENERATE_MENU}
              />
            </div>
          </div>
        </div>
      </div>

      <Button className="generate-btn" onClick={() => onDoneClick()}>
        Done
      </Button>
    </div>
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
