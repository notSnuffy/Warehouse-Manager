"use client";
import { incrementByAmount } from "@/lib/features/test/testSlice";
import { Button } from "primereact/button";
import { useDispatch, useSelector } from "react-redux";

/**
 * Renders a React component that displays a greeting message.
 * @memberof module:Test
 * @param {Object} props - The props object.
 * @returns {JSX.Element} The rendered React component.
 */
function Test() {
  let name = "World";
  const test = useSelector((state) => state.rootReducer.test.value);
  const dispatch = useDispatch();
  return (
    <>
      <h1>Hello, {name}</h1>
      <h2>{test}</h2>
      <Button
        label="Increment"
        onClick={() => dispatch(incrementByAmount(2))}
      />
    </>
  );
}

export default Test;
