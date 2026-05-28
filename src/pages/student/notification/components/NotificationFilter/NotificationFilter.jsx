import "./NotificationFilter.css";

export default function NotificationFilter({
  filter,
  setFilter,
  categories = []
}) {
  return (
    <div className="student-notification-filter">
      <button
        className={filter === "all" ? "active" : ""}
        onClick={() => setFilter("all")}
      >
        Tổng
      </button>

      {categories.map((cat, idx) => (
        <button
          key={`${cat}-${idx}`}
          className={filter === cat ? "active" : ""}
          onClick={() => setFilter(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

