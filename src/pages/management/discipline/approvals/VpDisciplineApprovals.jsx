import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState, LoadingSpinner, PageHeader, Pagination } from "../../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { FiCheck, FiEye, FiSearch, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import "./VpDisciplineApprovals.css";

const MOCK_APPROVALS = [
  {
    id: "AP-301",
    type: "Bien ban vi pham",
    className: "11A5",
    studentName: "Tran Thi B",
    submittedBy: "GVCN Nguyen Thi H",
    submittedAt: "2026-10-15 09:30",
    status: "pending",
    severity: "high",
  },
  {
    id: "AP-302",
    type: "Nang muc canh cao",
    className: "10A3",
    studentName: "Nguyen E",
    submittedBy: "Giam thi 01",
    submittedAt: "2026-10-15 11:10",
    status: "pending",
    severity: "medium",
  },
  {
    id: "AP-303",
    type: "Xac nhan xu ly",
    className: "12A2",
    studentName: "Le C",
    submittedBy: "GVCN Tran K",
    submittedAt: "2026-10-14 15:00",
    status: "approved",
    severity: "low",
  },
  {
    id: "AP-304",
    type: "De nghi moi PH",
    className: "10A1",
    studentName: "Hoang D",
    submittedBy: "GVCN Le P",
    submittedAt: "2026-10-14 16:40",
    status: "rejected",
    severity: "high",
  },
];

const PAGE_SIZE = 3;

function StatusBadge({ status }) {
  if (status === "approved") return <span className="vpd-approvals__badge vpd-approvals__badge--approved">Da duyet</span>;
  if (status === "rejected") return <span className="vpd-approvals__badge vpd-approvals__badge--rejected">Tu choi</span>;
  return <span className="vpd-approvals__badge vpd-approvals__badge--pending">Cho duyet</span>;
}

export default function VpDisciplineApprovals() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState(MOCK_APPROVALS);
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get("status") || "pending");
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [debugState, setDebugState] = useState(() => searchParams.get("debug") || "none");
  const [currentPage, setCurrentPage] = useState(() => Number(searchParams.get("page")) || 1);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchesStatus = statusFilter === "all" || row.status === statusFilter;
        const matchesSearch = [row.id, row.studentName, row.className, row.type, row.submittedBy]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
      }),
    [rows, search, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const isLoading = debugState === "loading";
  const loadError = debugState === "error" ? "Khong the tai danh sach phe duyet. Hay thu lai." : "";

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

  const pendingCount = rows.filter((row) => row.status === "pending").length;

  const handleDecision = (id, status) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));
    toast.success(status === "approved" ? "Da phe duyet ho so." : "Da tu choi ho so.");
  };

  return (
    <div className="vpd-approvals">
      <PageHeader
        title="Phe duyet ne nep"
        actions={
          <DisciplineHeaderActions
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            onTermChange={handleTermChange}
          />
        }
      />

      <div className="vpd-approvals__summary">
        <div className="vpd-approvals__metric">
          <span>Ho so cho duyet</span>
          <strong>{pendingCount}</strong>
        </div>
        <div className="vpd-approvals__metric">
          <span>Tong ho so</span>
          <strong>{rows.length}</strong>
        </div>
      </div>

      <div className="vpd-approvals__toolbar">
        <div className="vpd-approvals__search">
          <FiSearch />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tim ma ho so, hoc sinh, lop..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setCurrentPage(1);
          }}
          className="vpd-approvals__select"
        >
          <option value="all">Tat ca trang thai</option>
          <option value="pending">Cho duyet</option>
          <option value="approved">Da duyet</option>
          <option value="rejected">Tu choi</option>
        </select>

        <select
          value={debugState}
          onChange={(event) => setDebugState(event.target.value)}
          className="vpd-approvals__select"
        >
          <option value="none">Debug: Normal</option>
          <option value="loading">Debug: Loading</option>
          <option value="error">Debug: Error</option>
        </select>
      </div>

      <div className="vpd-approvals__chips" aria-label="Bo loc dang ap dung">
        {statusFilter !== "all" ? (
          <button type="button" className="vpd-approvals__chip" onClick={() => setStatusFilter("all")}>
            status: {statusFilter} <FiX />
          </button>
        ) : null}
        {search ? (
          <button type="button" className="vpd-approvals__chip" onClick={() => setSearch("")}>
            q: {search} <FiX />
          </button>
        ) : null}
        {debugState !== "none" ? (
          <button type="button" className="vpd-approvals__chip" onClick={() => setDebugState("none")}>
            debug: {debugState} <FiX />
          </button>
        ) : null}
      </div>

      <div className="vpd-approvals__table-wrap">
        {isLoading ? <LoadingSpinner label="Dang tai danh sach phe duyet..." /> : null}

        {!isLoading && loadError ? (
          <div className="vpd-approvals__state">
            <p>{loadError}</p>
            <button type="button" onClick={() => setSearch("")}>Thu lai</button>
          </div>
        ) : null}

        {!isLoading && !loadError && filteredRows.length === 0 ? (
          <EmptyState title="Khong tim thay ho so" description="Thu doi bo loc hoac tu khoa tim kiem." compact />
        ) : null}

        {!isLoading && !loadError && filteredRows.length > 0 ? (
          <>
            <table className="vpd-approvals__table">
              <thead>
                <tr>
                  <th>Ma ho so</th>
                  <th>Loai</th>
                  <th>Hoc sinh</th>
                  <th>Lop</th>
                  <th>Nguoi gui</th>
                  <th>Thoi gian</th>
                  <th>Trang thai</th>
                  <th>Hanh dong</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.type}</td>
                    <td>{row.studentName}</td>
                    <td>{row.className}</td>
                    <td>{row.submittedBy}</td>
                    <td>{row.submittedAt}</td>
                    <td><StatusBadge status={row.status} /></td>
                    <td>
                      <div className="vpd-approvals__actions">
                        <button type="button" className="ghost" onClick={() => toast.info(`Mo chi tiet ${row.id}`)}><FiEye /> Xem</button>
                        {row.status === "pending" ? (
                          <>
                            <button type="button" className="ok" onClick={() => handleDecision(row.id, "approved")}><FiCheck /> Duyet</button>
                            <button type="button" className="no" onClick={() => handleDecision(row.id, "rejected")}><FiX /> Tu choi</button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="vpd-approvals__pagination">
              <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

