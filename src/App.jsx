import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { SchoolYearProvider } from "./context/SchoolYearContext";

/* GLOBAL STYLE */
import "./styles/variables.css";
import "./styles/global.css";

function App() {
  return (
    <SchoolYearProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </SchoolYearProvider>
  );
}

export default App;
