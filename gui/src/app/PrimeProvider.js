"use client";
import { PrimeReactProvider } from "primereact/api";
import "./globals.css";
import "primereact/resources/themes/md-dark-indigo/theme.css";

export default function PrimeProvider({ children }) {
  return <PrimeReactProvider>{children}</PrimeReactProvider>;
}
