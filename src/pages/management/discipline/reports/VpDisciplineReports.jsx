import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState, LoadingSpinner, PageHeader, Pagination } from "../../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { FiBarChart2, FiDownload, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import "./VpDisciplineReports.css";

const MOCK_TREND = [
  { label: "T2", value: 12 },
  { label: "T3", value: 9 },
  { label: "T4", value: 16 },
  { label: "T5", value: 20 },
  { label: "T6", value: 14 },
  { label: "T7", value: 8 },
];

const MOCK_TOP_CLASSES = [
  { className: "12A1", points: 98.5, violations: 2 },
  { className: "10A1", points: 96.2, violations: 4 },
  { className: "11A2", points: 94.1, violations: 5 },
  { className: "10A3", points: 71.4, violations: 18 },
];

const PAGE_SIZE = 3;

export default function VpDisciplineReports() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const [searchParams, setSearchParams] = useSearchParams();
  const [gradeFilter, setGradeFilter] = useState(() => searchParams.get("grade") || "all");
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [debugState, setDebugState] = useState(() => searchParams.get("debug") || "none");
  const [currentPage, setCurrentPage] = useState(() => Number(searchParams.get("page")) || 1);

  const metrics = useMemo(() => ({
    totalViolations: 79,
    unexcusedAbsenceRate: 2.8,
    repeatStudents: 11,
    handledRate: 93,
  }), []);

  const filteredClassRows = useMemo(
    () =>
      MOCK_TOP_CLASSES.filter((item) => {
        const matchesGrade = gradeFilter === "all" || item.className.startsWith(gradeFilter);
        const matchesSearch = item.className.toLowerCase().includes(search.toLowerCase());
        return matchesGrade && matchesSearch;
      }),
    [gradeFilter, search],
  );

  const totalPages = Math.max(1, Math.ceil(filteredClassRows.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const isLoading = debugState === "loading";
  const loadError = debugState === "error" ? "Khong the tai bao cao. Hay thu lai." : "";

  useEffect(() => {
    setSearchParams(
      {
        grade: gradeFilter,
        q: search,
        debug: debugState,
        page: String(safePage),
      },
      { replace: true },
    );
  }, [debugState, gradeFilter, safePage, search, setSearchParams]);

  const pagedClassRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredClassRows.slice(start, start + PAGE_SIZE);
  }, [filteredClassRows, safePage]);

  return (
    <div className="vpd-reports">
      <PageHeader
        title="Bao cao ne nep"
        actions={
          <DisciplineHeaderActions
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            onTermChange={handleTermChange}
          />
        }
      />

      <div className="vpd-reports__toolbar">
        <div className="vpd-reports__toolbar-left">
          <select
            value={gradeFilter}
            onChange={(event) => {
              setGradeFilter(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Tat ca khoi</option>
            <option value="10">Khoi 10</option>
            <option value="11">Khoi 11</option>
            <option value="12">Khoi 12</option>
          </select>
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tim theo lop..."
          />

          <select value={debugState} onChange={(event) => setDebugState(event.target.value)}>
            <option value="none">Debug: Normal</option>
            <option value="loading">Debug: Loading</option>
            <option value="error">Debug: Error</option>
          </select>
        </div>
        <button type="button" onClick={() => toast.success("Da tao file bao cao tong hop.")}>
          <FiDownload /> Xuat bao cao
        </button>
      </div>

      <div className="vpd-reports__chips" aria-label="Bo loc dang ap dung">
        {gradeFilter !== "all" ? (
          <button type="button" className="vpd-reports__chip" onClick={() => setGradeFilter("all")}>
            grade: {gradeFilter} <FiX />
          </button>
        ) : null}
        {search ? (
          <button type="button" className="vpd-reports__chip" onClick={() => setSearch("")}>
            q: {search} <FiX />
          </button>
        ) : null}
        {debugState !== "none" ? (
          <button type="button" className="vpd-reports__chip" onClick={() => setDebugState("none")}>
            debug: {debugState} <FiX />
          </button>
        ) : null}
      </div>

      <div className="vpd-reports__kpis">
        <div className="kpi"><span>Tong vi pham</span><strong>{metrics.totalViolations}</strong></div>
        <div className="kpi"><span>Ty le vang khong phep</span><strong>{metrics.unexcusedAbsenceRate}%</strong></div>
        <div className="kpi"><span>Hoc sinh tai pham</span><strong>{metrics.repeatStudents}</strong></div>
        <div className="kpi"><span>Ho so da xu ly</span><strong>{metrics.handledRate}%</strong></div>
      </div>

      {isLoading ? <LoadingSpinner label="Dang tai bao cao ne nep..." /> : null}

      {!isLoading && loadError ? (
        <div className="vpd-reports__state">
          <p>{loadError}</p>
          <button type="button" onClick={() => setSearch("")}>Thu lai</button>
        </div>
      ) : null}

      {!isLoading && !loadError && filteredClassRows.length === 0 ? (
        <EmptyState title="Khong co du lieu bao cao" description="Khong co lop phu hop voi bo loc hien tai." compact />
      ) : null}

      {!isLoading && !loadError && filteredClassRows.length > 0 ? (
      <div className="vpd-reports__content">
        <section className="panel">
          <h3><FiBarChart2 /> Xu huong vi pham trong tuan</h3>
          <div className="vpd-reports__trend">
            {MOCK_TREND.map((item) => (
              <div className="bar-wrap" key={item.label}>
                <div className="bar" style={{ height: `${item.value * 5}px` }}><span>{item.value}</span></div>
                <small>{item.label}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3>Bang tong hop theo lop</h3>
          <table className="vpd-reports__table">
            <thead>
              <tr>
                <th>Lop</th>
                <th>Diem thi dua</th>
                <th>So vi pham</th>
              </tr>
            </thead>
            <tbody>
              {pagedClassRows.map((item) => (
                <tr key={item.className}>
                  <td>{item.className}</td>
                  <td>{item.points}</td>
                  <td>{item.violations}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="vpd-reports__pagination">
            <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </section>
      </div>
      ) : null}
    </div>
  );
}

