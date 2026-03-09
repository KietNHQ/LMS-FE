import React, { useState, useEffect } from "react";
import "./LoadingSpinner.css";

const COLORS = [
  { cover: "#2563eb", accent: "#60a5fa", text: "#1e40af" },
  { cover: "#dc2626", accent: "#f87171", text: "#991b1b" },
  { cover: "#7c3aed", accent: "#c084fc", text: "#5b21b6" },
  { cover: "#0891b2", accent: "#22d3ee", text: "#164e63" },
];

export default function LoadingSpinner({
  label = "Loading...",
  fullScreen = false,
  size = "md",
}) {
  const [colorIndex, setColorIndex] = useState(0);
  const currentColor = COLORS[colorIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % COLORS.length);
    }, 1600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`common-loading ${fullScreen ? "is-fullscreen" : ""}`}>
      <div
        className={`book-loader size-${size}`}
        aria-hidden="true"
        style={{
          "--cover-color": currentColor.cover,
          "--accent-color": currentColor.accent,
          "--text-color": currentColor.text,
        }}
      >
        <div className="book-loader__book">
          <span className="book-loader__page page-1"></span>
          <span className="book-loader__page page-2"></span>
          <span className="book-loader__page page-3"></span>
          <span className="book-loader__page page-4"></span>
          <span className="book-loader__cover"></span>
        </div>
      </div>

      {label ? <p className="common-loading__label">{label}</p> : null}
    </div>
  );
}