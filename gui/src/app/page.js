"use client";
import { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

/**
 * @module Test
 */

/**
 * Renders the Home component.
 * @memberof module:Test
 * @example
 * // Renders the Home component!.
 * <Home />
 *
 * @returns {JSX.Element} The rendered Home component.
 */
function Home() {
  const [count, setCount] = useState(0);

  return (
    <main>
      <p> Hello World! </p>
      <div className="card">
        <Button
          icon="pi pi-plus"
          className="mr-2"
          label="Increment"
          onClick={() => setCount((count) => count + 1)}
        ></Button>
        <InputText value={count.toString()} />
      </div>
    </main>
  );
}

export default Home;
