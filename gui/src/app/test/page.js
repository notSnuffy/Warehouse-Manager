/**
 * Renders a React component that displays a greeting message.
 * @memberof module:Test
 * @param {Object} props - The props object.
 * @returns {JSX.Element} The rendered React component.
 */
function Test() {
  let name = "World";
  return <h1>Hello, {name}</h1>;
}

export default Test;
