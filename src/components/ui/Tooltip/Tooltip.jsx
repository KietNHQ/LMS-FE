import React, { useState } from "react";
import "./Tooltip.css";

/**
 * Tooltip component to show information on hover.
 * 
 * @param {Object} props
 * @param {string} props.text - The text to display in the tooltip
 * @param {React.ReactNode} props.children - The element to wrap with the tooltip
 * @param {'top' | 'bottom' | 'left' | 'right'} [props.position='top'] - Position of tooltip
 */
export default function Tooltip({ text, children, position = "top" }) {
  const [isVisible, setIsVisible] = useState(false);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  return (
    <div 
      className="ui-tooltip-wrapper"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && text && (
        <div className={`ui-tooltip ui-tooltip--${position}`}>
          {text}
        </div>
      )}
    </div>
  );
}

