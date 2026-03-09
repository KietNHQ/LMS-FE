import React from "react";
import { FiInbox } from "react-icons/fi";
import "./EmptyState.css";

export default function EmptyState({
  title = "No data yet",
  description = "There is nothing to show right now.",
  action = null,
  icon = <FiInbox />,
  compact = false,
}) {
  return (
    <div className={`common-empty-state ${compact ? "is-compact" : ""}`}>
      <div className="common-empty-state__icon" aria-hidden="true">
        {icon}
      </div>

      <div className="common-empty-state__content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      {action ? <div className="common-empty-state__action">{action}</div> : null}
    </div>
  );
}
