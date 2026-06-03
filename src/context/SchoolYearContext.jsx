import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentSchoolYear, getCurrentTerm, shiftSchoolYear } from "../utils/dateUtils";
import { resolveCurrentTermKey } from "../services/shared/schoolYearLookup";

const SchoolYearContext = createContext(null);

export const SchoolYearProvider = ({ children }) => {
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(getCurrentSchoolYear());
  const [selectedTerm, setSelectedTerm] = useState(getCurrentTerm());

  useEffect(() => {
    const hasToken =
      sessionStorage.getItem("accessToken") ||
      (localStorage.getItem("isPersistent") === "true" && localStorage.getItem("accessToken"));
    if (!hasToken) return;

    let cancelled = false;
    resolveCurrentTermKey(selectedSchoolYear).then((term) => {
      if (!cancelled && term) setSelectedTerm(term);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedSchoolYear]);

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

