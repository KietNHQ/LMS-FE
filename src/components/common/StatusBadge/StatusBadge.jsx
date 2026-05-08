import React from "react";
import "./StatusBadge.css";

const normalizeStatus = (status) => String(status || "default").toLowerCase().trim();

export default function StatusBadge({ status = "default", children }) {
  const finalStatus = normalizeStatus(status);

  return (
    <span className={`common-status-badge status-${finalStatus}`}>
      {children || status}
    </span>
  );
}

