import React from "react";
import "./SchoolYearTermSelector.css";

const SchoolYearTermSelector = ({
  selectedSchoolYear,
  selectedTerm,
  onYearChange,
  onTermChange,
  className = "",
}) => {
  return (
    <div className={`school-year-term-selector ${className}`}>
      <div className="school-year-term-selector__group">
        <span className="school-year-term-selector__label">Năm học</span>
        <div className="school-year-term-selector__year-input-wrapper">
          <button
            type="button"
            className="school-year-term-selector__arrow-btn"
            onClick={() => onYearChange("prev")}
            title="Năm trước"
            aria-label="Năm trước"
          >
            ◀
          </button>
          <input
            type="text"
            value={selectedSchoolYear}
            readOnly
            className="school-year-term-selector__year-input"
            aria-label="Năm học đang chọn"
          />
          <button
            type="button"
            className="school-year-term-selector__arrow-btn"
            onClick={() => onYearChange("next")}
            title="Năm sau"
            aria-label="Năm sau"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="school-year-term-selector__group">
        <span className="school-year-term-selector__label">Học kỳ</span>
        <div className="school-year-term-selector__term-toggle">
          <button
            type="button"
            className={`school-year-term-selector__term-btn ${selectedTerm === "hk1" ? "is-active" : ""}`}
            onClick={() => onTermChange("hk1")}
          >
            Học kỳ 1
          </button>
          <button
            type="button"
            className={`school-year-term-selector__term-btn ${selectedTerm === "hk2" ? "is-active" : ""}`}
            onClick={() => onTermChange("hk2")}
          >
            Học kỳ 2
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchoolYearTermSelector;
