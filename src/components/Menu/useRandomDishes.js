import { useState } from "react";

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

        const randomDish = getRandomDish(meal, randomDishesSource, true);
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

  /** Recompute all unlocked dishes
   */
  const handleRandomClick = (useFilterMode = false) => {
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

        // No more dishes in search result to be used
        if (
          useFilterMode &&
          randomDishesSource.search.length === 0 &&
          (isFilterMode || isSearchMode)
        ) {
          return copy[mealIndex][dayIndex];
        }
        const randomDish = getRandomDish(
          meal,
          randomDishesSource,
          false,
          useFilterMode
        );
        // Remove random dish from the source so we won't pick it up again
        if (randomDish) {
          randomDishesSource = removeDishFromRandomSource(
            randomDishesSource,
            randomDish.id
          );
          copy[mealIndex][dayIndex] = randomDish;
        }
      });
    });

    // Set result
    setRandomDishes(copy);
  };

  /** Recopute all unloacked dishes from the filtered results */
  const handleFilterRandomClick = () => {
    return handleRandomClick(true);
  };

  /**
   * @param  {The wanted meal for the retrned dish} meal
   * @param  {The source of dishes to choose from} randomDishesSource
   * @param  {If no dish was found for wanted meal, return any dish from source} returnAnyIfMealNotFound
   */
  const getRandomDish = (
    meal,
    randomDishesSource,
    returnAnyIfMealNotFound,
    useFilterMode = false
  ) => {
    var dishes;

    // If isFilterMode, get dishes from search result. If there isn't any dishes
    // in the search result, get from all dishes source
    if (useFilterMode && (isFilterMode || isSearchMode)) {
      dishes = findDishesForMeal(
        randomDishesSource.search,
        meal,
        returnAnyIfMealNotFound
      );
    }
    // Otherwise get dishes from private + public
    else {
      dishes = findDishesForMealFromAllResorces(
        randomDishesSource,
        meal,
        returnAnyIfMealNotFound
      );
    }

    var randomDish = null;
    if (dishes && dishes.length > 0) {
      randomDish = dishes[Math.floor(Math.random() * dishes.length)];
    }
    return randomDish;
  };

  const findDishesForMealFromAllResorces = (
    randomDishesSource,
    meal,
    returnAnyIfMealNotFound
  ) => {
    // First find a random dish from favorites that matches this meal
    const mealsFavoriteDishes = findDishesForMeal(
      randomDishesSource.private,
      meal,
      false
    );
    var mergedDishes = mealsFavoriteDishes;

    // If no dishes found, use public dishes as well
    if (!mealsFavoriteDishes || mealsFavoriteDishes.length < 1) {
      const mealsPublicDishes = findDishesForMeal(
        randomDishesSource.public,
        meal,
        returnAnyIfMealNotFound
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

  const findDishesForMeal = (dishes, meal, returnAnyIfMealNotFound) => {
    var dishesToReturn = dishes.filter(dish =>
      dish.meals.some(
        currMeal => currMeal.name.toUpperCase() === meal.name.toUpperCase()
      )
    );
    // Return dishes for meal if found any
    if (dishesToReturn.length > 0) {
      return dishesToReturn;
    }
    // Otherwise - didn't find dish for this specific meal
    if (returnAnyIfMealNotFound) {
      return dishes;
    } else {
      return [];
    }
  };

  const removeObjectFromArray = (array, id) => {
    return array.filter(curr => curr.id !== id);
  };

  return {
    randomDishes,
    setRandomDishes,
    computeRandomDishes,
    handleRandomClick,
    handleFilterRandomClick
  };
};

export default useRandomDishes;
