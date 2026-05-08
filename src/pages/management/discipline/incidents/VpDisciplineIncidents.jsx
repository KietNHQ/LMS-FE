import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState, LoadingSpinner, PageHeader, Pagination } from "../../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { FiClock, FiSearch, FiUserPlus, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import "./VpDisciplineIncidents.css";

const MOCK_CASES = [
  { id: "IC-01", title: "Xo xat tai san truong", className: "10A3", owner: "Giam thi 02", priority: "high", status: "open", due: "2026-10-16" },
  { id: "IC-02", title: "Tai pham di tre 3 lan", className: "11A5", owner: "GVCN 11A5", priority: "medium", status: "in_progress", due: "2026-10-18" },
  { id: "IC-03", title: "Vi pham dong phuc lap lai", className: "12A2", owner: "PHT ne nep", priority: "low", status: "closed", due: "2026-10-12" },
];

const PAGE_SIZE = 2;

export default function VpDisciplineIncidents() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState(MOCK_CASES);
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get("status") || "all");
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [debugState, setDebugState] = useState(() => searchParams.get("debug") || "none");
  const [currentPage, setCurrentPage] = useState(() => Number(searchParams.get("page")) || 1);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchesStatus = statusFilter === "all" || row.status === statusFilter;
        const matchesSearch = [row.id, row.title, row.className, row.owner].join(" ").toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
      }),
    [rows, search, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const isLoading = debugState === "loading";
  const loadError = debugState === "error" ? "Khong the tai danh sach su vu. Hay thu lai." : "";

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

  const updateCase = (id, nextStatus) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status: nextStatus } : row)));
    toast.success("Da cap nhat su vu.");
  };

  return (
    <div className="vpd-incidents">
      <PageHeader
        title="Xu ly su vu"
        actions={
          <DisciplineHeaderActions
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            onTermChange={handleTermChange}
          />
        }
      />

      <div className="vpd-incidents__toolbar">
        <div className="vpd-incidents__search">
          <FiSearch />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tim ma su vu, lop, nguoi phu trach..."
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
          <option value="open">Moi mo</option>
          <option value="in_progress">Dang xu ly</option>
          <option value="closed">Da dong</option>
        </select>

        <select value={debugState} onChange={(event) => setDebugState(event.target.value)}>
          <option value="none">Debug: Normal</option>
          <option value="loading">Debug: Loading</option>
          <option value="error">Debug: Error</option>
        </select>
      </div>

      <div className="vpd-incidents__chips" aria-label="Bo loc dang ap dung">
        {statusFilter !== "all" ? (
          <button type="button" className="vpd-incidents__chip" onClick={() => setStatusFilter("all")}>
            status: {statusFilter} <FiX />
          </button>
        ) : null}
        {search ? (
          <button type="button" className="vpd-incidents__chip" onClick={() => setSearch("")}>
            q: {search} <FiX />
          </button>
        ) : null}
        {debugState !== "none" ? (
          <button type="button" className="vpd-incidents__chip" onClick={() => setDebugState("none")}>
            debug: {debugState} <FiX />
          </button>
        ) : null}
      </div>

      {isLoading ? <LoadingSpinner label="Dang tai danh sach su vu..." /> : null}

      {!isLoading && loadError ? (
        <div className="vpd-incidents__state">
          <p>{loadError}</p>
          <button type="button" onClick={() => setSearch("")}>Thu lai</button>
        </div>
      ) : null}

      {!isLoading && !loadError && filteredRows.length === 0 ? (
        <EmptyState title="Khong co su vu phu hop" description="Thu dieu chinh bo loc trang thai hoac tim kiem." compact />
      ) : null}

      {!isLoading && !loadError && filteredRows.length > 0 ? (
        <>
          <div className="vpd-incidents__grid">
            {pagedRows.map((row) => (
              <article className="vpd-incidents__card" key={row.id}>
                <div className="vpd-incidents__head">
                  <strong>{row.id}</strong>
                  <span className={`prio prio--${row.priority}`}>{row.priority}</span>
                </div>
                <h3>{row.title}</h3>
                <p>Lop: {row.className}</p>
                <p>Nguoi phu trach: {row.owner}</p>
                <p><FiClock /> Han xu ly: {row.due}</p>
                <p>Trang thai: <span className={`state state--${row.status}`}>{row.status}</span></p>

                <div className="vpd-incidents__actions">
                  <button type="button" onClick={() => toast.info(`Mo timeline ${row.id}`)}>Timeline</button>
                  <button type="button" onClick={() => toast.info("Da giao nguoi xu ly.")}><FiUserPlus /> Giao viec</button>
                  {row.status !== "closed" ? (
                    <button type="button" onClick={() => updateCase(row.id, "closed")}>Dong su vu</button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          <div className="vpd-incidents__pagination">
            <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </>
      ) : null}
    </div>
  );
}

