import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import { MDBBadge } from "mdbreact";
import DragAndDrop from "../abstract/DragAndDrop";
import DishPlaceholder from "../../images/DishPlaceholder.png";
import DishTags from "./DishTags";
import PropTypes from "prop-types";
import { fetchMeals } from "../../store/actions/Actions";
import { connect } from "react-redux";
import { useAuth } from "../auth/UseAuth";
import "../../scss/NewDish.scss";
import classNames from "classnames";

const DISH_NAME_ERROR = "Name must be at least 3 characters";
const DISH_MEAL_ERROR = "Select at least one meal";

const mapStateToProps = state => {
  return {
    meals: state.meals.meals,
    dataReceived: state.meals.dataReceived
  };
};

const mapDispatchToProps = dispatch => ({
  fetchMeals: uid => dispatch(fetchMeals(uid))
});

const NewDish = props => {
  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  /** Dish state */
  const [dish, setDish] = useState({
    name: props.dish && props.dish.name ? props.dish.name : null,
    localImageUrl: props.dish && props.dish.image ? props.dish.image : null,
    imageFile: null,
    recipe: null,
    meals: [],
    tags: [],
    sharePublic: true
  });

  /** Errors state */
  const [errors, setErrors] = useState({
    name: DISH_NAME_ERROR,
    meals: DISH_MEAL_ERROR
  });

  /** Meals state */
  const [meals, setMeals] = useState([
    { name: "Breakfast", id: 300 },
    { name: "Lunch", id: 301 },
    { name: "Snack", id: 302 },
    { name: "Dinner", id: 303 }
  ]);

  /**
  Selected Meals */
  const [selectedMeals, setSelectedMeals] = useState([]);

  /**
   * Fetch once the user's saved meals
   */
  useEffect(() => {
    if (!auth.authState.user) return;
    props.fetchMeals(auth.authState.user.uid);
  }, []);

  /**
   * After the saved meals are fetched, set the result into local meals
   */
  useEffect(() => {
    // If data already recieved set it to state
    if (props.dataReceived && props.meals && props.meals.length > 0) {
      setMeals(props.meals);
    }
  }, [props.dataReceived, props.meals]);

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

  const handleDishNameChange = event => {
    var nameError = event.target.value.length < 3 ? DISH_NAME_ERROR : "";

    setErrors({ ...errors, name: nameError });

    setDish({
      ...dish,
      name: event.target.value
    });
  };

  /** Add or Remove item from selectedMeals  */
  const toggleMealSelection = meal => {
    var isSelected = selectedMeals.includes(meal);
    var selectedMealsCopy;
    if (isSelected) {
      selectedMealsCopy = selectedMeals.filter(
        currentMeal => currentMeal.id !== meal.id
      );

      setSelectedMeals(selectedMealsCopy);
    } else {
      selectedMealsCopy = [...selectedMeals, meal];
      setSelectedMeals(selectedMealsCopy);
    }

    var mealsError = selectedMealsCopy.length < 1 ? DISH_MEAL_ERROR : "";
    setErrors({ ...errors, meals: mealsError });
  };

  /** Validate the form and add the dish */
  const onSubmit = e => {
    e.preventDefault();

    if (errors.name.length === 0 && errors.meals.length === 0) {
      dish.meals = selectedMeals;
      props.onDishAdded(dish);
    }
  };

  /** Call Click on fileUploader ref */
  const onFileBrowserClick = () => {
    fileUploaderInput.current.click();
  };

  /** Use placeholder or local image url if exist */
  var imageSrc = DishPlaceholder;
  if (dish.localImageUrl) {
    imageSrc = dish.localImageUrl;
  }

  return (
    <Form onSubmit={onSubmit} id="newDishForm">
      <Form.Group controlId="dishImage">
        <div className="newDishImageTitle">
          <Form.Label>Drag image or</Form.Label>

          {/** File Uploader without input **/}
          <Form.Label className="file-browser" onClick={onFileBrowserClick}>
            &nbsp;click here:
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
      </Form.Group>
      <Form.Group as={Row} controlId="dishName">
        <Form.Label column sm="2">
          Name
        </Form.Label>
        <Col sm="8">
          <Form.Control
            type="text"
            value={dish.name}
            placeholder=""
            onChange={event => handleDishNameChange(event)}
            required
          />
          {errors.name.length > 0 && (
            <span className="error">{errors.name}</span>
          )}
        </Col>
      </Form.Group>
      <Form.Group as={Row} controlId="meals">
        <Form.Label column sm="2">
          Meals
        </Form.Label>
        <Col sm="8">
          {meals.map((meal, index) => {
            return (
              <MDBBadge
                key={index}
                pill
                color="primary"
                className={classNames("meal-pill", {
                  active: selectedMeals.includes(meal)
                })}
                onClick={() => toggleMealSelection(meal)}
              >
                {meal.name}
              </MDBBadge>
            );
          })}
          {errors.meals.length > 0 && (
            <span className="error">{errors.meals}</span>
          )}
        </Col>
      </Form.Group>
      <Form.Group as={Row} controlId="dishTags">
        <Form.Label column sm="2">
          Tags
        </Form.Label>
        <Col sm="8">
          <DishTags
            onChange={event => {
              setDish({
                ...dish,
                tags: event
              });
            }}
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} controlId="dishLink">
        <Form.Label column sm="2">
          Link
        </Form.Label>
        <Col sm="8">
          <Form.Control
            type="text"
            onChange={event =>
              setDish({
                ...dish,
                link: event.target.value
              })
            }
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} controlId="dishTextArea">
        <Form.Label column sm="2">
          Recipe
        </Form.Label>
        <Col sm="8">
          <Form.Control
            as="textarea"
            onChange={event =>
              setDish({
                ...dish,
                recipe: event.target.value
              })
            }
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} controlId="sharePublic">
        <Form.Label column sm="2">
          Share public
        </Form.Label>
        <Col sm="8">
          <div className="custom-control custom-radio custom-control-inline">
            <input
              type="radio"
              className="custom-control-input"
              id="shareYes"
              name="share"
              defaultChecked
            />
            <label
              className="custom-control-label"
              htmlFor="shareYes"
              onClick={() =>
                setDish({
                  ...dish,
                  sharePublic: true
                })
              }
            >
              Yes
            </label>
          </div>

          <div className="custom-control custom-radio custom-control-inline">
            <input
              type="radio"
              className="custom-control-input"
              id="shareNo"
              name="share"
            />
            <label
              className="custom-control-label"
              htmlFor="shareNo"
              onClick={() =>
                setDish({
                  ...dish,
                  sharePublic: false
                })
              }
            >
              No
            </label>
            <OverlayTrigger
              placement={"top"}
              overlay={
                <Tooltip>
                  Share your dish anonymously with our community and get others
                  inspired!
                </Tooltip>
              }
            >
              <i className="fas fa-question-circle fa-sm"></i>
            </OverlayTrigger>
          </div>
        </Col>
      </Form.Group>
      <Button variant="outline" type="submit" className="btn-new-dish">
        Add
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
