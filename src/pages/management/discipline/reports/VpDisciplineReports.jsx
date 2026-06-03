import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState, LoadingSpinner, PageHeader, Pagination } from "../../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { FiBarChart2, FiDownload, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { vpDisciplineService } from "../../../../services/pages/management/vp-discipline";
import "./VpDisciplineReports.css";

const PAGE_SIZE = 10;

export default function VpDisciplineReports() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const [searchParams, setSearchParams] = useSearchParams();
  const [gradeFilter, setGradeFilter] = useState(() => searchParams.get("grade") || "all");
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [currentPage, setCurrentPage] = useState(() => Number(searchParams.get("page")) || 1);

  const semesterId = selectedTerm?.id;

  const { data: violationsByType = [], isLoading: isLoadingViolations } = useQuery({
    queryKey: ["discipline-reports", "violations-by-type", semesterId],
    queryFn: () =>
      vpDisciplineService.getViolationsByType({
        params: { semesterId },
      }),
    enabled: Boolean(semesterId),
    staleTime: 30_000,
  });

  const { data: trendData = [], isLoading: isLoadingTrend } = useQuery({
    queryKey: ["discipline-reports", "trend", semesterId],
    queryFn: () =>
      vpDisciplineService.getViolationsTrend({
        params: { semesterId },
      }),
    enabled: Boolean(semesterId),
    staleTime: 30_000,
  });

  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["discipline-reports", "summary", semesterId],
    queryFn: () =>
      vpDisciplineService.getReportSummary(semesterId),
    enabled: Boolean(semesterId),
    staleTime: 30_000,
  });

  const isLoading = isLoadingViolations || isLoadingTrend || isLoadingSummary;

  const totalViolations = summaryData?.totalViolations ?? summaryData?.total_violations ?? 0;
  const unexcusedAbsenceRate = summaryData?.unexcusedAbsenceRate ?? summaryData?.unexcused_absence_rate ?? 0;
  const repeatStudents = summaryData?.repeatStudents ?? summaryData?.repeat_students ?? 0;
  const handledRate = summaryData?.handledRate ?? summaryData?.handled_rate ?? 0;

  const metrics = useMemo(
    () => ({ totalViolations, unexcusedAbsenceRate, repeatStudents, handledRate }),
    [totalViolations, unexcusedAbsenceRate, repeatStudents, handledRate],
  );

  const classRows = useMemo(() => {
    if (!Array.isArray(violationsByType)) return [];
    return violationsByType.map((item) => ({
      className: item.className || item.class_name || item.class || "",
      points: item.points ?? item.avgDisciplineScore ?? item.avg_discipline_score ?? 0,
      violations: item.violationCount ?? item.violation_count ?? item.violations ?? 0,
    }));
  }, [violationsByType]);

  const filteredClassRows = useMemo(
    () =>
      classRows.filter((item) => {
        const matchesGrade = gradeFilter === "all" || item.className.startsWith(gradeFilter);
        const matchesSearch = item.className.toLowerCase().includes(search.toLowerCase());
        return matchesGrade && matchesSearch;
      }),
    [classRows, gradeFilter, search],
  );

  const totalPages = Math.max(1, Math.ceil(filteredClassRows.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  useEffect(() => {
    setSearchParams(
      {
        grade: gradeFilter,
        q: search,
        page: String(safePage),
      },
      { replace: true },
    );
  }, [gradeFilter, safePage, search, setSearchParams]);

  const pagedClassRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredClassRows.slice(start, start + PAGE_SIZE);
  }, [filteredClassRows, safePage]);

  const trend = useMemo(() => {
    if (!Array.isArray(trendData)) return [];
    return trendData.map((item) => ({
      label: item.label || item.month || item.period || "?",
      value: item.value ?? item.count ?? item.violationCount ?? 0,
    }));
  }, [trendData]);

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
      </div>

      <div className="vpd-reports__kpis">
        <div className="kpi"><span>Tong vi pham</span><strong>{metrics.totalViolations}</strong></div>
        <div className="kpi"><span>Ty le vang khong phep</span><strong>{metrics.unexcusedAbsenceRate}%</strong></div>
        <div className="kpi"><span>Hoc sinh tai pham</span><strong>{metrics.repeatStudents}</strong></div>
        <div className="kpi"><span>Ho so da xu ly</span><strong>{metrics.handledRate}%</strong></div>
      </div>

      {isLoading ? <LoadingSpinner label="Dang tai bao cao ne nep..." /> : null}

      {!isLoading && filteredClassRows.length === 0 ? (
        <EmptyState title="Khong co du lieu bao cao" description="Khong co lop phu hop voi bo loc hien tai." compact />
      ) : null}

      {!isLoading && filteredClassRows.length > 0 ? (
      <div className="vpd-reports__content">
        {trend.length > 0 && (
          <section className="panel">
            <h3><FiBarChart2 /> Xu huong vi pham</h3>
            <div className="vpd-reports__trend">
              {trend.map((item) => (
                <div className="bar-wrap" key={item.label}>
                  <div className="bar" style={{ height: `${Math.max(item.value * 5, 4)}px` }}><span>{item.value}</span></div>
                  <small>{item.label}</small>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="panel">
          <h3>Bang tong hop theo lop</h3>
          <table className="vpd-reports__table">
            <thead>
              <tr>
                <th>Lop</th>
                <th>So vi pham</th>
              </tr>
            </thead>
            <tbody>
              {pagedClassRows.map((item) => (
                <tr key={item.className}>
                  <td>{item.className}</td>
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

