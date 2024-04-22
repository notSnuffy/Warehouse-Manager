import { configureStore } from "@reduxjs/toolkit";
import testReducer from "./features/test/testSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      test: testReducer,
    },
  });
};
