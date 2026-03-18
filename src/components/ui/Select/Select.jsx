import "./Select.css";
import { FiChevronDown } from "react-icons/fi";
import { FiCheck } from "react-icons/fi";
import { useEffect, useMemo, useRef, useState } from "react";

function getOptionValue(option) {
  if (typeof option === "string" || typeof option === "number") return option;
  return option.value;
}

function getOptionLabel(option) {
  if (typeof option === "string" || typeof option === "number") return option;
  return option.label;
}

export default function Select({
  label,
  options = [],
  placeholder,
  error,
  className = "",
  selectClassName = "",
  hideChevron = false,
  variant = "native",
  value,
  onChange,
  name,
  id,
  disabled = false,
  onFocus,
  onBlur,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const customDropdownRef = useRef(null);

  const normalizedOptions = useMemo(() => {
    return options.map((option) => ({
      value: getOptionValue(option),
      label: getOptionLabel(option),
    }));
  }, [options]);

  const selectedOption = useMemo(() => {
    return normalizedOptions.find((option) => String(option.value) === String(value));
  }, [normalizedOptions, value]);

  useEffect(() => {
    if (variant !== "custom") return undefined;

    const handleClickOutside = (event) => {
      if (customDropdownRef.current && !customDropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [variant]);

  const handleFocus = (event) => {
    setIsFocused(true);
    if (typeof onFocus === "function") {
      onFocus(event);
    }
  };

  const handleBlur = (event) => {
    setIsFocused(false);
    if (typeof onBlur === "function") {
      onBlur(event);
    }
  };

  const emitChange = (nextValue) => {
    if (typeof onChange === "function") {
      onChange({
        target: {
          value: nextValue,
          name,
          id,
        },
      });
    }
  };

  if (variant === "custom") {
    return (
      <div className={`ui-select ${className}`.trim()}>
        {label ? <label className="ui-select__label">{label}</label> : null}

        <div className="custom-dropdown" ref={customDropdownRef}>
          <button
            type="button"
            className={`custom-dropdown-trigger ${isOpen ? "open" : ""}`}
            onClick={() => !disabled && setIsOpen((prev) => !prev)}
            disabled={disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span>{selectedOption?.label || placeholder || "Chon"}</span>
            <FiChevronDown className="dropdown-arrow" />
          </button>

          <div className={`custom-dropdown-menu ${isOpen ? "show" : ""}`} role="listbox">
            {normalizedOptions.map((option) => {
              const isActive = String(option.value) === String(value);

              return (
                <button
                  key={String(option.value)}
                  type="button"
                  className={`custom-dropdown-item ${isActive ? "active" : ""}`}
                  onClick={() => {
                    emitChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                  {isActive ? <FiCheck /> : null}
                </button>
              );
            })}
          </div>
        </div>

        {error ? <p className="ui-select__error">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={`ui-select ${isFocused ? "is-focused" : ""} ${className}`.trim()}>
      {label ? <label className="ui-select__label">{label}</label> : null}

      <div className="ui-select__field-wrap">
        <select
          className={`ui-select__field ${selectClassName}`.trim()}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          onChange={onChange}
          name={name}
          id={id}
          disabled={disabled}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}

          {options.map((option, index) => (
            <option key={`${getOptionValue(option)}-${index}`} value={getOptionValue(option)}>
              {getOptionLabel(option)}
            </option>
          ))}
        </select>

        {!hideChevron ? (
          <span className="ui-select__chevron" aria-hidden="true">
            <FiChevronDown />
          </span>
        ) : null}
      </div>

      {error ? <p className="ui-select__error">{error}</p> : null}
    </div>
  );
}