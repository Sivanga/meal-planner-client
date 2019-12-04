import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button } from "mdbreact";
import classNames from "classnames";
import {
  fetchDishes,
  fetchPublicDishes,
  searchAllDishes,
  setMenu,
  clearSearchAllDishes
} from "../../store/actions/Actions";
import DishCard, { DishListEnum } from "../dishes/DishCard";
import { useAuth } from "../auth/UseAuth";
import { connect } from "react-redux";
import { DragDropContext } from "react-beautiful-dnd";
import TableDroppable from "./TableDroppable";
import PanelDroppable, { PANEL_DROPPABLE_ID } from "./PanelDroppable";
import { getContainerStyle } from "./Helpers";
import { Redirect, Prompt } from "react-router-dom";
import Burger from "@animated-burgers/burger-arrow";
import { Droppable, Draggable } from "react-beautiful-dnd";

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
import SearchComponent from "../SearchComponent";

const mapStateToProps = state => {
  return {
    favoriteDishes: state.dishes.dishes,
    favoriteDataReceived: state.dishes.privateDishesDataReceived,
    publicDishes: state.dishes.publicDishes,
    publicDataReceived: state.dishes.publicDishesDataReceived,
    searchReceived: state.dishes.allDishesSearchReceived,
    searchResult: state.dishes.allDishesSearchResult
  };
};

const mapDispatchToProps = dispatch => ({
  fetchDishes: uid => dispatch(fetchDishes(uid)),
  fetchPublicDishes: uid => dispatch(fetchPublicDishes(uid)),
  setMenu: (payload, uid) => dispatch(setMenu(payload, uid)),
  searchAllDishes: (uid, query) => dispatch(searchAllDishes(uid, query)),
  clearSearchAllDishes: () => dispatch(clearSearchAllDishes())
});

const EXTRA_DISH_DROPPABLE_ID = "EXTRA_DISH_DROPPABLE_ID";
const EXTRA_DISH_DRAGGABLE_ID = "EXTRA_DISH_DRAGGABLE_ID";

const GenerateMenu = props => {
  /** Used to redirect to menus list after saving the menu */
  let history = useHistory();

  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  /**
  Get from history the Random dishes array if exist - this data comes from clicking an existing menu
  Get from history days and meal - this data comes from previous page - menu template
  Get from history extraDishInfo to add to menu
   */
  var initialRandomDishes = null;
  var days = null;
  var meals = null;
  var extraDishInfoInitial = null;
  if (props.location && props.location.state && props.location.state.menuData) {
    if (props.location.state.menuData.days) {
      days = props.location.state.menuData.days;
    }
    if (props.location.state.menuData.meals) {
      meals = props.location.state.menuData.meals;
    }
    if (props.location.state.menuData.dishes) {
      initialRandomDishes = props.location.state.menuData.dishes;

      // initialRandomDishes can arrive with undefined valus from backend, change it to empty array
      if (meals) {
        meals.map((meal, mealIndex) => {
          if (!initialRandomDishes[mealIndex]) {
            initialRandomDishes[mealIndex] = [];
            days.map((day, dayIndex) => {
              initialRandomDishes[mealIndex][dayIndex] = null;
            });
          }
        });
      }
    }
    if (
      props.location &&
      props.location.state &&
      props.location.state.extraDishInfo
    ) {
      extraDishInfoInitial = props.location.state.extraDishInfo;
    }
  }

  /** Used to hold dish info when adding dish into a menu  */
  const [extraDishInfo, setExtraDishInfo] = useState(extraDishInfoInitial);

  /** Random dishes */
  const [randomDishes, setRandomDishes] = useState(initialRandomDishes);

  /** IsEditMode - if initialRandomDishes exist it means the menu was opened for viewing from existing menu
  Otherwise this is a newly created menu */
  const [isEditMode, setIsEditMode] = useState(
    initialRandomDishes && !extraDishInfo ? false : true
  );

  const [blockLeave, setBlockLeave] = useState(isEditMode ? true : false);

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

  /** Merged favorite and public dishes to be used in paenl */
  const [allDishes, setAllDishes] = useState([]);

  /** Used to determine if to show results from searchResult object */
  const [isSearchMode, setIsSearchMode] = useState(false);

  /**
   * Fetch private and public dishes. Compute random dishes after all data is received
   */
  useEffect(() => {
    if (!auth.authState.user) return;

    // Fetch private and public dishes
    if (!props.favoriteDataReceived.received) {
      props.fetchDishes(auth.authState.user.uid);
    }

    if (!props.publicDataReceived.received) {
      props.fetchPublicDishes(auth.authState.user.uid);
    }

    // Compute random dishes if both favorite and public dishes received
    if (props.favoriteDataReceived && props.publicDataReceived) {
      if (!randomDishes) {
        computeRandomDishes();
      }
      mergePrivateAndPublic(); // Merge dishes are used in the panel. Merge ony once
    }
  }, [auth, props.favoriteDataReceived, props.publicDataReceived]);

  /**
   * Get days and meals from previous page (menu template)
   If theres no days and meals data, go back main menu page
   */

  if (!meals || !days) {
    return (
      <Redirect
        push
        to={{
          pathname: "/menu"
        }}
      />
    );
  }

  var mergePrivateAndPublic = () => {
    var mergedDishes = props.favoriteDishes.concat(props.publicDishes);
    var map = new Map(mergedDishes.map(dish => [dish.id, dish]));
    setAllDishes([...map.values()]);
  };

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

        const randomDish = getRandomDish(meal);
        return (randomDishes[mealIndex][dayIndex] = randomDish);
      });
    });

    // Set result
    setRandomDishes(randomDishes);
  };

  const findDishesForMeal = (dishes, meal) => {
    var dishesToReturn = dishes.filter(dish =>
      dish.meals.some(
        currMeal => currMeal.name.toUpperCase() === meal.name.toUpperCase()
      )
    );

    // Return dishes for meal if found any
    if (dishesToReturn.length > 0) {
      return dishesToReturn;
    }

    // Otherwise - didn't find dish for this specific meal, return all dishes
    else {
      return dishes;
    }
  };

  /** Recompute all unlocked dishes
   */
  const handleRandomClick = () => {
    var copy = { ...randomDishes };
    meals.map((meal, mealIndex) => {
      days.map((day, dayIndex) => {
        // Don't assign a dish for a disabled day
        // Don't replace a locked dish
        if (
          !day.enabled ||
          (copy[mealIndex][dayIndex] && copy[mealIndex][dayIndex].locked)
        )
          return copy[mealIndex][dayIndex];

        const randomDish = getRandomDish(meal);

        copy[mealIndex][dayIndex] = randomDish;
      });
    });

    // Set result
    setRandomDishes(copy);
  };

  const getRandomDish = meal => {
    // First find a random dish from favorites that matches this meal
    const mealsFavoriteDishes = findDishesForMeal(props.favoriteDishes, meal);
    var mergedDishes = mealsFavoriteDishes;

    // If mealsFavoriteDishes length is less then days length, use public dishes as well
    if (mealsFavoriteDishes.length < days.length) {
      const mealsPublicDishes = findDishesForMeal(props.publicDishes, meal);
      mergedDishes = mealsFavoriteDishes.concat(mealsPublicDishes);
    }

    var randomDish =
      mergedDishes[Math.floor(Math.random() * mergedDishes.length)];
    if (!randomDish) randomDish = null; // Make sure dish isn't undefiend as the whole menu won't be able to be written to Firedbase
    return randomDish;
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

    // Drop from extra dish
    if (source.droppableId === EXTRA_DISH_DROPPABLE_ID) {
      // Replcae with current table dish
      const destinationArray = [...randomDishes[destination.droppableId]];
      destinationArray.splice(destination.index, 1, extraDishInfo);
      // Set result
      const result = {
        ...randomDishes,
        [destination.droppableId]: destinationArray
      };
      setRandomDishes(result);
      setExtraDishInfo(null);
      return;
    }
    if (source.droppableId === PANEL_DROPPABLE_ID) {
      // Dropped from panel dishes
      // Get the wanted dish
      var dish;
      if (isSearchMode) {
        dish = props.searchResult[source.index];
      } else {
        dish = allDishes[source.index];
      }
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

  const handleDishLock = (mealIndex, dayIndex) => {
    var randomDishesCopy = { ...randomDishes };
    var dishCopy = {
      ...randomDishesCopy[mealIndex][dayIndex]
    };
    dishCopy.locked = true;
    randomDishesCopy[mealIndex][dayIndex] = dishCopy;
    setRandomDishes(randomDishesCopy);
  };

  const handleDishUnlock = (mealIndex, dayIndex) => {
    var randomDishesCopy = { ...randomDishes };
    randomDishesCopy[mealIndex][dayIndex].locked = false;
    setRandomDishes(randomDishesCopy);
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

    setSaveModalShow(false); // Hide the modal

    history.push("/myFavorites", {
      activeView: "ACTIVE_VIEW_MENUS"
    });
  };

  /** Shuffle array for randomized menu preview */

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const onSearch = query => {
    setIsSearchMode(true);
    props.searchAllDishes(auth.authState.user.uid, query);
  };

  const onSearchClear = () => {
    setIsSearchMode(false);
    props.clearSearchAllDishes();
  };

  const handleCloseExtraDishClick = () => {
    setExtraDishInfo(null);
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
                className="menuShareLable"
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
            onClick={() => {
              onDoneClick(menuShareState, menuNameState);
            }}
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
      <Prompt
        when={blockLeave}
        message={location =>
          `Are you sure you want to leave before saving changes?`
        }
      />
      <SaveModal />
      <DragDropContext
        onDragEnd={result => onDragEnd(result)}
        onDragStart={() => onDragStart()}
      >
        {isEditMode && (
          <div className="generate-btn-wrapper">
            <Button
              className="meal-plan-btn generate-btn "
              onClick={() => {
                setBlockLeave(false); // Alow to leave the page after edit is done
                setSaveModalShow(true);
              }}
            >
              DONE
            </Button>
            <MDBBtn
              className="generate-btn random-btn"
              onClick={() => handleRandomClick()}
            >
              RANDOM!
            </MDBBtn>
          </div>
        )}
        {!isEditMode && (
          <Button
            className="meal-plan-btn generate-btn "
            onClick={() => {
              setIsEditMode(true);
              setBlockLeave(true);
            }}
          >
            EDIT
          </Button>
        )}

        {/* Allow dragging the extra dish info */}
        {extraDishInfo && (
          <div className="extra-dish-droppable">
            <Droppable
              droppableId={EXTRA_DISH_DROPPABLE_ID}
              isDropDisabled={true}
            >
              {(droppableProvided, snapshot) => (
                <div
                  ref={droppableProvided.innerRef}
                  {...droppableProvided.droppableProps}
                  {...droppableProvided.droppablePlaceholder}
                >
                  <Draggable draggableId={EXTRA_DISH_DRAGGABLE_ID} index={0}>
                    {(draggebleProvided, draggebleSnapshot) => (
                      <div
                        ref={draggebleProvided.innerRef}
                        {...draggebleProvided.draggableProps}
                        {...draggebleProvided.dragHandleProps}
                      >
                        <DishCard
                          dish={extraDishInfo}
                          dishListEnum={DishListEnum.EXTRA_DISH_INFO}
                          handleCloseExtraDishClick={handleCloseExtraDishClick}
                        />
                      </div>
                    )}
                  </Draggable>
                  {droppableProvided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        )}
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
                {isEditMode && (
                  <div className="burger-wrapper">
                    <Burger
                      direction="right"
                      isOpen={showPanel}
                      onClick={() => setShowPanel(!showPanel)}
                    />
                  </div>
                )}
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
                  handleDishLock={dayIndex =>
                    handleDishLock(mealIndex, dayIndex)
                  }
                  handleDishUnlock={dayIndex =>
                    handleDishUnlock(mealIndex, dayIndex)
                  }
                  onPlusClick={dayIndex => setShowPanel(true)}
                  showPlusButton={showPlusButton}
                  isEditMode={isEditMode}
                />
              ))}
            </ol>
            <div
              className={classNames("panel-wrap", showPanel ? "show" : "hide")}
            >
              <SearchComponent
                onSearch={value => onSearch(value)}
                onSearchClear={onSearchClear}
                isFullLength={true}
              />
              {/* Searching */}
              {isSearchMode && !props.searchReceived && (
                <div className="center-text">Searching...</div>
              )}
              {/* No search result to show */}
              {isSearchMode &&
                props.searchReceived &&
                props.searchResult.length === 0 && (
                  <div className="center-text">
                    Couldn't find what you've search for.
                  </div>
                )}
              <PanelDroppable
                dishes={isSearchMode ? props.searchResult : allDishes}
                isEditMode={isEditMode}
              />
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
