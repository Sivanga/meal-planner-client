import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import SearchPanel from "./SearchPanel";
import {
  addDish,
  fetchDishes,
  fetchPublicDishes,
  searchAllDishes,
  setMenu,
  makeMenuPublic,
  clearSearchAllDishes,
  getPopularTags,
  fetchMenu,
  resetMenuState,
  setUserSeeTour,
  didUserSeeTour
} from "../../store/actions/Actions";
import DishCard, { DishListEnum } from "../dishes/DishCard";
import ImportDish, { ImportDishType } from "../dishes/ImportDish";
import EditDishModal from "../dishes/EditDishModal";
import { useAuth } from "../auth/UseAuth";
import { connect } from "react-redux";
import { DragDropContext } from "react-beautiful-dnd";
import { PANEL_DROPPABLE_ID } from "./PanelDroppable";
import { Prompt, useParams } from "react-router-dom";
import { Droppable, Draggable } from "react-beautiful-dnd";
import ReactToPrint from "react-to-print";
import Tour from "reactour";
import { MenuOptions } from "./MenuItem";
import ShareModal from "./ShareModal";
import SaveModal from "./SaveModal";
import MenuTabel from "./MenuTabel";
import useRandomDishes from "./useRandomDishes";
import { Button, MDBBtn } from "mdbreact";
import { useHistory } from "react-router-dom";
import "../../../node_modules/@animated-burgers/burger-arrow/dist/styles.css";
import "../../scss/TemplateMenu.scss";
import "../../scss/GenerateMenu.scss";

const mapStateToProps = state => {
  return {
    menuData: state.menus.menu,
    favoriteDishes: state.dishes.dishes,
    favoriteDataReceived: state.dishes.privateDishesDataReceived,
    publicDishes: state.dishes.publicDishes,
    publicDataReceived: state.dishes.publicDishesDataReceived,
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
  fetchPublicDishes: (uid, selectedFilters) =>
    dispatch(fetchPublicDishes(uid, selectedFilters)),
  setMenu: (payload, uid) => dispatch(setMenu(payload, uid)),
  makeMenuPublic: (payload, uid) => dispatch(makeMenuPublic(payload, uid)),
  fetchMenu: (id, uid, type) => dispatch(fetchMenu(id, uid, type)),
  resetMenuState: () => dispatch(resetMenuState()),
  searchAllDishes: (uid, query, selectedFilters) =>
    dispatch(searchAllDishes(uid, query, selectedFilters)),
  clearSearchAllDishes: () => dispatch(clearSearchAllDishes()),
  getPopularTags: uid => dispatch(getPopularTags(uid)),
  didUserSeeTour: uid => dispatch(didUserSeeTour(uid)),
  setUserSeeTour: uid => dispatch(setUserSeeTour(uid))
});

const EXTRA_DISH_DROPPABLE_ID = "EXTRA_DISH_DROPPABLE_ID";
const EXTRA_DISH_DRAGGABLE_ID = "EXTRA_DISH_DRAGGABLE_ID";

const GenerateMenu = props => {
  let { menuId, type, ownerId } = useParams();

  /** Used to redirect to menus list after saving the menu */
  let history = useHistory();

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

  /**
  Get from history the Random dishes array if exist - this data comes from clicking an existing menu
  Get from history days and meal - this data comes from previous page - menu template
  Get menu data from props
   */
  const readMenuData = () => {
    var menuData = props.menuData;

    // Get menu data from location
    if (
      props.location &&
      props.location.state &&
      props.location.state.menuData
    ) {
      menuData = props.location.state.menuData;
    }

    if (!menuData) return;

    // menuData.dishes can arrive with undefined valus from backend, change it to empty array
    if (menuData.meals && menuData.dishes) {
      menuData.meals.map((meal, mealIndex) => {
        if (!menuData.dishes[mealIndex]) {
          menuData.dishes[mealIndex] = [];
          menuData.days.map((day, dayIndex) => {
            menuData.dishes[mealIndex][dayIndex] = null;
          });
        }
      });
    }
    return menuData;
  };

  /** Set menu data from props.location or actual props */
  const [menuData, setMenuData] = useState(readMenuData());

  /** Used to determine if the menu was opened via shared link */
  const [isSharedMenu, setSharedMenu] = useState(false);

  /** Get from history extraDishInfo to add specific dish to menu */
  var extraDishInfoInitial = null;
  if (
    props.location &&
    props.location.state &&
    props.location.state.extraDishInfo
  ) {
    extraDishInfoInitial = props.location.state.extraDishInfo;
  }

  /** Used to hold dish info when adding dish into a menu  */
  const [extraDishInfo, setExtraDishInfo] = useState(extraDishInfoInitial);

  /** IsEditMode - if initialRandomDishes exist it means the menu was opened for viewing from existing menu
  Otherwise this is a newly created menu */
  const [isEditMode, setIsEditMode] = useState(
    menuData && menuData.dishes && !extraDishInfo ? false : true
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

  /** Share modal is shown */
  const [shareModalShow, setShareModalShow] = useState(false);

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

  /** useRandomDishes hook */
  const {
    randomDishes,
    setRandomDishes,
    computeRandomDishes,
    handleRandomClick
  } = useRandomDishes(
    menuData,
    props.searchResult,
    props.favoriteDishes,
    props.publicDishes,
    isFilterMode
  );

  /** Use to fetch dishes and search result with selected filters */
  const [selectedFilters, setSelectedFilters] = useState(
    menuData && menuData.selectedFilters ? menuData.selectedFilters : []
  );

  var mergePrivateAndPublic = () => {
    var mergedDishes = props.favoriteDishes.concat(props.publicDishes);
    var map = new Map(mergedDishes.map(dish => [dish.id, dish]));
    var allDishes = [...map.values()];
    setAllDishes(allDishes);
  };

  /**
   * Fetch private and public dishes. Compute random dishes after all data is received
   */
  useEffect(() => {
    if (!auth.authState.user || !menuData || !menuData.meals || !menuData.days)
      return;

    // Fetch private and public dishes
    if (!props.favoriteDataReceived.received) {
      props.fetchDishes(auth.authState.user.uid, selectedFilters);
      return;
    }

    if (!props.publicDataReceived.received) {
      props.fetchPublicDishes(auth.authState.user.uid, selectedFilters);
      return;
    }

    // Compute random dishes if both favorite and public dishes received
    if (props.favoriteDataReceived && props.publicDataReceived) {
      if (!menuData.dishes && !randomDishes) {
        computeRandomDishes();
      }
      mergePrivateAndPublic(); // Merge dishes are used in the panel. Merge ony once
    }

    // Get popular tags
    if (props.suggestedFilters.length === 0) {
      props.getPopularTags();
    }
  }, [
    auth,
    props.favoriteDataReceived,
    props.publicDataReceived,
    props.suggestedFilters,
    menuData
  ]);

  /**
  Fetch menu from backEnd if there's no menuData but there's menuId
   */
  useEffect(() => {
    // There's no menuData - This can happen when a menu was opended from a shared link
    // Fetch menu from backend with menuId
    if (
      (!menuData || !menuData.days) &&
      (!props.menuData || !props.menuData.days)
    ) {
      setSharedMenu(true);
      props.fetchMenu(menuId, ownerId, type);
      return;
    }

    // Menu was fetched succesfuly, set menu detauks to state
    if (props.menuData.days && !menuData.days) {
      setMenuData(readMenuData());
      setRandomDishes(props.menuData.dishes);
      setIsEditMode(false); // This menu was opened via shared link therefor Edit isn't allowed
    }
  }, [menuData, props.menuData]);

  /** Only once: 
  if this menu was opened with PRINT option, trigger PRINT
  if this menu was opened with SHARE option, trigger SHARE
  if this menu is newly generated, delete the previous menu data state in store */
  useEffect(() => {
    if (props.location && props.location.state) {
      if (props.location.state.menuOption) {
        if (props.location.state.menuOption === MenuOptions.PRINT) {
          if (triggerPrintRef.current) triggerPrintRef.current.click();
        }
        if (props.location.state.menuOption === MenuOptions.SHARE) {
          if (triggerShareRef.current) triggerShareRef.current.click();
        }
      }
      if (props.location.state.newGeneratedMenu) {
        props.resetMenuState();
      }
    }
  }, []);

  // Save menuData to state when it's received by props
  // If this is a newly generated menu, when saving it's data we get new id
  // Use this id to generate a deep link that we can use later in order to share the menu
  // Don't do this for shared menus as it already have id
  useEffect(() => {
    if (isSharedMenu) return;
    if (props.menuData.id) {
      setMenuData(props.menuData);
      history.push(
        `/menu/generate/private/${props.menuData.id}/${auth.authState.user.uid}`,
        {
          menuData
        }
      );
    }
  }, [props.menuData, auth]);

  /** Handle tour show */
  useEffect(() => {
    if (!auth.authState.user) return;
    const uid = auth.authState.user.uid;

    // If seenTour value was fetch, use it
    if (props.seenTour === false || props.seenTour === true) {
      // Show tour if needed and if menu is in Edit mode
      if (!props.seenTour && isEditMode) setShowTour(true);
    }

    // Otherwise fetch seenTour value
    else {
      props.didUserSeeTour(uid);
    }
  }, [props.seenTour, auth, isEditMode]);

  // Merge private and public dishes everytime there's a change in one of the lists
  useEffect(() => {
    mergePrivateAndPublic();
  }, [props.favoriteDishes, props.publicDishes]);

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
    if (!menuData.days[destination.index].enabled) return;

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

  const onSaveClick = (menuShareState, menuNameState) => {
    // Generate menu preview
    var images = [];
    for (var i = 0; i < menuData.days.length; i++) {
      for (var j = 0; j < menuData.days.length; j++) {
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
      days: menuData.days,
      meals: menuData.meals,
      dishes: randomDishes,
      previewImages: previewImages,
      sharePublic: menuShareState,
      name: menuNameState
    };

    props.setMenu(menu, auth.authState.user.uid);

    setSaveModalShow(false); // Hide the modal
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
    props.searchAllDishes(auth.authState.user.uid, query, filters);
  };

  const onSearchClear = (filters = selectedFilters) => {
    // If there's filters are on, search for filters only without a query
    if (filters && filters.length > 0) {
      handleSelectedFilters(filters);
    }

    // No filters, clear search
    else {
      setIsSearchMode(false);
      props.clearSearchAllDishes();
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
      props.clearSearchAllDishes();
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

  const isUserLoggedIn = () => {
    if (auth.authState.user && auth.authState.user.uid) {
      return true;
    } else {
      return false;
    }
  };

  const validateLoggedInUser = () => {
    if (isUserLoggedIn() === false) {
      alert("Please Login first");
      return false;
    }

    return true;
  };

  const onEditClick = () => {
    if (validateLoggedInUser() === false) return;
    setIsEditMode(true);
    setBlockLeave(true);
  };

  const onShareClick = () => {
    if (validateLoggedInUser() === false) return;

    setShareModalShow(true);
  };

  const onTourClose = () => {
    setShowTour(false);
    if (!auth.authState.user) return;
    props.setUserSeeTour(auth.authState.user.uid);
  };

  /**
   * If there's no days and meals data in menu
   */
  if (!menuData || !menuData.meals || !menuData.days) {
    // If the menu was opened via shared link, it's data is being fetched, show loading
    if (isSharedMenu) {
      return <div className="center-text">Loading...</div>;
    }
  }

  /**
   * If there's no menu data and no logged in user in order to fetch menu, show login message
   */
  if (
    !menuData.days &&
    !auth.authState.user &&
    auth.authState.authStatusReported
  ) {
    return (
      <div className="center-text">Please log in to create your own menu!</div>
    );
  }

  /**
   * If dishes data is still loading, show loading message
   */
  if (
    !isSharedMenu &&
    (!props.favoriteDataReceived || !props.publicDataReceived || !randomDishes)
  ) {
    return <div className="center-text">Loading...</div>;
  }

  const PrintAndShare = () => {
    return (
      <>
        <ReactToPrint
          trigger={() => (
            <Button className="meal-plan-btn">
              <i
                className="fa fa-print"
                aria-hidden="true"
                ref={triggerPrintRef}
              ></i>
            </Button>
          )}
          content={() => componentRef.current}
        />

        {/* Share menu only after it was saved to backend and it has it's unique id*/}
        {menuData.id && (
          <Button
            className="meal-plan-btn"
            onClick={() => {
              onShareClick();
            }}
          >
            <i className="fas fa-share-alt" ref={triggerShareRef}></i>
          </Button>
        )}

        <ImportDish
          addDish={dish => {
            props.addDish(dish, auth.authState.user.uid);
          }}
          hideButton={true}
          type={ImportDishType.BUTTON}
          allowRedirect={false}
        />
      </>
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
      <SaveModal
        saveModalShow={saveModalShow}
        toggle={() => setSaveModalShow(!saveModalShow)}
        onSaveClick={(menuShareState, menuNameState) =>
          onSaveClick(menuShareState, menuNameState)
        }
      />
      <ShareModal
        isPrivateMenu={!menuData.sharePublic}
        show={shareModalShow}
        handleHide={() => {
          setShareModalShow(false);
        }}
        days={menuData.days}
        meals={menuData.meals}
        randomDishes={randomDishes}
        uid={
          auth.authState && auth.authState && auth.authState.user
            ? auth.authState.user.uid
            : null
        }
        handleMakePublic={() => {
          // Set as public in backend
          props.makeMenuPublic(menuData.id, auth.authState.user.uid);

          // Set as public locally
          setMenuData({
            ...menuData,
            sharePublic: true
          });
        }}
        menuName={menuData.name}
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
        edit={false}
      />

      <div
        ref={componentRef}
        className={classNames({
          share: shareModalShow
        })}
      >
        <div className="print-only page-title">
          <span>Pure Meal Plan</span>
          <br />
          <span>https://puremealplan.com/</span>
        </div>
        <DragDropContext
          onDragEnd={result => onDragEnd(result)}
          onDragStart={e => onDragStart(e)}
        >
          {isEditMode && (
            <div className="generate-btn-wrapper">
              <MDBBtn
                className="generate-btn random-btn"
                onClick={() => handleRandomClick()}
              >
                RANDOM!
              </MDBBtn>
              <Button
                className="meal-plan-btn"
                onClick={() => {
                  setBlockLeave(false); // Alow to leave the page after edit is done
                  setSaveModalShow(true);
                }}
              >
                Save
              </Button>
              <PrintAndShare />
            </div>
          )}
          {!isEditMode && (
            <div className="generate-menu-edit">
              <Button
                className="meal-plan-btn generate-btn "
                onClick={() => {
                  onEditClick();
                }}
              >
                EDIT
              </Button>
              <PrintAndShare />
            </div>
          )}

          {isEditMode && (
            <div className="panel-wrapper">
              <div className="dummy" />
              <div
                className={classNames("panel-handle", "filters-and-search", {
                  "is-open": showPanel
                })}
                onClick={() => setShowPanel(!showPanel)}
              >
                + Search and Filter
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
              days={menuData.days}
              meals={menuData.meals}
              randomDishes={randomDishes}
              onMinusClick={onMinusClick}
              handleDishLock={handleDishLock}
              handleDishUnlock={handleDishUnlock}
              setShowPanel={setShowPanel}
              showPlusButton={showPlusButton}
              isEditMode={isEditMode}
              onDishClicked={dish => {
                setShowEditDishModal({ show: true, dish: dish });
              }}
            />

            <div
              className={classNames("panel-wrap", showPanel ? "show" : "hide")}
            >
              <SearchPanel
                onSearch={onSearch}
                onSearchClear={onSearchClear}
                isSearchMode={isSearchMode}
                searchReceived={props.searchReceived}
                searchResult={props.searchResult}
                isEditMode={isEditMode}
                onPanelClose={() => setShowPanel(false)}
                filters={props.suggestedFilters}
                removeFilter={filter => removeFilter(filter)}
                applyFilter={filter => applyFilter(filter)}
              />
            </div>
          </div>
        </DragDropContext>
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
