import "./ChildSwitcher.css";
import { FiUsers } from "react-icons/fi";

export default function ChildSwitcher({
  childrenList,
  selectedChildId,
  onSelect,
  extraControl = null,
}) {
  // Build display name from given_name + surname
  const getChildName = (child) => {
    if (child.name) return child.name;
    return [child.given_name, child.surname].filter(Boolean).join(" ") || "Học sinh";
  };

  return (
    <div className="child-switcher">
      <div className="child-switcher__main">
        <div className="child-label">
          <FiUsers className="child-icon" />
          <span>Chọn con:</span>
        </div>

        <div className="child-switcher__children">
          {childrenList.map((child) => {
            const childId = child.id || child.studentId;
            return (
              <button
                key={childId}
                className={selectedChildId === childId ? "active" : ""}
                onClick={() => onSelect(childId)}
              >
                {getChildName(child)}
              </button>
            );
          })}
        </div>
      </div>

      {extraControl ? <div className="child-switcher__extra">{extraControl}</div> : null}
    </div>
  );
}
