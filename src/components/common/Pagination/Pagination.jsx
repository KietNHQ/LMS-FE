import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./Pagination.css";

const Pagination = ({ currentPage, totalPages, onPageChange, ariaLabel = "Phân trang" }) => {
  const [inputValue, setInputValue] = useState(currentPage);

  useEffect(() => {
    setInputValue(currentPage);
  }, [currentPage]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleInputBlur = () => {
    commitPageChange();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      commitPageChange();
    }
  };

  const commitPageChange = () => {
    const pageNum = parseInt(inputValue, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      if (pageNum !== currentPage) {
        onPageChange(pageNum);
      }
    } else {
      setInputValue(currentPage);
    }
  };

  return (
    <div className="common-pagination" aria-label={ariaLabel}>
      <button
        type="button"
        className="common-pagination-btn"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        aria-label="Trang trước"
      >
        <FiChevronLeft />
      </button>

      <div className="common-pagination-indicator" aria-live="polite">
        <input
          type="text"
          className="common-pagination-input"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          aria-label="Nhập số trang"
        />
        <span className="common-pagination-divider">/</span>
        <span className="common-pagination-total">{totalPages}</span>
      </div>

      <button
        type="button"
        className="common-pagination-btn"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        aria-label="Trang sau"
      >
        <FiChevronRight />
      </button>
    </div>
  );
};

export default Pagination;
