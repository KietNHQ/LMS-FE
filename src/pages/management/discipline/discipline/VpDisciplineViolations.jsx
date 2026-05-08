import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState, LoadingSpinner, PageHeader, Pagination } from "../../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { FiAlertTriangle, FiFileText, FiSearch, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import "./VpDisciplineViolations.css";

const MOCK_VIOLATIONS = [
  { id: "VR-101", student: "Tran Thi B", className: "11A5", type: "Vang khong phep", severity: "high", status: "new", date: "2026-10-15" },
  { id: "VR-102", student: "Hoang D", className: "11A5", type: "Di tre", severity: "medium", status: "reviewed", date: "2026-10-14" },
  { id: "VR-103", student: "Nguyen E", className: "10A3", type: "Noi chuyen trong gio", severity: "low", status: "new", date: "2026-10-15" },
  { id: "VR-104", student: "Le C", className: "12A2", type: "Vi pham dong phuc", severity: "medium", status: "escalated", date: "2026-10-13" },
];

const PAGE_SIZE = 3;

export default function VpDisciplineViolations() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState(MOCK_VIOLATIONS);
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get("status") || "all");
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [debugState, setDebugState] = useState(() => searchParams.get("debug") || "none");
  const [currentPage, setCurrentPage] = useState(() => Number(searchParams.get("page")) || 1);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchesStatus = statusFilter === "all" || row.status === statusFilter;
        const matchesSearch = [row.id, row.student, row.className, row.type].join(" ").toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
      }),
    [rows, search, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const isLoading = debugState === "loading";
  const loadError = debugState === "error" ? "Khong the tai danh sach vi pham. Hay thu lai." : "";

  useEffect(() => {
    setSearchParams(
      {
        status: statusFilter,
        q: search,
        debug: debugState,
        page: String(safePage),
      },
      { replace: true },
    );
  }, [debugState, safePage, search, setSearchParams, statusFilter]);

  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, safePage]);

  const updateStatus = (id, status) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));
    toast.success("Da cap nhat ho so vi pham.");
  };

  return (
    <div className="vpd-violations">
      <PageHeader
        title="Ho so vi pham"
        actions={
          <DisciplineHeaderActions
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            onTermChange={handleTermChange}
          />
        }
      />

      <div className="vpd-violations__toolbar">
        <div className="vpd-violations__search">
          <FiSearch />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tim hoc sinh, lop, ma ho so..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">Tat ca trang thai</option>
          <option value="new">Moi ghi nhan</option>
          <option value="reviewed">Da ra soat</option>
          <option value="escalated">Da nang muc</option>
        </select>

        <select value={debugState} onChange={(event) => setDebugState(event.target.value)}>
          <option value="none">Debug: Normal</option>
          <option value="loading">Debug: Loading</option>
          <option value="error">Debug: Error</option>
        </select>
      </div>

      <div className="vpd-violations__chips" aria-label="Bo loc dang ap dung">
        {statusFilter !== "all" ? (
          <button type="button" className="vpd-violations__chip" onClick={() => setStatusFilter("all")}>
            status: {statusFilter} <FiX />
          </button>
        ) : null}
        {search ? (
          <button type="button" className="vpd-violations__chip" onClick={() => setSearch("")}>
            q: {search} <FiX />
          </button>
        ) : null}
        {debugState !== "none" ? (
          <button type="button" className="vpd-violations__chip" onClick={() => setDebugState("none")}>
            debug: {debugState} <FiX />
          </button>
        ) : null}
      </div>

      <div className="vpd-violations__table-wrap">
        {isLoading ? <LoadingSpinner label="Dang tai ho so vi pham..." /> : null}

        {!isLoading && loadError ? (
          <div className="vpd-violations__state">
            <p>{loadError}</p>
            <button type="button" onClick={() => setSearch("")}>Thu lai</button>
          </div>
        ) : null}

        {!isLoading && !loadError && filteredRows.length === 0 ? (
          <EmptyState title="Khong co ho so phu hop" description="Thu dieu chinh bo loc trang thai hoac tim kiem." compact />
        ) : null}

        {!isLoading && !loadError && filteredRows.length > 0 ? (
          <>
            <table className="vpd-violations__table">
              <thead>
                <tr>
                  <th>Ma</th>
                  <th>Hoc sinh</th>
                  <th>Lop</th>
                  <th>Loai vi pham</th>
                  <th>Muc do</th>
                  <th>Ngay</th>
                  <th>Trang thai</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.student}</td>
                    <td>{row.className}</td>
                    <td>{row.type}</td>
                    <td><span className={`sev sev--${row.severity}`}>{row.severity}</span></td>
                    <td>{row.date}</td>
                    <td><span className={`state state--${row.status}`}>{row.status}</span></td>
                    <td>
                      <div className="vpd-violations__actions">
                        <button type="button" onClick={() => toast.info(`Mo ho so ${row.id}`)}><FiFileText /> Xem</button>
                        <button type="button" onClick={() => updateStatus(row.id, "reviewed")}>Ra soat</button>
                        <button type="button" onClick={() => updateStatus(row.id, "escalated")}><FiAlertTriangle /> Nang muc</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="vpd-violations__pagination">
              <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

