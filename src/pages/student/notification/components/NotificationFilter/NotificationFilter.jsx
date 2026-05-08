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

      {categories.map((cat) => (
        <button
          key={cat}
          className={filter === cat ? "active" : ""}
          onClick={() => setFilter(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

