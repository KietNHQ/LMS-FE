import React, { createContext, useContext, useState } from "react";
import { getCurrentSchoolYear, getCurrentTerm, shiftSchoolYear } from "../utils/dateUtils";

const SchoolYearContext = createContext(null);

export const SchoolYearProvider = ({ children }) => {
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(getCurrentSchoolYear());
  const [selectedTerm, setSelectedTerm] = useState(getCurrentTerm());

  const handleYearArrow = (direction) => {
    setSelectedSchoolYear((prevYear) => shiftSchoolYear(prevYear, direction));
  };

  const handleTermChange = (term) => {
    setSelectedTerm(term);
  };

  const value = {
    selectedSchoolYear,
    selectedTerm,
    handleYearArrow,
    handleTermChange,
    setSelectedSchoolYear,
    setSelectedTerm,
  };

  return (
    <SchoolYearContext.Provider value={value}>
      {children}
    </SchoolYearContext.Provider>
  );
};

export const useSchoolYearContext = () => {
    const context = useContext(SchoolYearContext);
    if (!context) {
        throw new Error("useSchoolYearContext must be used within a SchoolYearProvider");
    }
    return context;
};
