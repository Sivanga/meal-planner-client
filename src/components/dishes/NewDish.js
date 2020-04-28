import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import DragAndDrop from "../abstract/DragAndDrop";
import DishPlaceholder from "../../images/DishPlaceholder.png";
import DishTags from "./DishTags";
import DishMeals from "./DishMeals";
import PropTypes from "prop-types";
import { fetchMeals } from "../../store/actions/Actions";
import {
  setPreviousLocationFavorites,
  ACTIVE_VIEW_DISHES
} from "../../store/actions/PreviousLocation";
import { connect } from "react-redux";
import { useAuth } from "../auth/UseAuth";
import "../../scss/NewDish.scss";
import { useHistory } from "react-router-dom";
import {
  TextField,
  FormControlLabel,
  Checkbox,
  FormHelperText
} from "@material-ui/core";

const DISH_MEAL_ERROR = "Please select at least one meal";
const DISH_MEAL_VALID = "valid";

const mapStateToProps = state => {
  return {
    mealsSore: state.meals.meals,
    dataReceived: state.meals.dataReceived
  };
};

const mapDispatchToProps = dispatch => ({
  fetchMeals: uid => dispatch(fetchMeals(uid)),
  setPreviousLocationFavorites: () =>
    dispatch(setPreviousLocationFavorites(ACTIVE_VIEW_DISHES))
});

const NewDish = ({
  mealsSore,
  dataReceived,
  fetchMeals,
  setPreviousLocationFavorites,
  dish,
  onDishAdded,
  allowRedirect
}) => {
  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  /** Used to redirect to dishes list after saving the menu */
  let history = useHistory();

  /** Dish state */
  const [dishState, setDishState] = useState(dish ? dish : { name: "" });

  const [validated, setValidated] = useState(false);

  /** Errors state */
  const [errors, setErrors] = useState({
    meals: null
  });

  /** Meals state */
  const [meals, setMeals] = useState([
    { name: "Breakfast" },
    { name: "Lunch" },
    { name: "Snack" },
    { name: "Dinner" }
  ]);

  /**
  Selected Meals */
  const [selectedMeals, setSelectedMeals] = useState(
    dishState && dishState.meals ? dishState.meals : []
  );

  /**
   * Fetch once the user's saved meals
   */
  useEffect(() => {
    if (!auth.authState.user) return;
    if (!dataReceived) {
      fetchMeals(auth.authState.user.uid);
    } else {
      if (mealsSore && mealsSore.length > 0) {
        setMeals(mealsSore);
      }
    }
  }, [auth, dataReceived]);

  /** Create a ref for a File Uploader in order to not use it's default input **/
  let fileUploaderInput = React.createRef();

  /** Handle file drop */
  const handleDrop = files => {
    var localImageUrl = URL.createObjectURL(files[0]);
    var imageFile = files[0];

    setDishState({
      ...dishState,
      localImageUrl: localImageUrl,
      imageFile: imageFile
    });
  };

  /** Add or Remove item from selectedMeals  */
  const toggleMealSelection = meal => {
    var isSelected = selectedMeals.includes(meal);
    var selectedMealsCopy;

    // Remove from selectedMeals
    if (isSelected) {
      selectedMealsCopy = selectedMeals.filter(
        currentMeal => currentMeal.name !== meal.name
      );
      setSelectedMeals(selectedMealsCopy);
    }

    // Insert to selectedMeals
    else {
      selectedMealsCopy = [...selectedMeals, meal];
      setSelectedMeals(selectedMealsCopy);
    }

    setSelectedMealsErrors(selectedMealsCopy);
  };

  const setSelectedMealsErrors = (selectedMealsCopy = selectedMeals) => {
    var mealsError =
      selectedMealsCopy.length < 1 ? DISH_MEAL_ERROR : DISH_MEAL_VALID;
    setErrors({ ...errors, meals: mealsError });
    return mealsError;
  };

  /** Validate the form and add the dish */
  const onSubmit = event => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;
    var isValid =
      form.checkValidity() && setSelectedMealsErrors() === DISH_MEAL_VALID;

    setValidated(true);
    if (isValid) {
      // Set selected meals
      dishState.meals = selectedMeals;

      // Set share public if not already defind
      if (!dishState.hasOwnProperty("sharePublic"))
        dishState.sharePublic = true;

      onDishAdded(dishState);

      // Check if redirect is wanted
      if (typeof allowRedirect !== "undefined" && !allowRedirect) return;

      // Go to My Favorites to Dishes view
      setPreviousLocationFavorites();
      history.push("/myFavorites");
    }
  };

  /** Call Click on fileUploader ref */
  const onFileBrowserClick = () => {
    fileUploaderInput.current.click();
  };

  const addNewMeal = name => {
    name = name.split(" ").join("");
    if (name.length === 0) return;
    if (meals.find(currMeal => currMeal.name === name)) {
      return;
    }
    setMeals([...meals, { name: name }]);
  };

  /** Use placeholder or local image url if exist */
  var imageSrc = DishPlaceholder;
  if (dishState && dishState.localImageUrl) {
    imageSrc = dishState.localImageUrl;
  }

  return (
    <Form onSubmit={onSubmit} id="newDishForm" noValidate validated={validated}>
      <Form.Group as={Row} controlId="dishImage">
        <Col sm="6" className="newDishImage">
          <div className="newDishImageTitle">
            <Form.Label>Drag image or</Form.Label>
            {/** File Uploader without input **/}
            <Form.Label className="file-browser" onClick={onFileBrowserClick}>
              &nbsp;<strong>click here:</strong>
              <input
                style={{ display: "none" }}
                ref={fileUploaderInput}
                type="file"
                accept="image/*"
                onChange={e => {
                  handleDrop([...e.target.files]);
                }}
              />
            </Form.Label>
          </div>
          <DragAndDrop handleDrop={handleDrop}>
            <div className="dishImage">
              <img src={imageSrc} alt="" />
            </div>
          </DragAndDrop>
        </Col>
        <Col xs="8" sm="6">
          <TextField
            fullWidth
            label="Dish Name"
            type="text"
            value={dishState && dishState.name ? dishState.name : ""}
            placeholder=""
            onChange={event =>
              setDishState({
                ...dishState,
                name: event.target.value
              })
            }
            required
            error={dishState && dishState.name === ""}
            helperText={dishState && dishState.name === "" ? "Required" : ""}
          />
          <DishMeals
            meals={meals}
            selectedMeals={selectedMeals}
            toggleMealSelection={meal => toggleMealSelection(meal)}
            addNewMeal={name => addNewMeal(name)}
          />
          {errors.meals && errors.meals !== DISH_MEAL_VALID && (
            <span className="error">{errors.meals}</span>
          )}
        </Col>
      </Form.Group>
      <Form.Group as={Row}>
        <Col xs="8" sm="6">
          <DishTags
            id="tags-auto-complete"
            tags={dishState && dishState.tags ? dishState.tags : []}
            onChange={tags => {
              setDishState({
                ...dishState,
                tags: tags
              });
            }}
          />
        </Col>
        <Col xs="8" sm="6" className="new-dish-ingredients">
          <TextField
            fullWidth
            noWrap
            multiline
            rows={4}
            label="Ingredients:"
            value={
              dishState && dishState.ingredient ? dishState.ingredient : ""
            }
            onChange={event =>
              setDishState({
                ...dishState,
                ingredient: event.target.value
              })
            }
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} controlId="dishTextArea">
        <Col xs="8" sm="6">
          <TextField
            fullWidth
            noWrap
            label="Link:"
            value={dishState && dishState.link ? dishState.link : ""}
            onChange={event =>
              setDishState({
                ...dishState,
                link: event.target.value
              })
            }
            onClick={() => {
              if (dishState && dishState.link) {
                window.open(dishState.link);
              }
            }}
          />
        </Col>

        <Col sm="6" className="new-dish-share">
          <FormControlLabel
            margin="none"
            control={
              <Checkbox
                className="dish-public-share"
                checked={
                  dishState && dishState.hasOwnProperty("sharePublic")
                    ? dishState.sharePublic
                    : true
                }
                onChange={e =>
                  setDishState({
                    ...dishState,
                    sharePublic:
                      dishState && dishState.hasOwnProperty("sharePublic")
                        ? !dishState.sharePublic
                        : false
                  })
                }
                name="Visibility"
              />
            }
            label="Visibility"
          />
          <FormHelperText>
            Share anonymously with our community and get others inspired!
          </FormHelperText>
        </Col>
      </Form.Group>
      <Button variant="outline" type="submit" className="btn-new-dish">
        {dish ? "Edit" : "Add"}
      </Button>
    </Form>
  );
};

NewDish.propTypes = {
  onDishAdded: PropTypes.func
};

const NewDishComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(NewDish);
export default NewDishComponent;
