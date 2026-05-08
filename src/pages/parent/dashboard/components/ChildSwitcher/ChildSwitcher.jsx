import "./ChildSwitcher.css";
import { FiUsers } from "react-icons/fi";

export default function ChildSwitcher({
  childrenList,
  selectedChildId,
  onSelect,
  extraControl = null,
}) {
  return (
    <div className="child-switcher">
      <div className="child-switcher__main">
        <div className="child-label">
          <FiUsers className="child-icon" />
          <span>Chọn con:</span>
        </div>

        <div className="child-switcher__children">
          {childrenList.map((child) => (
            <button
              key={child.id}
              className={selectedChildId === child.id ? "active" : ""}
              onClick={() => onSelect(child.id)}
            >
              {child.name}
            </button>
          ))}
        </div>
      </div>

      {extraControl ? <div className="child-switcher__extra">{extraControl}</div> : null}
    </div>
  );
}
