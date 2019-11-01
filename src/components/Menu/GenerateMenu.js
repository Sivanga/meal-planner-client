import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button } from "mdbreact";
import classNames from "classnames";
import { fetchDishes, fetchPublicDishes } from "../../store/actions/Actions";
import { useAuth } from "../auth/UseAuth";
import { connect } from "react-redux";
import { DragDropContext } from "react-beautiful-dnd";
import TableDroppable from "./TableDroppable";
import PanelDroppable, { PANEL_DROPPABLE_ID } from "./PanelDroppable";
import { getContainerStyle } from "./Helpers";
import { Redirect } from "react-router-dom";
import Burger from "@animated-burgers/burger-arrow";
import "../../../node_modules/@animated-burgers/burger-arrow/dist/styles.css";
import "../../scss/TemplateMenu.scss";
import "../../scss/GenerateMenu.scss";

const mapStateToProps = state => {
  return {
    favoriteDishes: state.dishes.dishes,
    favoriteDataReceived:
      state.dishes.privateDishesDataReceived.privateDishesDataReceived,
    publicDishes: state.dishes.publicDishes,
    publicDataReceived:
      state.dishes.publicDishesDataReceived.publicDishesDataReceived
  };
};

const mapDispatchToProps = dispatch => ({
  fetchDishes: uid => dispatch(fetchDishes(uid)),
  fetchPublicDishes: uid => dispatch(fetchPublicDishes(uid))
});

const GenerateMenu = props => {
  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  /**
  Random dishes array
   */
  const [randomDishes, setRandomDishes] = useState(null);

  /**
   * Show dishes panel
   */
  const [showPanel, setShowPanel] = useState(false);

  /**
   * Show dish plus button, We don't show it while dragging is accuring
   */
  const [showPlusButton, setShowPlusButton] = useState(true);

  /**
   * Fetch private and public dishes. Compute random dishes after all data is received
   */
  useEffect(() => {
    if (!auth.authState.user) return;

    // Fetch private and public dishes
    if (!props.favoriteDataReceived) {
      props.fetchDishes(auth.authState.user.uid);
    }

    if (!props.publicDataReceived) {
      props.fetchPublicDishes(auth.authState.user.uid);
    }

    if (props.favoriteDataReceived && props.publicDataReceived) {
      computeRandomDishes();
    }
  }, [auth, props.favoriteDataReceived, props.publicDataReceived]);

  /**
   * Get days and meals from previous page (menu template)
   If theres no days and meals data, go back main menu page
   */

  if (
    !props.location ||
    !props.location.state ||
    !props.location.state.menuData
  ) {
    return (
      <Redirect
        push
        to={{
          pathname: "/menu"
        }}
      />
    );
  }
  const days = props.location.state.menuData.days;
  const meals = props.location.state.menuData.meals;

  /**
   * Create random dishes array of the length of days and meals.
   Assign dishes randomally
   */
  var computeRandomDishes = () => {
    // Create matrix
    var randomDishes = [];
    meals.map((meal, mealIndex) => {
      console.log("meal:", meal.name);

      // Create array
      randomDishes[mealIndex] = [];

      days.map((day, dayIndex) => {
        // Don't assign a dish for a disabled day
        if (!day.enabled) return (randomDishes[mealIndex][dayIndex] = null);

        // First find a random dish from favorites that matches this meal
        const mealsFavoriteDishes = findDishesForMeal(
          props.favoriteDishes,
          meal
        );
        var mergedDishes = mealsFavoriteDishes;
        console.log("mealsFavoriteDishes.length: ", mealsFavoriteDishes.length);

        // If mealsFavoriteDishes length is less then days length, use public dishes as well
        if (mealsFavoriteDishes.length < days.length) {
          const mealsPublicDishes = findDishesForMeal(props.publicDishes, meal);
          console.log("mealsPublicDishes.length: ", mealsPublicDishes.length);
          mergedDishes = mealsFavoriteDishes.concat(mealsPublicDishes);
          console.log("merged.length: ", mergedDishes.length);
        }

        var randomDish =
          mergedDishes[Math.floor(Math.random() * mergedDishes.length)];
        return (randomDishes[mealIndex][dayIndex] = randomDish);
      });
    });

    // Set result
    setRandomDishes(randomDishes);
  };

  const findDishesForMeal = (dishes, meal) => {
    return dishes.filter(dish =>
      dish.meals.some(currMeal => currMeal.id === meal.id)
    );
  };

  // TODO: Implement
  const onDoneClick = () => {
    console.log("randomDishes: ", randomDishes);
  };

  /**
   * Close the panel when drag starts
   */
  const onDragStart = () => {
    setShowPanel(false);
    setShowPlusButton(false);
  };

  /**
   * Reorder dishes logic when drag ends
   */
  const onDragEnd = ({ source, destination }) => {
    setShowPlusButton(true);

    // Dropped outside the allowed area
    if (!destination) return;

    // Can't drop to a disabled day
    if (!days[destination.index].enabled) return;

    // Dropped from panel dishes
    if (source.droppableId === PANEL_DROPPABLE_ID) {
      // Get the wanted dish
      const dish = props.favoriteDishes[source.index];
      // Replcae with current table dish
      const destinationArray = [...randomDishes[destination.droppableId]];
      destinationArray.splice(destination.index, 1, dish);
      // Set result
      const result = {
        ...randomDishes,
        [destination.droppableId]: destinationArray
      };
      setRandomDishes(result);
      return;
    }

    // Dropped from withing the table
    reorderLists(source, destination);
  };

  /**
   * Reorder dishes from within the table
   */
  const reorderLists = (source, destination) => {
    const current = [...randomDishes[source.droppableId]];
    const next = [...randomDishes[destination.droppableId]];
    const target = current[source.index];

    // moving to same list
    if (source.droppableId === destination.droppableId) {
      const reordered = reorderArray(current, source.index, destination.index);
      const result = {
        ...randomDishes,
        [source.droppableId]: reordered
      };
      setRandomDishes(result);
      return;
    }

    // moving to different list
    // remove from original and insert into next
    current.splice(source.index, 1);
    const removed = next.splice(destination.index, 1, target);
    current.splice(source.index, 0, removed[0]);

    const result = {
      ...randomDishes,
      [source.droppableId]: current,
      [destination.droppableId]: next
    };
    setRandomDishes(result);
    return;
  };

  /**
   * Helper function to reorderArray
   */
  const reorderArray = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onMinusClick = (mealIndex, dayIndex) => {
    console.log("onMinusClick. mealIndex ", mealIndex, " dayIndex: ", dayIndex);
    // const result = [
    //   ...randomDishes,
    //   (randomDishes[mealIndex][dayIndex] = null)
    // ];
    var result = { ...randomDishes };
    result[mealIndex][dayIndex] = null;
    // console.log("result: ", result);
    setRandomDishes(result);
    // console.log("random dishes: ", randomDishes);
  };

  /**
   * If there's no logged in user, show login message
   */
  if (!auth.authState.user && auth.authState.authStatusReported) {
    return (
      <div className="center-text">Please log in to create your own menu!</div>
    );
  }

  /**
   * If dishes data is still loading, show loading message
   */
  if (
    !props.favoriteDataReceived ||
    !props.publicDataReceived ||
    !randomDishes
  ) {
    return <div className="center-text">Loading...</div>;
  }

  return (
    <DragDropContext
      onDragEnd={result => onDragEnd(result)}
      onDragStart={() => onDragStart()}
    >
      <div id="menuContainer" className="generateMenuContainer">
        <div className="generateMenuTableContainer">
          <ol className="collection collection-container generateMenuTable">
            <li className="item item-container" style={getContainerStyle(days)}>
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

              {/* Panl handle at the end of the table head */}
              <Burger
                direction="right"
                isOpen={showPanel}
                onClick={() => setShowPanel(!showPanel)}
              />
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
                onPlusClick={dayIndex => setShowPanel(true)}
                showPlusButton={showPlusButton}
              />
            ))}
          </ol>
          <div
            className={classNames("panel-wrap", showPanel ? "show" : "hide")}
          >
            <PanelDroppable dishes={props.favoriteDishes} />
          </div>
        </div>
      </div>

      <Button className="generate-btn" onClick={() => onDoneClick()}>
        Save
      </Button>
    </DragDropContext>
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
