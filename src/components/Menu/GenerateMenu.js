import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button } from "mdbreact";
import classNames from "classnames";
import {
  fetchDishes,
  fetchPublicDishes,
  setMenu
} from "../../store/actions/Actions";
import { useAuth } from "../auth/UseAuth";
import { connect } from "react-redux";
import { DragDropContext } from "react-beautiful-dnd";
import TableDroppable from "./TableDroppable";
import PanelDroppable, { PANEL_DROPPABLE_ID } from "./PanelDroppable";
import { getContainerStyle } from "./Helpers";
import { Redirect } from "react-router-dom";
import Burger from "@animated-burgers/burger-arrow";
import {
  MDBBtn,
  MDBModal,
  MDBModalBody,
  MDBModalHeader,
  MDBModalFooter
} from "mdbreact";
import { Form, Row, Col } from "react-bootstrap";
import { useHistory } from "react-router-dom";

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
  fetchPublicDishes: uid => dispatch(fetchPublicDishes(uid)),
  setMenu: (payload, uid) => dispatch(setMenu(payload, uid))
});

const GenerateMenu = props => {
  /** Used to redirect to menus list after saving the menu */
  let history = useHistory();

  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  /**
  Random dishes array
   */
  var initialRandomDishes = null;
  if (
    props.location &&
    props.location.state &&
    props.location.state.menuData &&
    props.location.state.menuData.dishes
  ) {
    initialRandomDishes = props.location.state.menuData.dishes;
  }
  const [randomDishes, setRandomDishes] = useState(initialRandomDishes);

  /**
   * Show dishes panel
   */
  const [showPanel, setShowPanel] = useState(false);

  /**
   * Show dish plus button, We don't show it while dragging is accuring
   */
  const [showPlusButton, setShowPlusButton] = useState(true);

  /** Save modal is shown */
  const [saveModalShow, setSaveModalShow] = useState(false);

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

    // Compute random dishes if there's no dishes in props and favorite and public dishes received
    if (
      !randomDishes &&
      (props.favoriteDataReceived && props.publicDataReceived)
    ) {
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

        // If mealsFavoriteDishes length is less then days length, use public dishes as well
        if (mealsFavoriteDishes.length < days.length) {
          const mealsPublicDishes = findDishesForMeal(props.publicDishes, meal);
          mergedDishes = mealsFavoriteDishes.concat(mealsPublicDishes);
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
    var mealResult = { ...randomDishes };
    mealResult[mealIndex][dayIndex] = null;

    setRandomDishes(mealResult);
  };

  const onDoneClick = (menuShareState, menuNameState) => {
    // Generate menu preview
    var images = [];
    for (var i = 0; i < days.length; i++) {
      for (var j = 0; j < days.length; j++) {
        // Add this image only if it's not already exist
        if (
          randomDishes[i] &&
          randomDishes[i][j] &&
          randomDishes[i][j].imageUrl &&
          !images.includes(randomDishes[i][j].imageUrl)
        ) {
          images.push(randomDishes[i][j].imageUrl);
        }
      }
    }

    // Shuffle the array and save
    var previewImages = shuffle(images);

    // Send generated menu to backend
    const menu = {
      date: Date.now(),
      days: days,
      meals: meals,
      dishes: randomDishes,
      previewImages: previewImages,
      sharePublic: menuShareState,
      name: menuNameState
    };

    props.setMenu(menu, auth.authState.user.uid);

    setSaveModalShow(false);

    history.push("/myFavorites", { activeView: "ACTIVE_VIEW_MENUS" });
  };

  /** Shuffle array for randomized menu preview */

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

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

  const SaveModal = () => {
    /** Share menu value */
    const [menuShareState, setMenuShareState] = useState(true);

    const [menuNameState, setMenuNameState] = useState("");

    return (
      <MDBModal
        isOpen={saveModalShow}
        toggle={() => setSaveModalShow(!saveModalShow)}
      >
        <MDBModalHeader toggle={() => setSaveModalShow(!saveModalShow)}>
          One Last Step!
        </MDBModalHeader>
        <MDBModalBody>
          <Form.Group controlId="menuName" as={Row}>
            <Form.Label column sm="2">
              Name
            </Form.Label>
            <Col sm="8">
              <Form.Control
                type="text"
                placeholder={menuNameState}
                onChange={event => setMenuNameState(event.target.value)}
              />
            </Col>
          </Form.Group>

          <Form.Group controlId="menuShare" as={Row}>
            <Form.Label column sm="2">
              Visibility
            </Form.Label>
            <Col sm="8">
              <Form.Check
                type="checkbox"
                label=" Share with our community and get others
                inspired!"
                checked={menuShareState}
                onChange={() => setMenuShareState(!menuShareState)}
              />
            </Col>
          </Form.Group>
        </MDBModalBody>
        <MDBModalFooter>
          <MDBBtn
            onClick={() => onDoneClick(menuShareState, menuNameState)}
            className="generate-btn"
          >
            SAVE
          </MDBBtn>
        </MDBModalFooter>
      </MDBModal>
    );
  };

  return (
    <>
      <SaveModal />
      <DragDropContext
        onDragEnd={result => onDragEnd(result)}
        onDragStart={() => onDragStart()}
      >
        <Button
          className="meal-plan-btn generate-btn "
          onClick={() => setSaveModalShow(true)}
        >
          DONE
        </Button>
        <div id="menuContainer" className="generateMenuContainer">
          <div className="generateMenuTableContainer">
            <ol className="collection collection-container generateMenuTable">
              <li
                className="item item-container"
                style={getContainerStyle(days)}
              >
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
      </DragDropContext>
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
