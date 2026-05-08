import "./Pagination.css";

function buildPages(total, currentPage) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }

  if (currentPage >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", total];
}

export default function Pagination({
  page = 1,
  total = 1,
  onChange,
  className = "",
}) {
  const pages = buildPages(total, page);

  const goToPage = (nextPage) => {
    if (typeof onChange === "function") {
      onChange(nextPage);
    }
  };

  return (
    <div className={`ui-pagination ${className}`.trim()}>
      <button
        type="button"
        className="ui-pagination__button"
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
      >
        Truoc
      </button>

      {pages.map((pageItem, index) =>
        pageItem === "..." ? (
          <span key={`ellipsis-${index}`} className="ui-pagination__ellipsis" aria-hidden="true">
            ...
          </span>
        ) : (
          <button
            key={pageItem}
            type="button"
            onClick={() => goToPage(pageItem)}
            className={`ui-pagination__button ${pageItem === page ? "is-active" : ""}`.trim()}
          >
            {pageItem}
          </button>
        )
      )}

      <button
        type="button"
        className="ui-pagination__button"
        onClick={() => goToPage(page + 1)}
        disabled={page >= total}
      >
        Sau
      </button>
    </div>
  );
}
