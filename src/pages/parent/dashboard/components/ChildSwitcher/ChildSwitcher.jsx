import "./ChildSwitcher.css";
import { FiUsers } from "react-icons/fi";

export default function ChildSwitcher({
  childrenList,
  selectedChildId,
  onSelect
}) {
  return (
    <div className="child-switcher">
      <div className="child-label">
        <FiUsers className="child-icon" />
        <span>Chọn con:</span>
      </div>

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
  );
}