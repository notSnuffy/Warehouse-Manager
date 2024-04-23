import { createSlice } from "@reduxjs/toolkit";

export const shapesSlice = createSlice({
  name: "shapes",
  initialState: {
    shapes: [
      {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
      },
      {
        x: 200,
        y: 200,
        width: 100,
        height: 100,
      },
    ],
  },
  reducers: {
    addRectangle: (state, action) => {
      state.shapes.push({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
    },
  },
});

export const { addRectangle } = shapesSlice.actions;

export default shapesSlice.reducer;
