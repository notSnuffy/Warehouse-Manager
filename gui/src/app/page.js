"use client";
import { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import useSWR from "swr";

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
  const [shouldFetch, setShouldFetch] = useState(false);
  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data } = useSWR(
    shouldFetch ? "http://localhost:8080" : null,
    fetcher,
  );

  const handleClick = () => {
    setShouldFetch(true);
  };

  return (
    <main>
      <p> Hello World! </p>
      <div className="card">
        <Button
          icon="pi pi-plus"
          className="mr-2"
          label="Fetch Data"
          disabled={shouldFetch}
          onClick={handleClick}
        ></Button>
        <InputText value={data ? data.message : ""} />
      </div>
    </main>
  );
}

export default Home;
