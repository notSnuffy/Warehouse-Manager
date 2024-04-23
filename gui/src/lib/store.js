import { configureStore, combineReducers } from "@reduxjs/toolkit";
import testReducer from "./features/test/testSlice";
import shapesReducer from "./features/shapes/shapesSlice";

const rootReducer = combineReducers({
  test: testReducer,
  shapes: shapesReducer,
});

export const makeStore = () => {
  return configureStore({
    reducer: {
      rootReducer,
    },
  });
};
