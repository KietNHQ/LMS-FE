import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState, LoadingSpinner, PageHeader, Pagination } from "../../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { FiAlertTriangle, FiFileText, FiSearch, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vpDisciplineService } from "../../../../services/pages/management/vp-discipline";
import "./VpDisciplineViolations.css";

const PAGE_SIZE = 10;

// Map snake_case BE → camelCase FE
function mapViolation(v) {
  return {
    id: v.id,
    studentEnrollmentId: v.student_enrollment_id,
    studentId: v.student_id,
    studentName: v.student_name || `${v.given_name || ""} ${v.surname || ""}`.trim(),
    studentCode: v.student_code,
    className: v.class_name || v.class || "",
    violationCode: v.violation_code,
    violationName: v.violation_name,
    violationCategory: v.violation_category,
    severity: v.severity || "medium",
    pointsDeducted: v.points_deducted,
    date: v.date,
    status: v.status,
    notes: v.notes,
    evidenceUrl: v.evidence_url,
    evidenceType: v.evidence_type,
    verifiedBy: v.verified_by,
    verifiedAt: v.verified_at,
    createdAt: v.created_at,
  };
}

const STATUS_LABELS = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

export default function VpDisciplineViolations() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState(() => searchParams.get("status") || "all");
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [currentPage, setCurrentPage] = useState(() => Number(searchParams.get("page")) || 1);

  const params = {
    status: statusFilter !== "all" ? statusFilter : undefined,
    page: currentPage,
    limit: PAGE_SIZE,
    schoolYearId: selectedSchoolYear,
    semesterId: selectedTerm,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["discipline-violations", params],
    queryFn: async () => {
      const res = await vpDisciplineService.callByKey("get_discipline_violations", {
        params,
      });
      return res?.data || [];
    },
    select: (data) => {
      if (Array.isArray(data)) return data.map(mapViolation);
      if (data?.data) return data.data.map(mapViolation);
      return [];
    },
    staleTime: 30_000,
  });

  // Approve / Reject mutations
  const approveMutation = useMutation({
    mutationFn: (id) =>
      vpDisciplineService.callByKey("put_discipline_violations_by_id_approve", {
        pathParams: { id },
      }),
    onSuccess: () => {
      toast.success("Đã phê duyệt vi phạm");
      queryClient.invalidateQueries({ queryKey: ["discipline-violations"] });
    },
    onError: () => toast.error("Không thể phê duyệt"),
  });

  const rejectMutation = useMutation({
    mutationFn: (id) =>
      vpDisciplineService.callByKey("put_discipline_violations_by_id_reject", {
        pathParams: { id },
        body: {},
      }),
    onSuccess: () => {
      toast.success("Đã từ chối vi phạm");
      queryClient.invalidateQueries({ queryKey: ["discipline-violations"] });
    },
    onError: () => toast.error("Không thể từ chối"),
  });

  const filteredRows = useMemo(() => {
    if (!data) return [];
    return data.filter((row) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        [row.id, row.studentName, row.className, row.violationName, row.studentCode]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesSearch;
    });
  }, [data, search]);

  const totalCount = data?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  useEffect(() => {
    setSearchParams(
      {
        status: statusFilter,
        q: search,
        page: String(safePage),
      },
      { replace: true },
    );
  }, [safePage, search, setSearchParams, statusFilter]);

  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, safePage]);

  return (
    <div className="vpd-violations">
      <PageHeader
        title="Hồ sơ vi phạm"
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
            placeholder="Tìm học sinh, lớp, mã hồ sơ..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>
      </div>

      <div className="vpd-violations__chips" aria-label="Bộ lọc đang áp dụng">
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
      </div>

      <div className="vpd-violations__table-wrap">
        {isLoading ? <LoadingSpinner label="Đang tải hồ sơ vi phạm..." /> : null}

        {isError ? (
          <div className="vpd-violations__state">
            <p>{error?.message || "Không thể tải danh sách vi phạm. Hãy thử lại."}</p>
            <button type="button" onClick={() => queryClient.invalidateQueries({ queryKey: ["discipline-violations"] })}>
              Thử lại
            </button>
          </div>
        ) : null}

        {!isLoading && !isError && filteredRows.length === 0 ? (
          <EmptyState title="Không có hồ sơ phù hợp" description="Thử điều chỉnh bộ lọc trạng thái hoặc tìm kiếm." compact />
        ) : null}

        {!isLoading && !isError && filteredRows.length > 0 ? (
          <>
            <table className="vpd-violations__table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Học sinh</th>
                  <th>Lớp</th>
                  <th>Loại vi phạm</th>
                  <th>Điểm trừ</th>
                  <th>Ngày</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>
                      <div className="student-cell">
                        <span className="student-avatar">{row.studentName?.charAt(0) || "?"}</span>
                        <div>
                          <strong>{row.studentName}</strong>
                          <br />
                          <small>{row.studentCode}</small>
                        </div>
                      </div>
                    </td>
                    <td>{row.className}</td>
                    <td>{row.violationName}</td>
                    <td>
                      <span className={`points points--${row.pointsDeducted > 5 ? "high" : "low"}`}>
                        -{row.pointsDeducted}
                      </span>
                    </td>
                    <td>{row.date}</td>
                    <td>
                      <span className={`state state--${row.status}`}>
                        {STATUS_LABELS[row.status] || row.status}
                      </span>
                    </td>
                    <td>
                      <div className="vpd-violations__actions">
                        <button type="button" title="Xem chi tiết" onClick={() => toast.info(`Mở hồ sơ ${row.id}`)}>
                          <FiFileText /> Xem
                        </button>
                        {row.status === "pending" && (
                          <>
                            <button
                              type="button"
                              title="Phê duyệt"
                              onClick={() => approveMutation.mutate(row.id)}
                              disabled={approveMutation.isPending}
                            >
                              Duyệt
                            </button>
                            <button
                              type="button"
                              title="Từ chối"
                              onClick={() => rejectMutation.mutate(row.id)}
                              disabled={rejectMutation.isPending}
                            >
                              <FiAlertTriangle /> Từ chối
                            </button>
                          </>
                        )}
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
