import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import "../../scss/TemplateMenu.scss";
import "../../scss/GenerateMenu.scss";
import SearchPanel from "./SearchPanel";
import {
  addDish,
  updateDish,
  fetchDishes,
  fetchPublicDishesForMeals,
  searchAllDishes,
  setMenu,
  resetMenuState,
  makeMenuPublic,
  clearSearchAllDishes,
  getPopularTags,
  fetchMenu,
  setMenuInStore,
  setUserSeeTour,
  didUserSeeTour
} from "../../store/actions/Actions";
import {
  setPreviousLocationFavorites,
  ACTIVE_VIEW_MENUS
} from "../../store/actions/PreviousLocation";
import DishCard, { DishListEnum } from "../dishes/DishCard";
import EditDishModal from "../dishes/EditDishModal";
import { useAuth } from "../auth/UseAuth";
import LoginRedirect from "../auth/LoginRedirect";
import LoginAlert from "../auth/LoginAlert";
import { connect } from "react-redux";
import { DragDropContext } from "react-beautiful-dnd";
import { PANEL_DROPPABLE_ID } from "./PanelDroppable";
import { Droppable, Draggable } from "react-beautiful-dnd";
import Tour from "reactour";
import { MenuOptions } from "./MenuItem";
import ShareMenuModal from "./ShareMenuModal";
import SaveModal from "./SaveModal";
import ResetMenuModal from "./ResetModal";
import MenuTabel from "./MenuTabel";
import MenuBar from "./MenuBar";
import useRandomDishes from "./useRandomDishes";
import { Button } from "mdbreact";
import { useHistory, useLocation, Prompt, useParams } from "react-router-dom";

import "../../../node_modules/@animated-burgers/burger-arrow/dist/styles.css";

const mapStateToProps = state => {
  return {
    menuDataProps: state.menus.menu.menu,
    isEditMode: state.menus.menu.isEditMode,
    favoriteDishes: state.dishes.dishes,
    favoriteDataReceived: state.dishes.privateDishesDataReceived,
    publicDishes: state.dishes.publicDishesPerMeal,
    publicDataReceived: state.dishes.publicDishesPerMealDataReceived,
    searchReceived: state.dishes.allDishesSearchReceived,
    searchResult: state.dishes.allDishesSearchResult,
    suggestedFilters: state.dishes.popularTags,
    seenTour: state.menus.seenTour
  };
};

const mapDispatchToProps = dispatch => ({
  fetchDishes: (uid, selectedFilters) =>
    dispatch(fetchDishes(uid, selectedFilters)),
  addDish: (dish, uid) => dispatch(addDish(dish, uid)),
  updateDish: (dish, uid) => dispatch(updateDish(dish, uid)),
  fetchPublicDishesForMeals: (uid, selectedFilters, meals) =>
    dispatch(fetchPublicDishesForMeals(uid, selectedFilters, meals)),
  setMenu: (payload, uid) => dispatch(setMenu(payload, uid)),
  resetMenuState: () => dispatch(resetMenuState()),
  makeMenuPublic: (payload, uid) => dispatch(makeMenuPublic(payload, uid)),
  fetchMenu: (id, uid, type) => dispatch(fetchMenu(id, uid, type)),
  setMenuInStore: (menuData, isEditMode) =>
    dispatch(setMenuInStore(menuData, isEditMode)),
  searchAllDishes: (uid, query, selectedFilters) =>
    dispatch(searchAllDishes(uid, query, selectedFilters)),
  clearSearchAllDishes: () => dispatch(clearSearchAllDishes()),
  getPopularTags: meals => dispatch(getPopularTags(meals)),
  didUserSeeTour: uid => dispatch(didUserSeeTour(uid)),
  setUserSeeTour: uid => dispatch(setUserSeeTour(uid)),
  setMenuFavoriteActiveView: activeView =>
    dispatch(setPreviousLocationFavorites(activeView))
});

const EXTRA_DISH_DROPPABLE_ID = "EXTRA_DISH_DROPPABLE_ID";
const EXTRA_DISH_DRAGGABLE_ID = "EXTRA_DISH_DRAGGABLE_ID";

const GenerateMenu = ({
  menuDataProps,
  isEditMode,
  favoriteDishes,
  favoriteDataReceived,
  publicDishes,
  publicDataReceived,
  searchReceived,
  searchResult,
  suggestedFilters,
  seenTour,
  fetchDishes,
  addDish,
  updateDish,
  fetchPublicDishesForMeals,
  setMenu,
  resetMenuState,
  makeMenuPublic,
  fetchMenu,
  searchAllDishes,
  clearSearchAllDishes,
  getPopularTags,
  didUserSeeTour,
  setUserSeeTour,
  setMenuInStore,
  setMenuFavoriteActiveView
}) => {
  let { menuId, type, ownerId } = useParams();

  /** Used to redirect to menus list after saving the menu */
  let history = useHistory();
  const location = useLocation();

  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  /** Used to print the menu */
  const componentRef = useRef();

  /** Used to trigger print automatically */
  const triggerPrintRef = useRef();

  /** Used to trigger share automatically */
  const triggerShareRef = useRef();

  /** Used to determine if the menu was opened via shared link */
  const [isSharedMenu, setSharedMenu] = useState(false);

  /** Used to hold dish info when adding dish into a menu  */
  const [extraDishInfo, setExtraDishInfo] = useState(
    location.state && location.state.extraDishInfo
      ? location.state.extraDishInfo
      : null
  );

  /**
   * Show dishes panel
   */
  const [showPanel, setShowPanel] = useState(false);

  /**
   * Show dish plus button, We don't show it while dragging is accuring
   */
  const [showPlusButton, setShowPlusButton] = useState(true);

  /** Save modal is shown */
  const [saveModalShow, setSaveModalShow] = useState({
    show: false,
    shareAfterSave: false
  });

  /** Share modal is shown */
  const [shareModalShow, setShareModalShow] = useState(false);

  /** Reset modal is shown */
  const [resetModalShow, setResetModalShow] = useState(false);

  /** Tour is shown */
  const [showTour, setShowTour] = useState(false);

  /** Show editDishModal */
  const [showEditDishModal, setShowEditDishModal] = useState({
    show: false,
    dish: null
  });

  /** Merged favorite and public dishes to be used in paenl */
  const [allDishes, setAllDishes] = useState([]);

  /** Used to determine if to show results from searchResult object */
  const [isSearchMode, setIsSearchMode] = useState(false);

  /** Used to determine if to show results from searchResult object */
  const [isFilterMode, setIsFilterMode] = useState(false);

  /**
   * Show/ hide login alert
   */
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  /** useRandomDishes hook */
  const {
    randomDishes,
    setRandomDishes,
    computeRandomDishes,
    handleRandomClick
  } = useRandomDishes(
    menuDataProps,
    searchResult,
    favoriteDishes,
    publicDishes,
    isFilterMode,
    isSearchMode
  );

  /** Use to fetch dishes and search result with selected filters */
  const [selectedFilters, setSelectedFilters] = useState(
    menuDataProps && menuDataProps.selectedFilters
      ? menuDataProps.selectedFilters
      : []
  );

  var mergePrivateAndPublic = () => {
    var mergedDishes = favoriteDishes.concat(publicDishes);
    var map = new Map(mergedDishes.map(dish => [dish.id, dish]));
    var allDishes = [...map.values()];
    setAllDishes(allDishes);
  };

  const getUid = () => {
    return auth.authState && auth.authState && auth.authState.user
      ? auth.authState.user.uid
      : null;
  };

  /**
  Read menu data from location  - available from an existing menu or when 
  opening a new menu from Menu template
  */
  useEffect(() => {
    // Read  menu data from location
    if (location.state && location.state.menuData) {
      if (!menuDataProps || location.state.menuData !== menuDataProps) {
        console.log(
          "Set menu Data in store from location: ",
          location.state.menuData
        );
        setMenuInStore(
          location.state.menuData,
          location.state.extraDishInfo ? true : false
        );
        return;
      }
    }

    // No menuData in location, only menuId. This is a shared menu, fetch it's data
    if (!menuDataProps && menuId) {
      console.log("Shared menu needs to be fetched");
      setSharedMenu(true);
      fetchMenu(menuId, ownerId, type);
      return;
    }

    // Shared link Menu was fetched succesfuly, set menu details to state
    if (menuId & menuDataProps) {
      console.log("Shared menu fetched sccesfully. Set menu in store");
      setRandomDishes(menuDataProps.dishes);
    }
  }, [location]);

  /**
   * Fetch private and public dishes. 
   Compute random dishes after all data is received
   */
  useEffect(() => {
    if (!menuDataProps || !menuDataProps.meals || !menuDataProps.days) {
      console.log("Fetch dishes - return. menuDataProps is empty");
      return;
    }

    if (menuDataProps.dishes && !randomDishes) {
      console.log(
        "Dishes exist in menu and randomDishes is empty. Call set random dishes"
      );
      setRandomDishes(menuDataProps.dishes);
    }

    // Fetch private dishes if user is connected
    if (!favoriteDataReceived.received && getUid()) {
      console.log("Fetch dishes - call private and retrun");
      fetchDishes(getUid(), selectedFilters);
      return;
    }

    // Fetch public dishes
    if (!publicDataReceived) {
      console.log("Fetch dishes - call public and return");
      fetchPublicDishesForMeals(getUid(), selectedFilters, menuDataProps.meals);
      return;
    }

    // Compute random dishes when both favorite (if user logged in) and public dishes received
    if (publicDataReceived) {
      if (!menuDataProps.dishes && !randomDishes) {
        console.log("Call compute random dishes");
        computeRandomDishes();
      }

      mergePrivateAndPublic(); // Merge dishes are used in the panel. Merge ony once
    } else {
      console.log("publicData didn't Received. Return");
      return;
    }

    // Get popular tags
    if (suggestedFilters.length === 0) {
      getPopularTags(menuDataProps.meals);
    }
  }, [menuDataProps, favoriteDataReceived, publicDataReceived]);

  /** Only once: 
  if this menu was opened with PRINT option, trigger PRINT
  if this menu was opened with SHARE option, trigger SHARE
  */
  useEffect(() => {
    if (!location.state) return;
    if (location.state.menuOption) {
      if (location.state.menuOption === MenuOptions.PRINT) {
        if (triggerPrintRef.current) triggerPrintRef.current.click();
      }
      if (location.state.menuOption === MenuOptions.SHARE) {
        if (triggerShareRef.current) triggerShareRef.current.click();
      }
    }
  }, [location.state]);

  // If this is a newly generated menu, when saving it's data we get new id
  // Use this id to generate a deep link that we can use later in order to share the menu
  // Don't do this for shared menus as it already have id
  useEffect(() => {
    if (menuId || isSharedMenu || !getUid() || !menuDataProps) return;
    if (menuDataProps.id) {
      console.log("Generating deep link");
      history.push(`/menu/generate/private/${menuDataProps.id}/${getUid()}`, {
        menuDataProps
      });
    }
  }, [menuDataProps]);

  /** Handle tour show */
  useEffect(() => {
    if (!getUid()) return;
    // If seenTour value was fetch, use it
    if (seenTour === false || seenTour === true) {
      console.log("setShowTour value");
      // Show tour if needed and if menu is in Edit mode
      if (!seenTour && isEditMode) setShowTour(true);
    }

    // Otherwise fetch seenTour value
    else {
      console.log("fetch ShowTour value");
      didUserSeeTour(getUid());
    }
  }, [seenTour, isEditMode]);

  // Merge private and public dishes everytime there's a change in one of the lists
  useEffect(() => {
    if (favoriteDishes || publicDishes) {
      console.log("useEffect mergePrivateAndPublic");
      mergePrivateAndPublic();
    }
  }, [favoriteDishes, publicDishes]);

  // Save generate menu state in store when there's a change in random dishes
  useEffect(() => {
    if (
      !menuDataProps ||
      Object.keys(menuDataProps).length === 0 ||
      !randomDishes
    ) {
      console.log("No change in randomDishes. Don't save menu state in store");
      return;
    }
    if (menuDataProps.dishes === randomDishes) return;
    console.log("randomDishes changed. Save menu state in store");
    var menuToSave = menuDataProps;
    menuToSave.dishes = randomDishes;
    setMenuInStore(menuToSave, isEditMode);
  }, [randomDishes]);

  /**
   * Close the panel when drag starts
   */
  const onDragStart = e => {
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
    if (!menuDataProps.days[destination.index].enabled) return;

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
        dish = searchResult[source.index];
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

  const onSaveClick = (menuShareState, menuNameState) => {
    // Generate menu preview
    var images = [];
    for (var i = 0; i < menuDataProps.days.length; i++) {
      for (var j = 0; j < menuDataProps.days.length; j++) {
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
      days: menuDataProps.days,
      meals: menuDataProps.meals,
      dishes: randomDishes,
      previewImages: previewImages,
      sharePublic: menuShareState,
      name: menuNameState
    };

    setMenu(menu, getUid());

    if (saveModalShow.shareAfterSave) {
      setShareModalShow(true);
    } else {
      // Redirect to my favorites menus
      setMenuFavoriteActiveView(ACTIVE_VIEW_MENUS);
      history.push("/myFavorites");
    }
    setSaveModalShow(false, false);
  };

  /** Shuffle array for randomized menu preview */
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const onSearch = (query, filters = selectedFilters) => {
    setIsSearchMode(true);
    searchAllDishes(getUid(), query, filters);
  };

  const onSearchClear = (filters = selectedFilters) => {
    // If there's filters are on, search for filters only without a query
    if (filters && filters.length > 0) {
      handleSelectedFilters(filters);
    }

    // No filters, clear search
    else {
      setIsSearchMode(false);
      clearSearchAllDishes();
    }
  };

  const handleCloseExtraDishClick = () => {
    setExtraDishInfo(null);
  };

  const applyFilter = filter => {
    const newState = [...selectedFilters, filter];
    setSelectedFilters(newState);
    searchForFilters(newState);
  };

  const removeFilter = filter => {
    const newState = [...selectedFilters].filter(
      currFilter => currFilter !== filter
    );
    setSelectedFilters(newState);

    // If there are filters, search for them
    if (newState.length > 0) {
      searchForFilters(newState);
    }

    // Otherwise clear search
    else {
      setIsFilterMode(false);
      setIsSearchMode(false);
      clearSearchAllDishes();
    }
  };

  const searchForFilters = filters => {
    setIsFilterMode(true);
    onSearch("", filters);
  };

  const handleSelectedFilters = filters => {
    if (filters && filters.length > 0) {
      setIsFilterMode(true);
      onSearch("", filters);
    } else {
      setIsFilterMode(false);
      onSearchClear(filters);
    }
  };

  const validateLoggedInUser = () => {
    if (!getUid()) {
      setShowLoginAlert(true);
      return false;
    }

    return true;
  };

  const onEditClick = () => {
    if (validateLoggedInUser() === false) return;
    setMenuInStore(menuDataProps, true);
  };

  const onShareClick = () => {
    if (validateLoggedInUser() === false) return;

    // Share menu only after it was saved to backend and it has it's unique id
    if (menuDataProps.id) {
      setShareModalShow(true);
    } else {
      setSaveModalShow({ show: true, shareAfterSave: true });
    }
  };

  const onTourClose = () => {
    setShowTour(false);
    if (!auth.authState.user) return;
    setUserSeeTour(getUid());
  };

  const setComment = (mealIndex, dayIndex, comment) => {
    var previousDish = {
      ...randomDishes[mealIndex][dayIndex]
    };
    previousDish.comment = comment;
    var previousRandom = [...randomDishes];
    previousRandom[mealIndex][dayIndex] = previousDish;
    setRandomDishes(previousRandom);
  };

  const onDishUpdate = dish => {
    updateDish(dish, getUid());
    setShowEditDishModal({ show: false, dish: null });

    // Update the random dishes with the edited dish
    var randomCopy = { ...randomDishes };
    randomCopy[showEditDishModal.mealIndex][showEditDishModal.dayIndex] = dish;
    setRandomDishes(randomCopy);
  };

  /**
   * If there's no days and meals data in menu
   */
  if (!menuDataProps || !menuDataProps.meals || !menuDataProps.days) {
    // If the menu was opened via shared link, it's data is being fetched, show loading
    if (isSharedMenu) {
      return <div className="center-text">Loading...</div>;
    }
  }

  /**
   * If there's no menu data and no logged in user in order to fetch menu, show login message
   */
  if (
    menuDataProps &&
    !menuDataProps.days &&
    !auth.authState.user &&
    auth.authState.authStatusReported
  ) {
    return <LoginRedirect />;
  }

  /**
   * If randomDishes isn't loaded yet
   */

  if (!randomDishes) {
    return <div className="center-text">Loading...</div>;
  }

  return (
    <>
      <Prompt
        when={isEditMode && !saveModalShow.show && !resetModalShow}
        message={location =>
          location.pathname.startsWith("/menu/generate") ||
          location.pathname.startsWith("/login")
            ? true
            : `Are you sure you want to leave before saving changes?`
        }
      />
      <LoginAlert
        showLoginAlert={showLoginAlert}
        onClose={() => setShowLoginAlert(false)}
      />
      <SaveModal
        saveModalShow={saveModalShow.show}
        toggle={() => {
          setSaveModalShow({ show: !saveModalShow.show });
        }}
        onSaveClick={(menuShareState, menuNameState) =>
          onSaveClick(menuShareState, menuNameState)
        }
      />
      <ShareMenuModal
        isPrivateMenu={!menuDataProps.sharePublic}
        show={shareModalShow}
        handleHide={() => {
          setShareModalShow(false);
        }}
        days={menuDataProps.days}
        meals={menuDataProps.meals}
        randomDishes={randomDishes}
        uid={getUid()}
        handleMakePublic={() => {
          // Set as public in backend
          makeMenuPublic(menuDataProps.id, getUid());

          // Set as public locally
          setMenuInStore({
            ...menuDataProps,
            sharePublic: true
          });
        }}
        menuName={menuDataProps.name}
        triggerPrintRef={triggerPrintRef}
        componentRef={componentRef}
      />

      <ResetMenuModal
        show={resetModalShow}
        handleHide={() => setResetModalShow(false)}
        handleResetClick={() => {
          resetMenuState();
          history.push("/menu/newMenu");
        }}
      />

      <Tour
        steps={tourSteps}
        isOpen={showTour}
        onRequestClose={() => onTourClose()}
      />

      <EditDishModal
        show={showEditDishModal.show}
        dish={showEditDishModal.dish}
        onEditDishHide={() =>
          setShowEditDishModal({
            show: false,
            dish: null
          })
        }
        allowRedirectAfterEdit={false}
        onDishEdit={dish => onDishUpdate(dish)}
      />

      <div
        ref={componentRef}
        className={classNames({
          share: shareModalShow
        })}
      >
        <div className="print-only page-title">
          {menuDataProps && menuDataProps.name && (
            <div>
              <span>{menuDataProps.name}</span>
            </div>
          )}
          <span>Pure Meal Plan</span>
          <br />
          <span>https://puremealplan.com/</span>
        </div>
        <DragDropContext
          onDragEnd={result => onDragEnd(result)}
          onDragStart={e => onDragStart(e)}
        >
          <MenuBar
            isEditMode={isEditMode}
            onEditClick={() => onEditClick()}
            onSaveButtonClick={() => {
              if (!validateLoggedInUser()) return;
              setSaveModalShow({ show: true });
            }}
            triggerPrintRef={triggerPrintRef}
            triggerShareRef={triggerShareRef}
            componentRef={componentRef}
            onAddDish={dish => {
              addDish(dish, getUid());
            }}
            onShareClick={() => {
              onShareClick();
            }}
            handleRandomClick={() => handleRandomClick()}
            resetClick={() => setResetModalShow(true)}
          />

          {isEditMode && (
            <div className="panel-wrapper">
              {menuDataProps && menuDataProps.name && (
                <h6 className="menuName">{menuDataProps.name}</h6>
              )}
              <div className="dummy" />
              <div
                className={classNames("panel-handle", "filters-and-search", {
                  "is-open": showPanel
                })}
              >
                <Button
                  onClick={() => setShowPanel(!showPanel)}
                  className="meal-plan-btn"
                >
                  Search and filter
                </Button>
              </div>
            </div>
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
                            handleCloseExtraDishClick={
                              handleCloseExtraDishClick
                            }
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
          <div className="generateMenuContainer">
            <MenuTabel
              days={menuDataProps.days}
              meals={menuDataProps.meals}
              randomDishes={randomDishes}
              onMinusClick={onMinusClick}
              handleDishLock={handleDishLock}
              handleDishUnlock={handleDishUnlock}
              setShowPanel={setShowPanel}
              showPlusButton={showPlusButton}
              isEditMode={isEditMode}
              onDishClicked={(dish, mealIndex, dayIndex) => {
                setShowEditDishModal({
                  show: true,
                  dish: dish,
                  mealIndex: mealIndex,
                  dayIndex: dayIndex
                });
              }}
              setComment={(mealIndex, dayIndex, comment) =>
                setComment(mealIndex, dayIndex, comment)
              }
            />

            <div
              className={classNames("panel-wrap", showPanel ? "show" : "hide")}
            >
              <SearchPanel
                onSearch={onSearch}
                onSearchClear={onSearchClear}
                isSearchMode={isSearchMode}
                searchReceived={searchReceived}
                searchResult={searchResult}
                isEditMode={isEditMode}
                onPanelClose={() => setShowPanel(false)}
                filters={suggestedFilters}
                removeFilter={filter => removeFilter(filter)}
                applyFilter={filter => applyFilter(filter)}
                handleRandomClick={handleRandomClick}
              />
            </div>
          </div>
        </DragDropContext>
        <ul className="menu-links">
          Links:
          {menuDataProps.meals.map((meal, mealIndex) => {
            return menuDataProps.days.map((day, dayIndex) =>
              randomDishes[mealIndex][dayIndex] ? (
                <li key={menuDataProps.days.length * mealIndex + dayIndex}>
                  <a
                    href={randomDishes[mealIndex][dayIndex].link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {randomDishes[mealIndex][dayIndex].link}
                  </a>
                </li>
              ) : null
            );
          })}
        </ul>
      </div>
    </>
  );
};

const tourSteps = [
  {
    selector: ".random-btn",
    content: "Click Random button to generate more random dishes!"
  },
  {
    selector: ".fa-lock-open",
    content:
      "When you are happy with this choice, lock so it won't change in the next Random click!"
  },
  {
    selector: ".fa-grip-vertical",
    content: "Hold here to drag dishes to different days or meals!"
  },
  {
    selector: ".panel-handle",
    content: "Click here to search for more dishes"
  }
];

GenerateMenu.propTypes = {
  menuDataProps: PropTypes.shape({
    days: PropTypes.array,
    meals: PropTypes.array
  })
};
const GenerateMenuComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(GenerateMenu);
export default GenerateMenuComponent;
