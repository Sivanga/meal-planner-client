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
    if (!props.dishes || props.dishes.length === 0)
      props.fetchDishes(auth.authState.user.uid);
    computeRandomDishes();
  }, [auth, props.dishes]);

  /**
   * Assign random dishes by the size of days and meals
   */
  var computeRandomDishes = () => {
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
    setRandomDishes(randomDishes);
  };

  const [randomDishes, setRandomDishes] = useState(null);

  const [showPanel, setShowPanel] = useState(false);

  const onPanelToggle = () => {
    setShowPanel(!showPanel);
  };

  /**
   * Used to update the state with the edited dishes in randomDishes
   * using onBlur as workaround as onChange is not being called.
   * @param {onBlur} event
   */
  const onDishChange = (event, dayIndex, mealIndex) => {
    const newDish = event.currentTarget.textContent;
    var newrandomDishes = [...randomDishes];
    newrandomDishes[mealIndex][dayIndex] = newDish;
    setRandomDishes(newrandomDishes);
  };

  /**
   * Used to create unique index from the matrix
   */
  const matrixToIndex = (mealIndex, dayIndex) => {
    var index = days.length * mealIndex + dayIndex;
    return index;
  };

  const onDoneClick = () => {
    console.log("randomDishes: ", randomDishes);
  };

  const onDragEnd = ({ source, destination }) => {
    // Dropped outside the table
    if (!destination) return;

    reorderLists(source, destination);
  };

  const reorderLists = (source, destination) => {
    const current = [...randomDishes[source.droppableId]];
    const next = [...randomDishes[destination.droppableId]];
    const target = current[source.index];

    // moving to same list
    if (source.droppableId === destination.droppableId) {
      const reordered = reorder(current, source.index, destination.index);
      const result = {
        ...randomDishes,
        [source.droppableId]: reordered
      };
      setRandomDishes(result);
      return;
    }

    // moving to different list
    // remove from original
    current.splice(source.index, 1);
    // insert into next
    const removed = next.splice(destination.index, 1, target);
    current.splice(source.index, 0, removed[0]);

    const result = {
      ...randomDishes,
      [source.droppableId]: current,
      [destination.droppableId]: next
    };
    console.log("randomDishes\n result: ", result);

    setRandomDishes(result);
    return;
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
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
  if (!props.dataReceived || !randomDishes) {
    return <div className="center-text">Loading...</div>;
  }

  if (props.dishes.length === 0) {
    return <div className="center-text">No Dishes</div>;
  }

  return (
    <DragDropContext onDragEnd={result => onDragEnd(result)}>
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
                  <Droppable
                    droppableId={mealIndex.toString()}
                    key={mealIndex}
                    direction="horizontal"
                  >
                    {(provided, snapshot) => (
                      <li
                        key={mealIndex}
                        className={classNames("item item-container", {
                          isDraggingOver: snapshot.isDraggingOver
                        })}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        {...provided.droppablePlaceholder}
                      >
                        <div key={mealIndex} className="attribute meal-name">
                          {meal}
                        </div>
                        {days.map((day, dayIndex) => (
                          <Draggable
                            draggableId={matrixToIndex(
                              mealIndex,
                              dayIndex
                            ).toString()}
                            index={dayIndex}
                            key={dayIndex}
                          >
                            {(provided, snapshot) => (
                              <div
                                key={dayIndex}
                                className={classNames("attribute", {
                                  mealDisabled: !day.enabled,
                                  isDragging: snapshot.isDragging
                                })}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                {day.enabled &&
                                randomDishes[mealIndex][dayIndex] ? (
                                  <DishCard
                                    dish={randomDishes[mealIndex][dayIndex]}
                                    index={matrixToIndex(mealIndex, dayIndex)}
                                    currentUid={auth.authState.user.uid}
                                    dishListEnum={DishListEnum.NO_LIST}
                                  />
                                ) : null}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </li>
                    )}
                  </Droppable>
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
          Save
        </Button>
      </div>
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
