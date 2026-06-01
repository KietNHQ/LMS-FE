import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader, SchoolYearTermSelector } from "../../../../components/common";
import Select from "../../../../components/ui/Select/Select";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { managementLeaveService } from "../../../../services/pages/management/leave-requests/managementLeaveService";
import { unlockRequestService } from "../../../../services/pages/management/approvals/unlockRequestService";
import {
  FiCheckSquare, FiClock, FiSearch,
  FiInbox, FiAlertTriangle, FiX, FiCheck, FiChevronLeft, FiChevronRight
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./PrincipalApprovals.css";

// WORK_ITEMS removed. Data now comes from managementLeaveService via useQuery.

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

const SECTION_OPTIONS = [
  { value: "all", label: "Tất cả luồng" },
  { value: "grades", label: "Chuyên môn" },
  { value: "activities", label: "Kế hoạch & ngân sách" },
  { value: "leave", label: "Đơn xin phép" },
  { value: "unlock", label: "Mở khóa điểm" },
];

function StatusBadge({ status }) {
  if (status === "pending") return <span className="status-badge pending">⏳ Chờ duyệt</span>;
  if (status === "approved") return <span className="status-badge approved">✅ Đã duyệt</span>;
  if (status === "rejected") return <span className="status-badge rejected">❌ Từ chối</span>;
  return <span className="status-badge">Không xác định</span>;
}

function PriorityBadge({ priority }) {
  const priorityClass =
    priority === "Cao" ? "cao" : priority === "Trung bình" ? "trung-binh" : "thap";
  return <span className={`priority-badge priority-badge--${priorityClass}`}>{priority}</span>;
}

function ItemModal({ item, isOpen, onClose, onAction }) {
  if (!isOpen || !item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header__info">
            <span className="modal-ref">{item.reference}</span>
            <h2>{item.title}</h2>
          </div>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>
        
        <div className="modal-body">
          <div className="modal-grid">
            <div className="modal-field">
              <label>Đơn vị trình</label>
              <div className="modal-val">
                <strong>{item.requester}</strong>
                <span>{item.time}</span>
              </div>
            </div>
            <div className="modal-field">
              <label>Mức độ ưu tiên</label>
              <div className="modal-val"><PriorityBadge priority={item.priority} /></div>
            </div>
            <div className="modal-field">
              <label>Hạn xử lý</label>
              <div className="modal-val">
                <FiClock /> {item.dueAt}
              </div>
            </div>
            <div className="modal-field">
              <label>Trạng thái</label>
              <div className="modal-val"><StatusBadge status={item.status} /></div>
            </div>
          </div>

          <div className="modal-section">
            <label>Nội dung tóm tắt</label>
            <p className="modal-summary">{item.summary}</p>
          </div>

          <div className="modal-section">
            <label>Chi tiết yêu cầu</label>
            <div className="modal-description">
              {item.description || "Không có mô tả chi tiết cho yêu cầu này."}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {item.status === "pending" ? (
            <div className="modal-actions">
              <button className="btn-modal-reject" onClick={() => onAction(item.id, "rejected")} disabled={processMutation.isPending}>
                <FiX /> Từ chối yêu cầu
              </button>
              <button className="btn-modal-approve" onClick={() => onAction(item.id, "approved")} disabled={processMutation.isPending}>
                <FiCheck /> Phê duyệt ngay
              </button>
            </div>
          ) : (
            <button className="btn-modal-close" onClick={onClose}>Đóng chi tiết</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PrincipalApprovals() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const [activeSection, setActiveSection] = useState("all");
  const [activeStatus, setActiveStatus] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [unlockRejectModal, setUnlockRejectModal] = useState({ open: false, request: null });

  const itemsPerPage = 6;
  const sectionLabel = selectedTerm === "hk1" ? "Học kỳ 1" : "Học kỳ 2";

  // Fetch leave requests from backend via managementLeaveService
  const { data: leaveResponse, isLoading } = useQuery({
    queryKey: ["management-leave-requests", activeStatus],
    queryFn: () => managementLeaveService.getLeaveRequests({ status: activeStatus, limit: 100 }),
  });

  // Map API response to WORK_ITEMS shape
  useEffect(() => {
    if (!leaveResponse?.data) return;
    const mappedLeaves = leaveResponse.data.map(req => ({
      id: String(req.id),
      section: "leave",
      sectionLabel: "Đơn xin phép",
      title: `Đơn xin nghỉ học: ${req.studentName || req.student?.fullName || "Học sinh"}`,
      reference: `#LR-${String(req.id).slice(0, 6).toUpperCase()}`,
      requester: `Phụ huynh ${req.guardianName || ""}`,
      summary: `Lý do: ${req.reason}`,
      description: `Học sinh: ${req.studentName || req.student?.fullName || ""}\nMã HS: ${req.studentCode || ""}\nLớp: ${req.className || ""}\nThời gian nghỉ: Từ ${req.startDate} đến ${req.endDate}\nSố ngày: ${req.totalDays || 1}\nLý do: ${req.reason}\n\nGhi chú phụ huynh: ${req.note || "Không có"}\n\nÝ kiến BGH: ${req.adminNotes || "Chưa có"}\nNgười duyệt: ${req.reviewedByName || "Chưa xử lý"}\nLúc: ${req.reviewedAt || ""}`,
      time: req.createdAt ? new Date(req.createdAt).toLocaleDateString("vi-VN") : "Hôm nay",
      dueAt: "Sớm nhất",
      priority: req.status === "pending" ? "Cao" : "Trung bình",
      status: req.status || "pending",
    }));
    setItems(mappedLeaves);
    setCurrentPage(1);
  }, [leaveResponse]);

  const metrics = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter((item) => item.status === "pending").length,
      urgent: items.filter((item) => item.status === "pending" && item.priority === "Cao").length,
      resolved: items.filter((item) => item.status !== "pending").length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSection = activeSection === "all" || item.section === activeSection;
      const matchesStatus = activeStatus === "all" || item.status === activeStatus;
      const matchesSearch = [item.id, item.title, item.requester, item.summary, item.reference]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesSection && matchesStatus && matchesSearch;
    });
  }, [activeSection, activeStatus, items, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const visibleItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  const processMutation = useMutation({
    mutationFn: ({ id, status, adminNotes }) => {
      if (status === "approved") {
        return managementLeaveService.approveLeaveRequest(id, adminNotes);
      } else {
        return managementLeaveService.rejectLeaveRequest(id, adminNotes);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["management-leave-requests"] });
      setIsModalOpen(false);
      toast.success("Đã xử lý yêu cầu");
    },
    onError: () => {
      toast.error("Xử lý thất bại. Vui lòng thử lại.");
    },
  });

  const bulkMutation = useMutation({
    mutationFn: (ids) => {
      const promises = ids.map(id =>
        managementLeaveService.approveLeaveRequest(id, "Duyệt nhanh")
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["management-leave-requests"] });
      toast.success(`Đã phê duyệt yêu cầu`);
    },
    onError: () => {
      toast.error("Duyệt nhiều thất bại. Vui lòng thử lại.");
    },
  });

  const updateItemStatus = (id, status, adminNotes = "") => {
    processMutation.mutate({ id, status, adminNotes });
  };

  // ─── Unlock Requests ────────────────────────────────────────────────────────
  const queryClient = useQueryClient();

  const unlockStatusParam = activeSection === "unlock"
    ? (activeStatus === "all" ? undefined : activeStatus)
    : undefined;

  const { data: unlockResponse, isLoading: unlockLoading } = useQuery({
    queryKey: ["unlock-requests", unlockStatusParam],
    queryFn: () => unlockRequestService.listRequests({
      status: unlockStatusParam,
      limit: 100,
    }),
    enabled: activeSection === "unlock" || activeSection === "all",
  });

  const unlockApproveMutation = useMutation({
    mutationFn: ({ id, hours, notes }) => unlockRequestService.approveRequest(id, { hours, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unlock-requests"] });
      toast.success("Đã duyệt yêu cầu mở khóa");
    },
    onError: () => {
      toast.error("Duyệt thất bại. Vui lòng thử lại.");
    },
  });

  const unlockRejectMutation = useMutation({
    mutationFn: ({ id, notes }) => unlockRequestService.rejectRequest(id, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unlock-requests"] });
      setUnlockRejectModal({ open: false, request: null });
      setRejectNotes("");
      toast.success("Đã từ chối yêu cầu mở khóa");
    },
    onError: () => {
      toast.error("Từ chối thất bại. Vui lòng thử lại.");
    },
  });

  const handleApproveUnlock = (request) => {
    unlockApproveMutation.mutate({ id: request.id, hours: 24, notes: "Duyệt mở khóa điểm" });
  };

  const handleRejectUnlock = (request) => {
    setUnlockRejectModal({ open: true, request });
  };

  const confirmReject = () => {
    if (!rejectNotes.trim() || rejectNotes.trim().length < 5) {
      toast.warn("Ghi chú từ chối phải có ít nhất 5 ký tự.");
      return;
    }
    unlockRejectMutation.mutate({ id: unlockRejectModal.request.id, notes: rejectNotes.trim() });
  };

  const bulkApprove = () => {
    const pendingVisible = filteredItems.filter((item) => item.status === "pending");
    if (pendingVisible.length === 0) {
      toast.info("Không có yêu cầu chờ duyệt.");
      return;
    }
    const ids = pendingVisible.map((item) => item.id);
    bulkMutation.mutate(ids);
  };

  const openItemDetail = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="principal-approvals">
      <PageHeader
        title="Trung tâm Phê duyệt & Backlog"
        actions={
          <SchoolYearTermSelector
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            onTermChange={handleTermChange}
          />
        }
      />

      <div className="approvals-hero-unified">
        <div className="approvals-hero-unified__info">
          <div className="hero-status-tag"><FiInbox /> Hàng chờ điều hành</div>
          <h2>Danh sách phê duyệt & Backlog</h2>
          <p>Xử lý tập trung các yêu cầu từ chuyên môn và kế hoạch ngân sách.</p>
        </div>

        <div className="hero-metrics-grid">
          <div className="hero-metric-card">
            <span className="label">Tổng số</span>
            <strong>{metrics.total}</strong>
          </div>
          <div className="hero-metric-card focus">
            <span className="label">Chờ duyệt</span>
            <strong>{metrics.pending}</strong>
          </div>
          <div className="hero-metric-card urgent">
            <span className="label">Ưu tiên cao</span>
            <strong>{metrics.urgent}</strong>
          </div>
          <div className="hero-metric-card">
            <span className="label">Đã xử lý</span>
            <strong>{metrics.resolved}</strong>
          </div>
        </div>
      </div>

      <div className="approvals-controls-refined">
        <div className="search-box-wrapper">
          <FiSearch />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Mã, tiêu đề, đơn vị trình..."
          />
        </div>

        <div className="filters-row">
          <Select
            variant="custom"
            options={SECTION_OPTIONS}
            value={activeSection}
            onChange={(e) => {
              setActiveSection(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-dropdown"
            placeholder="Luồng công việc"
          />
          <Select
            variant="custom"
            options={STATUS_OPTIONS}
            value={activeStatus}
            onChange={(e) => {
              setActiveStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-dropdown"
            placeholder="Trạng thái"
          />
        </div>

        <button className="bulk-approve-btn" onClick={bulkApprove} disabled={bulkMutation.isPending}>
          <FiCheckSquare /> Phê duyệt nhanh
        </button>
      </div>

      <div className="approvals-table-container">
        <div className="table-header-context">
          <h3>
            {activeStatus === "pending"
              ? "Hàng chờ xử lý"
              : activeStatus === "approved"
              ? "Lịch sử phê duyệt"
              : activeStatus === "rejected"
              ? "Yêu cầu đã từ chối"
              : "Danh sách tổng quát"}{" "}
            ({filteredItems.length})
          </h3>
          <div className="table-legend">
             <span><span className="dot pending" /> Chờ duyệt</span>
             <span><span className="dot approved" /> Đã duyệt</span>
             <span><span className="dot rejected" /> Từ chối</span>
          </div>
        </div>

        <div className="table-wrapper">
          {isLoading ? (
            <div className="empty-state">
              <div className="loading-spinner" />
              <p>Đang tải yêu cầu...</p>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="empty-state">
              <FiAlertTriangle />
              <p>Không tìm thấy yêu cầu phù hợp.</p>
            </div>
          ) : (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Ưu tiên</th>
                  <th>Nội dung công việc</th>
                  <th>Đơn vị trình</th>
                  <th>Hạn xử lý</th>
                  <th>Tình trạng</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => (
                  <tr key={item.id} className={item.status === "pending" ? "row-pending" : ""}>
                    <td><PriorityBadge priority={item.priority} /></td>
                    <td>
                      <div className="item-main-info" onClick={() => openItemDetail(item)}>
                        <span className="title">{item.title}</span>
                        <span className="ref">{item.reference}</span>
                      </div>
                    </td>
                    <td>
                      <div className="requester-info">
                        <strong>{item.requester}</strong>
                        <span>{item.time}</span>
                      </div>
                    </td>
                    <td>
                      <div className="deadline-box">
                        <FiClock /> {item.dueAt}
                        <span className="section-tag">{item.sectionLabel}</span>
                      </div>
                    </td>
                    <td><StatusBadge status={item.status} /></td>
                    <td className="text-right">
                      {item.status === "pending" ? (
                        <button className="btn-table-action" onClick={() => openItemDetail(item)}>
                          Xem & Duyệt
                        </button>
                      ) : (
                        <button className="btn-table-secondary" onClick={() => openItemDetail(item)}>
                          Xem chi tiết
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination-footer">
            <button 
              className="page-btn" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              <FiChevronLeft />
            </button>
            <div className="page-numbers">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`page-num ${currentPage === i + 1 ? "active" : ""}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              className="page-btn" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* ─── Mở khóa điểm ───────────────────────────────────────────────────── */}
      {(activeSection === "unlock" || activeSection === "all") && (
        <div className="approvals-table-container unlock-section">
          <div className="table-header-context">
            <h3>Yêu cầu mở khóa điểm</h3>
          </div>

          {unlockLoading ? (
            <div className="empty-state">
              <div className="loading-spinner" />
              <p>Đang tải yêu cầu...</p>
            </div>
          ) : !unlockResponse?.data?.requests?.length ? (
            <div className="empty-state">
              <FiAlertTriangle />
              <p>Không có yêu cầu mở khóa nào.</p>
            </div>
          ) : (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Học sinh</th>
                  <th>Lớp</th>
                  <th>Loại</th>
                  <th>Lý do</th>
                  <th>Người yêu cầu</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {unlockResponse.data.requests.map((req) => (
                  <tr key={req.id}>
                    <td><strong>{req.student_id}</strong></td>
                    <td>{req.class_name || req.class_id}</td>
                    <td>
                      <span className="status-badge">
                        {req.target_type === "grade" ? "📝 Điểm" : "🏆 Hạnh kiểm"}
                      </span>
                    </td>
                    <td>
                      <span title={req.reason} style={{ maxWidth: 200, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {req.reason}
                      </span>
                    </td>
                    <td>{req.requested_by_name || req.requested_by}</td>
                    <td>
                      {req.requested_at
                        ? new Date(req.requested_at).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td>
                      <span className={`status-badge ${req.status}`}>
                        {req.status === "pending" ? "⏳ Chờ duyệt"
                          : req.status === "approved" ? "✅ Đã duyệt"
                          : req.status === "rejected" ? "❌ Từ chối"
                          : req.status}
                      </span>
                    </td>
                    <td className="text-right">
                      {req.status === "pending" ? (
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button
                            className="btn-table-action"
                            style={{ backgroundColor: "#dc3545", minWidth: 80 }}
                            onClick={() => handleRejectUnlock(req)}
                            disabled={unlockRejectMutation.isPending || unlockApproveMutation.isPending}
                          >
                            Từ chối
                          </button>
                          <button
                            className="btn-table-action"
                            onClick={() => handleApproveUnlock(req)}
                            disabled={unlockApproveMutation.isPending || unlockRejectMutation.isPending}
                          >
                            Duyệt
                          </button>
                        </div>
                      ) : (
                        <button className="btn-table-secondary" onClick={() => {}}>
                          Xem
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ─── Reject Notes Modal ─────────────────────────────────────────────── */}
      {unlockRejectModal.open && (
        <div className="modal-overlay" onClick={() => setUnlockRejectModal({ open: false, request: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Từ chối yêu cầu mở khóa</h2>
              <button className="modal-close" onClick={() => setUnlockRejectModal({ open: false, request: null })}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <label>Ghi chú từ chối <span style={{ color: "red" }}>*</span></label>
                <textarea
                  rows={3}
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Nhập lý do từ chối (ít nhất 5 ký tự)..."
                  style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ddd", resize: "vertical" }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-modal-reject"
                onClick={() => setUnlockRejectModal({ open: false, request: null })}
                disabled={unlockRejectMutation.isPending}
              >
                Hủy
              </button>
              <button
                className="btn-modal-approve"
                onClick={confirmReject}
                disabled={unlockRejectMutation.isPending}
              >
                {unlockRejectMutation.isPending ? "Đang xử lý..." : "Xác nhận từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ItemModal 
        item={selectedItem} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onAction={updateItemStatus}
      />
    </div>
  );
}

