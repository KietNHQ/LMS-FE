import React from "react";
import { FiSearch, FiX } from "react-icons/fi";
import "./SearchBar.css";

export default function SearchBar({
  value = "",
  onChange,
  onClear,
  placeholder = "Search...",
  inputTitle,
  rightAddon = null,
}) {
  const hasValue = typeof value === "string" ? value.length > 0 : Boolean(value);
  const resolvedTitle =
    typeof inputTitle === "string" && inputTitle.trim().length > 0
      ? inputTitle
      : (hasValue ? String(value) : placeholder);

  const handleClear = () => {
    if (typeof onClear === "function") {
      onClear();
      return;
    }

    // Fallback for callers that only wire onChange.
    if (typeof onChange === "function") {
      onChange({ target: { value: "" } });
    }
  };

  return (
    <div className="searchbar">
      <div className="searchbar__input-wrap">
        <FiSearch className="searchbar__icon" />

        <input
          type="text"
          className="searchbar__input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          title={resolvedTitle}
        />

        {hasValue && (
          <button
            type="button"
            className="searchbar__clear"
            onClick={handleClear}
            aria-label="Clear search"
            title="Clear"
          >
            <FiX className="searchbar__clear-icon" size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {rightAddon && <div className="searchbar__addon">{rightAddon}</div>}
    </div>
  );
}
