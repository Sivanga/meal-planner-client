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
    meals: state.meals.meals,
    dataReceived: state.meals.dataReceived
  };
};

const mapDispatchToProps = dispatch => ({
  fetchMeals: uid => dispatch(fetchMeals(uid)),
  setPreviousLocationFavorites: () =>
    dispatch(setPreviousLocationFavorites(ACTIVE_VIEW_DISHES))
});

const NewDish = props => {
  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  /** Used to redirect to dishes list after saving the menu */
  let history = useHistory();

  /** Dish state */
  const [dish, setDish] = useState(props.dish ? props.dish : { name: "" });

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
    props.dish && props.dish.meals ? props.dish.meals : []
  );

  /**
   * Fetch once the user's saved meals
   */
  useEffect(() => {
    if (!auth.authState.user) return;
    if (!props.dataReceived) {
      props.fetchMeals(auth.authState.user.uid);
    } else {
      if (props.meals && props.meals.length > 0) {
        setMeals(props.meals);
      }
    }
  }, [auth, props.dataReceived]);

  /** Create a ref for a File Uploader in order to not use it's default input **/
  let fileUploaderInput = React.createRef();

  /** Handle file drop */
  const handleDrop = files => {
    var localImageUrl = URL.createObjectURL(files[0]);
    var imageFile = files[0];

    setDish({
      ...dish,
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
  };

  /** Validate the form and add the dish */
  const onSubmit = event => {
    event.preventDefault();
    event.stopPropagation();

    if (!props.edit) {
      props.onClose();
      return;
    }

    setSelectedMealsErrors();

    const form = event.currentTarget;
    var isValid = form.checkValidity() && errors.meals === DISH_MEAL_VALID;

    setValidated(true);

    if (isValid) {
      // Set selected meals
      dish.meals = selectedMeals;

      // Set share public if not already defind
      if (!dish.hasOwnProperty("sharePublic")) dish.sharePublic = true;

      props.onDishAdded(dish);

      // Check if redirect is wanted
      if (typeof props.allowRedirect !== "undefined" && !props.allowRedirect)
        return;

      // Go to My Favorites to Dishes view
      props.setPreviousLocationFavorites();
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
  if (dish && dish.localImageUrl) {
    imageSrc = dish.localImageUrl;
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
            readOnly={!props.edit}
            type="text"
            value={dish && dish.name ? dish.name : ""}
            placeholder=""
            onChange={event =>
              setDish({
                ...dish,
                name: event.target.value
              })
            }
            required
            error={dish && dish.name === ""}
            helperText={dish && dish.name === "" ? "Required" : ""}
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
      <Form>
        <Form.Group as={Row} controlId="dishTags">
          <Col xs="8" sm="6">
            <DishTags
              canEdit={props.edit}
              tags={dish && dish.tags ? dish.tags : []}
              onChange={tags => {
                if (props.edit) {
                  setDish({
                    ...dish,
                    tags: tags
                  });
                }
              }}
            />
          </Col>

          <Col xs="8" sm="6" className>
            <TextField
              fullWidth
              noWrap
              label="Link:"
              readOnly={!props.edit}
              value={dish && dish.link ? dish.link : ""}
              onChange={event =>
                setDish({
                  ...dish,
                  link: event.target.value
                })
              }
              onClick={() => {
                if (dish && dish.link) {
                  window.open(dish.link);
                }
              }}
            />
          </Col>
        </Form.Group>
      </Form>
      <Form.Group as={Row} controlId="dishTextArea">
        <Col sm="8">
          <TextField
            margin="normal"
            fullWidth
            noWrap
            multiline
            rows={4}
            label="Ingredients:"
            readOnly={!props.edit}
            value={dish && dish.ingredient ? dish.ingredient : ""}
            onChange={event =>
              setDish({
                ...dish,
                ingredient: event.target.value
              })
            }
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="sharePublic">
        <Col sm="8">
          <FormControlLabel
            margin="none"
            control={
              <Checkbox
                disabled={!props.edit}
                className="dish-public-share"
                checked={
                  dish && dish.hasOwnProperty("sharePublic")
                    ? dish.sharePublic
                    : true
                }
                onChange={e =>
                  setDish({
                    ...dish,
                    sharePublic:
                      dish && dish.hasOwnProperty("sharePublic")
                        ? !dish.sharePublic
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
        {props.edit ? "Add" : "Close"}
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
