import "./Table.css";

function getColumnKey(column, index) {
  if (typeof column === "string") return column;
  return column.key || `column-${index}`;
}

function getColumnLabel(column) {
  if (typeof column === "string") return column;
  return column.label || column.key;
}

function getCellValue(row, column, index) {
  if (Array.isArray(row)) {
    return row[index];
  }

  if (typeof column === "string") {
    return row?.[column] ?? "-";
  }

  if (typeof column.render === "function") {
    return column.render(row);
  }

  return row?.[column.key] ?? "-";
}

export default function Table({
  columns = [],
  data = [],
  emptyText = "Khong co du lieu",
  className = "",
}) {
  const finalClassName = `ui-table-wrap ${className}`.trim();

  return (
    <div className={finalClassName}>
      <table className="ui-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={getColumnKey(column, index)}>{getColumnLabel(column)}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {!data.length ? (
            <tr>
              <td colSpan={Math.max(columns.length, 1)} className="ui-table__empty">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id ?? rowIndex}>
                {columns.map((column, columnIndex) => (
                  <td key={`${getColumnKey(column, columnIndex)}-${rowIndex}`}>
                    {getCellValue(row, column, columnIndex)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
