import React, { useState } from "react";
import { Chip, TextField, InputLabel } from "@material-ui/core";
import "../../scss/DishMeals.scss";

const DishMeals = ({
  meals,
  selectedMeals,
  toggleMealSelection,
  addNewMeal
}) => {
  const [newMealState, setNewMealState] = useState("");

  return (
    <div id="dish-meals">
      <InputLabel>Select Meal:</InputLabel>

      {meals.map((meal, index) => {
        return (
          <Chip
            key={index}
            variant={
              selectedMeals.find(currMeal => currMeal.name === meal.name)
                ? "outlined"
                : "default"
            }
            label={meal.name}
            onClick={() => {
              toggleMealSelection(meal);
            }}
          />
        );
      })}

      <TextField
        size="small"
        variant="filled"
        label="Add new:"
        value={newMealState}
        onKeyPress={event => {
          if (event.key === "Enter") {
            event.preventDefault();
            addNewMeal(event.target.value);
            setNewMealState("");
          }
        }}
        onChange={event => {
          setNewMealState(event.target.value);
        }}
      />
    </div>
  );
};

export default DishMeals;
