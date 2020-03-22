import React, { useState } from "react";

const useRandomDishes = (
  menuData,
  searchResult,
  favoriteDishes,
  publicDishes,
  isFilterMode,
  isSearchMode
) => {
  /** Random dishes */
  const [randomDishes, setRandomDishes] = useState(
    menuData && menuData.dishes ? menuData.dishes : null
  );

  /**
   * Create random dishes array of the length of days and meals.
   Assign dishes randomally
   */
  var computeRandomDishes = () => {
    // Create matrix to be retuned
    var randomDishes = [];

    // Create random dishes sources object
    var randomDishesSource = createRandomDishesSource();
    menuData.meals.map((meal, mealIndex) => {
      // Create array
      randomDishes[mealIndex] = [];

      menuData.days.map((day, dayIndex) => {
        // Don't assign a dish for a disabled day
        if (!day.enabled) return (randomDishes[mealIndex][dayIndex] = null);

        const randomDish = getRandomDish(meal, randomDishesSource);
        // Remove random dish from the source so we won't pick it up again
        if (randomDish)
          randomDishesSource = removeDishFromRandomSource(
            randomDishesSource,
            randomDish.id
          );

        return (randomDishes[mealIndex][dayIndex] = randomDish);
      });
    });

    // Set result
    setRandomDishes(randomDishes);
  };

  const getRandomDish = (meal, randomDishesSource) => {
    var dishes;
    // If isFilterMode, get dishes from search result
    if (isFilterMode || isSearchMode) {
      dishes = findDishesForMeal(randomDishesSource.search, meal);
    }
    // Otherwise get dishes from private + public
    else {
      dishes = getDishesFromAll(meal, randomDishesSource);
    }

    var randomDish = dishes[Math.floor(Math.random() * dishes.length)];

    if (!randomDish) randomDish = null; // Make sure dish isn't undefiend as the whole menu won't be able to be written to Firedbase

    return randomDish;
  };

  const getDishesFromAll = (meal, randomDishesSource) => {
    // First find a random dish from favorites that matches this meal
    const mealsFavoriteDishes = findDishesForMeal(
      randomDishesSource.private,
      meal
    );
    var mergedDishes = mealsFavoriteDishes;

    // If mealsFavoriteDishes length is less then days length, use public dishes as well
    if (mealsFavoriteDishes.length < menuData.days.length) {
      const mealsPublicDishes = findDishesForMeal(
        randomDishesSource.public,
        meal
      );
      mergedDishes = mealsFavoriteDishes.concat(mealsPublicDishes);
    }

    return mergedDishes;
  };

  const removeDishFromRandomSource = (randomDishesSource, dishId) => {
    const filteredSearch = removeObjectFromArray(
      randomDishesSource.search,
      dishId
    );
    const filteredPrivate = removeObjectFromArray(
      randomDishesSource.private,
      dishId
    );
    const filteredPublic = removeObjectFromArray(
      randomDishesSource.public,
      dishId
    );

    return {
      search: filteredSearch,
      private: filteredPrivate,
      public: filteredPublic
    };
  };

  const createRandomDishesSource = () => {
    return {
      search: searchResult,
      private: favoriteDishes,
      public: publicDishes
    };
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
    var randomDishesSource = createRandomDishesSource();

    menuData.meals.map((meal, mealIndex) => {
      menuData.days.map((day, dayIndex) => {
        // Don't assign a dish for a disabled day
        // Don't replace a locked dish
        if (
          !day.enabled ||
          (copy[mealIndex][dayIndex] && copy[mealIndex][dayIndex].locked)
        )
          return copy[mealIndex][dayIndex];

        const randomDish = getRandomDish(meal, randomDishesSource);
        // Remove random dish from the source so we won't pick it up again
        if (randomDish)
          randomDishesSource = removeDishFromRandomSource(
            randomDishesSource,
            randomDish.id
          );
        copy[mealIndex][dayIndex] = randomDish;
      });
    });

    // Set result
    setRandomDishes(copy);
  };

  const removeObjectFromArray = (array, id) => {
    return array.filter(curr => curr.id !== id);
  };

  return {
    randomDishes,
    setRandomDishes,
    computeRandomDishes,
    handleRandomClick
  };
};

export default useRandomDishes;
