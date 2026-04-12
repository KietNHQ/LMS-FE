import React from "react";
import "./Pagination.css";

const Pagination = ({ effectivePage, totalPages, onPrevPage, onNextPage }) => {
  return (
    <div className="students-pagination">
      <button
        type="button"
        className="page-btn"
        onClick={onPrevPage}
        disabled={effectivePage === 1}
        aria-label="Trang trước"
      >
        ‹
      </button>

      <div className="page-indicator">
        <span>{effectivePage}</span>
        <small>/ {totalPages}</small>
      </div>

      <button
        type="button"
        className="page-btn"
        onClick={onNextPage}
        disabled={effectivePage === totalPages}
        aria-label="Trang sau"
      >
        ›
      </button>
    </div>
  );
};

export default Pagination;
