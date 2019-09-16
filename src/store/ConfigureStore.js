import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunkMiddleware from "redux-thunk";
import loggerMiddleware from "./middleware/Logger";
import monitorReducerEnhancer from "./enhancers/MonitorReducer";
import RootReducer from "./reducers/RootReducer";

export default function configureStore(preloadedState) {
  const middlewares = [loggerMiddleware, thunkMiddleware];
  const middlewareEnhancer = applyMiddleware(...middlewares);

  const enhancers = [middlewareEnhancer];
  const composedEnhancers = composeWithDevTools(...enhancers);

  const store = createStore(RootReducer, preloadedState, composedEnhancers);

  if (process.env.NODE_ENV !== "production" && module.hot) {
    module.hot.accept("./reducers/RootReducer.js", () =>
      store.replaceReducer(RootReducer)
    );
  }

  return store;
}
