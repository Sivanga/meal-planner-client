import { FETCH_DISHES } from "../constants/Action-types";

const initialState = [
  // {
  //   id: 0,
  //   isSample: true,
  //   name: "Shakshuka",
  //   image: "shakshuka.jpg",
  //   tags: [{ id: 1, name: "Vegeterian" }, { id: 2, name: "Dinner" }]
  // },
  // {
  //   id: 1,
  //   isSample: true,
  //   name: "Noodles Soup",
  //   image: "noodles.jpg",
  //   tags: [
  //     { id: 1, name: "Chicken" },
  //     { id: 2, name: "Lunch" },
  //     { id: 3, name: "Winter" }
  //   ]
  // },
  // {
  //   id: 3,
  //   isSample: true,
  //   name: "Spaggheti",
  //   image: "spagetti.jpg",
  //   tags: [{ id: 1, name: "Vegeterian" }, { id: 2, name: "Lunch" }]
  // },
  // { dataReceived: false }
];

function DishReducer(state = [], action) {
  switch (action.type) {
    case FETCH_DISHES:
      // Create new state for updated dishes array
      // Give each dish it's backend generated id for future reference
      const dishes = action.payload;
      const newDishes = Object.keys(dishes).map(key => {
        dishes[key].dish._id = key;
        return dishes[key].dish;
      });
      const newState = { dishes: newDishes, dataReceived: true };
      return newState;
    default:
      return state;
  }
}

export default DishReducer;
