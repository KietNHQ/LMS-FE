import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiDollarSign, FiCheck, FiX, FiSearch, FiFilter } from "react-icons/fi";
import { toast } from "react-toastify";
import { PageHeader, Pagination, LoadingSpinner } from "../../../../components/common";
import Select from "../../../../components/ui/Select/Select";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { vpDisciplineService } from "../../../../services/pages/management/vp-discipline";
import "./CompensationMgmt.css";

const PAGE_SIZE = 10;

function mapCompensation(v) {
  return {
    id: v.id,
    studentEnrollmentId: v.student_enrollment_id,
    studentName: v.student_name || "",
    studentCode: v.student_code,
    className: v.class_name || v.class || "",
    gradeLevel: v.grade_level || v.grade || "",
    violationId: v.violation_id,
    violationName: v.violation_name || v.description || "",
    amount: v.amount,
    status: v.status,
    notes: v.notes,
    waiverReason: v.waiver_reason,
    paidAt: v.paid_at,
    waivedAt: v.waived_at,
    createdAt: v.created_at,
  };
}

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ thanh toán" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "waived", label: "Đã miễn" },
];

const STATUS_LABELS = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  waived: "Đã miễn",
};

const STATUS_BADGE_CLASS = {
  pending: "badge-pending",
  paid: "badge-paid",
  waived: "badge-waived",
};

export default function CompensationMgmt() {
  const { selectedTerm } = useSchoolYearTerm();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const params = {
    status: statusFilter !== "all" ? statusFilter : undefined,
    semesterId: selectedTerm,
    page: currentPage,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["discipline-pending-compensations", params],
    queryFn: async () => {
      const res = await vpDisciplineService.getPendingCompensations({ params });
      return {
        compensations: (res?.data || []).map(mapCompensation),
        pagination: res?.pagination || {},
      };
    },
    enabled: Boolean(selectedTerm),
    staleTime: 30_000,
  });

  const paidMutation = useMutation({
    mutationFn: (id) => vpDisciplineService.markCompensationPaid(id),
    onSuccess: () => {
      toast.success("Đã đánh dấu thanh toán thành công!");
      queryClient.invalidateQueries({ queryKey: ["discipline-pending-compensations"] });
    },
    onError: () => {
      toast.error("Không thể đánh dấu thanh toán.");
    },
  });

  const waiveMutation = useMutation({
    mutationFn: ({ id, reason }) => vpDisciplineService.markCompensationWaived(id, { reason }),
    onSuccess: () => {
      toast.success("Đã miễn bồi thường thành công!");
      queryClient.invalidateQueries({ queryKey: ["discipline-pending-compensations"] });
    },
    onError: () => {
      toast.error("Không thể miễn bồi thường.");
    },
  });

  const filtered = (data?.compensations || []).filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.studentName?.toLowerCase().includes(q) ||
      c.studentCode?.toLowerCase().includes(q) ||
      c.violationName?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil((data?.pagination?.total || 0) / PAGE_SIZE));

  const handlePaid = (id) => {
    if (!window.confirm("Đánh dấu khoản bồi thường này là đã thanh toán?")) return;
    paidMutation.mutate(id);
  };

  const handleWaived = (id) => {
    const reason = window.prompt("Nhập lý do miễn bồi thường:");
    if (!reason?.trim()) return;
    waiveMutation.mutate({ id, reason: reason.trim() });
  };

  return (
    <div className="compensation-mgmt">
      <PageHeader
        title="Bồi Thường Thiết Bị"
        subtitle="Quản lý bồi thường thiệt hại do vi phạm kỷ luật"
      />

      <div className="compensation-filters">
        <div className="filter-item">
          <FiSearch />
          <input
            type="text"
            placeholder="Tìm học sinh, mã HS, vi phạm..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <Select
          variant="custom"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          options={STATUS_OPTIONS}
        />
        <button className="btn-filter-clear" onClick={() => { setSearch(""); setStatusFilter("pending"); setCurrentPage(1); }}>
          <FiX /> Xóa lọc
        </button>
      </div>

      {isLoading ? (
        <div className="loading-center"><LoadingSpinner size="lg" label="Đang tải danh sách bồi thường..." /></div>
      ) : isError ? (
        <div className="error-msg">Không thể tải danh sách bồi thường.</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FiDollarSign size={48} />
          <p>Không có khoản bồi thường nào.</p>
        </div>
      ) : (
        <>
          <div className="compensation-table-wrap">
            <table className="compensation-table">
              <thead>
                <tr>
                  <th>Học sinh</th>
                  <th>Lớp</th>
                  <th>Vi phạm</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="student-cell">
                        <span className="student-avatar">{c.studentName?.charAt(0) || "?"}</span>
                        <div>
                          <div className="student-name">{c.studentName}</div>
                          <div className="student-code">{c.studentCode}</div>
                        </div>
                      </div>
                    </td>
                    <td>{c.className}</td>
                    <td>{c.violationName}</td>
                    <td className="amount-cell">
                      {c.amount != null ? c.amount.toLocaleString("vi-VN") + "đ" : "—"}
                    </td>
                    <td>
                      <span className={`status-badge ${STATUS_BADGE_CLASS[c.status] || ""}`}>
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                    </td>
                    <td>
                      {c.status === "pending" && (
                        <div className="action-btns">
                          <button
                            className="btn-action btn-paid"
                            title="Đánh dấu đã thanh toán"
                            onClick={() => handlePaid(c.id)}
                            disabled={paidMutation.isPending}
                          >
                            <FiCheck /> Thanh toán
                          </button>
                          <button
                            className="btn-action btn-waived"
                            title="Miễn bồi thường"
                            onClick={() => handleWaived(c.id)}
                            disabled={waiveMutation.isPending}
                          >
                            <FiX /> Miễn
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
