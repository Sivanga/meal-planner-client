import { ADD_DISH, REMOVE_DISH } from "../constants/Action-types";

const initialState = [
  {
    id: 0,
    isSample: true,
    name: "Shakshuka",
    image: "shakshuka.jpg",
    tags: [{ id: 1, name: "Vegeterian" }, { id: 2, name: "Dinner" }]
  },
  {
    id: 1,
    isSample: true,
    name: "Noodles Soup",
    image: "noodles.jpg",
    tags: [
      { id: 1, name: "Chicken" },
      { id: 2, name: "Lunch" },
      { id: 3, name: "Winter" }
    ]
  },
  {
    id: 3,
    isSample: true,
    name: "Spaggheti",
    image: "spagetti.jpg",
    tags: [{ id: 1, name: "Vegeterian" }, { id: 2, name: "Lunch" }]
  }
];

function DishReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_DISH:
      var dish = action.payload.dish;
      dish.id = state.length + 1;
      return [dish, ...state];
    case REMOVE_DISH:
      var id = action.payload.id;
      return [...state.filter(dish => dish.id !== id)];
    default:
      return state;
  }
}

export default DishReducer;
