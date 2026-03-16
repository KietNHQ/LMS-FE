import "./NotificationFilter.css";

export default function NotificationFilter({
  filter,
  setFilter,
  classList,
  getClassLabel
}) {

  return (
    <div className="notification-filter">

      <button
        className={filter === "all" ? "active" : ""}
        onClick={() => setFilter("all")}
      >
        Tổng
      </button>

      {classList.map((c) => (
        <button
          key={c}
          className={filter === c ? "active" : ""}
          onClick={() => setFilter(c)}
        >
          {getClassLabel(c)}
        </button>
      ))}

    </div>
  );
}