import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader, SchoolYearTermSelector } from "../../../../components/common";
import Select from "../../../../components/ui/Select/Select";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { managementLeaveService } from "../../../../services/pages/management/leave-requests/managementLeaveService";
import { unlockRequestService } from "../../../../services/pages/management/approvals/unlockRequestService";
import { teacherService } from "../../../../services/pages/teacher/teacherService";
import {
  FiCheckSquare, FiClock, FiSearch,
  FiInbox, FiAlertTriangle, FiX, FiCheck, FiChevronLeft, FiChevronRight
} from "react-icons/fi";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { getSocketBaseUrl } from "../../../../services/shared/http/apiBaseUrl";
import "./PrincipalApprovals.css";

const getSocketUrl = getSocketBaseUrl;

const getToken = () => {
    const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
    return storedUser?.accessToken || localStorage.getItem("accessToken") || "";
};

let socket = null;

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
  if (status === "approved" || status === "finalized") return <span className="status-badge approved">✅ Đã duyệt</span>;
  if (status === "rejected") return <span className="status-badge rejected">❌ Từ chối</span>;
  return <span className="status-badge">Không xác định</span>;
}

function PriorityBadge({ priority }) {
  const priorityClass =
    priority === "Cao" ? "cao" : priority === "Trung bình" ? "trung-binh" : "thap";
  return <span className={`priority-badge priority-badge--${priorityClass}`}>{priority}</span>;
}

function ItemModal({ item, isOpen, onClose, onAction, isProcessing = false }) {
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
              <button className="btn-modal-reject" onClick={() => onAction(item.id, "rejected")} disabled={isProcessing}>
                <FiX /> Từ chối yêu cầu
              </button>
              <button className="btn-modal-approve" onClick={() => onAction(item.id, "approved")} disabled={isProcessing}>
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
  const [unlockApproveModal, setUnlockApproveModal] = useState({ open: false, request: null, hours: 1, notes: "" });
  const [unlockPage, setUnlockPage] = useState(1);
  const [unlockGradeLevel, setUnlockGradeLevel] = useState(null);
  const unlockPageSize = 10;
  const [gradeApprovals, setGradeApprovals] = useState([]);
  const [gradeApprovalsLoading, setGradeApprovalsLoading] = useState(false);
  const [selectedGradeApprovals, setSelectedGradeApprovals] = useState([]);

  const itemsPerPage = 6;
  const sectionLabel = selectedTerm === "hk1" ? "Học kỳ 1" : "Học kỳ 2";

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
    
    // Map grade approvals to items
    const mappedGrades = gradeApprovals.flatMap(group => 
      group.grades.map(g => ({
        id: `GR-${g.gradeId}`,
        section: "grades",
        sectionLabel: "Chuyên môn",
        title: `${g.gradeItemName}`,
        reference: `#GR-${String(g.gradeId).slice(0, 6).toUpperCase()}`,
        requester: `GV. ${group.teacherName}`,
        summary: `${group.className} - ${group.subjectName}`,
        description: `Lớp: ${group.className}\nMôn: ${group.subjectName}\nCột điểm: ${g.gradeItemName}\nTrọng số: ${g.weight}%\nTrạng thái: ${g.status === "pending" ? "Chờ duyệt" : "Đã duyệt"}\n${g.finalizedAt ? `Đã duyệt lúc: ${new Date(g.finalizedAt).toLocaleString("vi-VN")}\nNgười duyệt: ${g.finalizedByName || "BGH"}` : ""}`,
        time: g.submittedAt ? new Date(g.submittedAt).toLocaleDateString("vi-VN") : "Hôm nay",
        dueAt: "Sớm nhất",
        priority: g.status === "pending" ? "Cao" : "Trung bình",
        status: g.status === "finalized" ? "approved" : g.status,
        gradeId: g.gradeId,
      }))
    );
    
    setItems([...mappedLeaves, ...mappedGrades]);
    setCurrentPage(1);
  }, [leaveResponse, gradeApprovals]);

  const queryClient = useQueryClient();

  // ---- Socket.IO: listen for new unlock requests from teachers ----
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    if (socket) socket.disconnect();
    socket = io(getSocketUrl(), {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("[PrincipalApprovals] Socket connected:", socket.id);
    });

    // A teacher created a new unlock request → refresh the list
    socket.on("unlock_request:created", ({ request }) => {
      toast.info(`Có yêu cầu mở khóa mới từ giáo viên!`);
      // Force refetch the unlock-requests query so the list updates
      queryClient.invalidateQueries({ queryKey: ["unlock-requests"] });
    });

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("unlock_request:created");
        socket.disconnect();
        socket = null;
      }
    };
  }, [queryClient]);

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

  const unlockStatusParam = activeSection === "unlock"
    ? (activeStatus === "all" ? undefined : activeStatus)
    : undefined;

  // Reset page when status filter changes
  useEffect(() => { setUnlockPage(1); }, [activeStatus, unlockGradeLevel]);

  // ─── Grade Approvals (Chuyên môn) ────────────────────────────────────────
  const [gradeApprovalGradeLevel, setGradeApprovalGradeLevel] = useState(null);

  useEffect(() => {
    if (activeSection !== "grades" && activeSection !== "all") return;
    setGradeApprovalsLoading(true);
    teacherService.getPendingGradeApprovals({
      params: {
        semesterId: selectedTerm === "hk1" ? 1 : 2,
        gradeLevelId: gradeApprovalGradeLevel || undefined,
        status: activeStatus === "all" ? undefined : activeStatus,
      },
      mock: false,
    }).then(res => {
      if (res?.success && res?.data?.items) {
        setGradeApprovals(res.data.items);
      } else {
        setGradeApprovals([]);
      }
    }).catch(() => setGradeApprovals([])).finally(() => setGradeApprovalsLoading(false));
  }, [activeSection, selectedTerm, gradeApprovalGradeLevel, activeStatus]);

  const handleApproveGradeBatch = async () => {
    if (selectedGradeApprovals.length === 0) {
      toast.warning("Chọn ít nhất một điểm để duyệt");
      return;
    }
    try {
      const res = await teacherService.approveGradeBatch({
        body: { gradeIds: selectedGradeApprovals, notes: "Duyệt chốt điểm" },
        mock: false,
      });
      if (res?.success) {
        toast.success(res.message || "Đã duyệt chốt điểm");
        setSelectedGradeApprovals([]);
        // Refresh
        setGradeApprovalGradeLevel(null);
        setGradeApprovalsLoading(true);
        teacherService.getPendingGradeApprovals({
          params: {
            semesterId: selectedTerm === "hk1" ? 1 : 2,
            gradeLevelId: gradeApprovalGradeLevel || undefined,
          },
          mock: false,
        }).then(res => {
          if (res?.success && res?.data?.items) {
            setGradeApprovals(res.data.items);
          } else {
            setGradeApprovals([]);
          }
        }).catch(() => setGradeApprovals([])).finally(() => setGradeApprovalsLoading(false));
      } else {
        toast.error(res?.error || "Lỗi khi duyệt điểm");
      }
    } catch (e) {
      toast.error("Lỗi khi duyệt điểm");
    }
  };

  const toggleGradeApproval = (gradeId) => {
    setSelectedGradeApprovals(prev =>
      prev.includes(gradeId) ? prev.filter(id => id !== gradeId) : [...prev, gradeId]
    );
  };

  const { data: unlockResponse, isLoading: unlockLoading, refetch: refetchUnlock } = useQuery({
    queryKey: ["unlock-requests", unlockStatusParam, unlockPage, unlockPageSize, unlockGradeLevel],
    queryFn: async () => {
      const result = await unlockRequestService.listRequests({
        status: unlockStatusParam,
        page: unlockPage,
        limit: unlockPageSize,
        gradeLevelId: unlockGradeLevel || undefined,
      });
      return result;
    },
    enabled: activeSection === "unlock" || activeSection === "all",
    staleTime: 0,
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
    setUnlockApproveModal({ open: true, request, hours: 1, notes: "" });
  };

  const handleBulkApproveUnlock = () => {
    const pending = unlockResponse?.requests?.filter(r => r.status === "pending") || [];
    if (pending.length === 0) { toast.info("Không có yêu cầu nào chờ duyệt."); return; }
    // Use default 1 hour for bulk approve
    pending.forEach(req => unlockApproveMutation.mutate({ id: req.id, hours: 0.1, notes: "Duyệt mở khóa điểm" }));
  };

  const confirmApproveUnlock = () => {
    unlockApproveMutation.mutate({
      id: unlockApproveModal.request.id,
      hours: unlockApproveModal.hours,
      notes: unlockApproveModal.notes || "Duyệt mở khóa điểm"
    });
    setUnlockApproveModal({ open: false, request: null, hours: 1, notes: "" });
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

      {/* ─── Chuyên môn (Duyệt chốt điểm) ─────────────────────────────────── */}
      {activeSection === "grades" && (
        <div className="approvals-table-container unlock-section">
          <div className="table-header-context">
            <h3>Duyệt chốt điểm chuyên môn</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
              <select
                className="filter-dropdown"
                value={gradeApprovalGradeLevel || ""}
                onChange={(e) => setGradeApprovalGradeLevel(e.target.value ? Number(e.target.value) : null)}
                style={{ minWidth: '150px' }}
              >
                <option value="">Tất cả khối lớp</option>
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
              </select>
              {selectedGradeApprovals.length > 0 && (
                <button className="btn-table-action" onClick={handleApproveGradeBatch}>
                  Duyệt chốt ({selectedGradeApprovals.length})
                </button>
              )}
            </div>
          </div>

          {gradeApprovalsLoading ? (
            <div className="empty-state">
              <div className="loading-spinner" />
              <p>Đang tải điểm chờ duyệt...</p>
            </div>
          ) : gradeApprovals.length === 0 ? (
            <div className="empty-state">
              <FiAlertTriangle />
              <p>Không có điểm nào đang chờ duyệt.</p>
            </div>
          ) : (
            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ width: 30 }}></th>
                  <th>Lớp</th>
                  <th>Môn</th>
                  <th>Giáo viên</th>
                  <th>Số điểm</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {gradeApprovals.map((item) => (
                  <tr key={`${item.classId}-${item.subjectId}`}>
                    <td>
                      <input
                        type="checkbox"
                        checked={item.grades.every(g => selectedGradeApprovals.includes(g.gradeId))}
                        onChange={() => item.grades.forEach(g => toggleGradeApproval(g.gradeId))}
                        disabled={item.grades.every(g => g.status === "finalized")}
                      />
                    </td>
                    <td>{item.className}</td>
                    <td>{item.subjectName}</td>
                    <td>{item.teacherName}</td>
                    <td>{item.grades.length}</td>
                    <td>
                      {item.grades.every(g => g.status === "finalized") ? (
                        <span className="status-badge approved">✅ Đã duyệt</span>
                      ) : (
                        <span className="status-badge pending">⏳ Chờ duyệt</span>
                      )}
                    </td>
                    <td className="text-right">
                      {item.grades.every(g => g.status === "finalized") ? (
                        <span style={{ color: "#64748b", fontSize: "0.9rem" }}>—</span>
                      ) : (
                        <button
                          className="btn-table-action"
                          onClick={() => item.grades.forEach(g => toggleGradeApproval(g.gradeId))}
                        >
                          {item.grades.every(g => selectedGradeApprovals.includes(g.gradeId)) ? "Bỏ chọn" : "Chọn tất cả"}
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

      {/* ─── Mở khóa điểm ───────────────────────────────────────────────────── */}
      {activeSection === "unlock" && (
        <div className="approvals-table-container unlock-section">
          <div className="table-header-context">
            <h3>Yêu cầu mở khóa điểm</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
              <select
                className="filter-dropdown"
                value={unlockGradeLevel || ""}
                onChange={(e) => setUnlockGradeLevel(e.target.value ? Number(e.target.value) : null)}
                style={{ minWidth: '150px' }}
              >
                <option value="">Tất cả khối lớp</option>
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
              </select>
            </div>
          </div>

          {unlockLoading ? (
            <div className="empty-state">
              <div className="loading-spinner" />
              <p>Đang tải yêu cầu...</p>
            </div>
          ) : !unlockResponse?.requests?.length ? (
            <div className="empty-state">
              <FiAlertTriangle />
              <p>Không có yêu cầu mở khóa nào.</p>
            </div>
          ) : (
            <>
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
                {unlockResponse.requests.map((req) => (
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

            {/* Footer actions */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
              <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                Tổng: {unlockResponse.pagination?.total || unlockResponse.requests.length} yêu cầu
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {unlockResponse.requests.some(r => r.status === "pending") && (
                  <button
                    className="btn-table-action"
                    style={{ backgroundColor: "#28a745", fontWeight: 600 }}
                    onClick={handleBulkApproveUnlock}
                    disabled={unlockApproveMutation.isPending || unlockRejectMutation.isPending}
                  >
                    <FiCheckSquare style={{ marginRight: 4 }} />
                    Duyệt tất cả ({unlockResponse.requests.filter(r => r.status === "pending").length})
                  </button>
                )}
                {unlockResponse.pagination && unlockResponse.pagination.totalPages > 1 && (
                  <div className="page-numbers">
                    <button
                      className="page-btn"
                      onClick={() => setUnlockPage(p => Math.max(1, p - 1))}
                      disabled={unlockPage === 1}
                    >
                      <FiChevronLeft />
                    </button>
                    {Array.from({ length: unlockResponse.pagination.totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`page-num ${unlockPage === page ? "active" : ""}`}
                        style={unlockPage === page ? { background: "#3b82f6", color: "#fff", border: "1px solid #3b82f6" } : {}}
                        onClick={() => setUnlockPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      className="page-btn"
                      onClick={() => setUnlockPage(p => Math.min(unlockResponse.pagination.totalPages, p + 1))}
                      disabled={unlockPage === unlockResponse.pagination.totalPages}
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                )}
              </div>
            </div>
            </>
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

      {/* ─── Approve Unlock Modal ─────────────────────────────────────────────── */}
      {unlockApproveModal.open && (
        <div className="modal-overlay" onClick={() => setUnlockApproveModal({ open: false, request: null, hours: 1, notes: "" })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h2>Phê duyệt mở khóa điểm</h2>
              <button className="modal-close" onClick={() => setUnlockApproveModal({ open: false, request: null, hours: 1, notes: "" })}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <label>Yêu cầu mở khóa của: <strong>{unlockApproveModal.request?.requestedByName}</strong></label>
                <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "8px 0" }}>
                  Học sinh: {unlockApproveModal.request?.studentName || unlockApproveModal.request?.student?.fullName || "N/A"} - Lớp: {unlockApproveModal.request?.className || "N/A"}
                </p>
              </div>

              <div className="modal-section">
                <label>Thời gian mở khóa <span style={{ color: "red" }}>*</span></label>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    type="number"
                    min="0"
                    max="720"
                    step="0.1"
                    placeholder="VD: 0.1 = 6 phút, 1 = 1 giờ"
                    value={unlockApproveModal.hours}
                    onChange={(e) => setUnlockApproveModal(prev => ({ ...prev, hours: parseFloat(e.target.value) || 0 }))}
                    style={{ width: 100, padding: 8, borderRadius: 6, border: "1px solid #ddd", fontSize: "1rem" }}
                  />
                  <span style={{ color: "#64748b" }}>giờ</span>
                  <div style={{ display: "flex", gap: 6, marginLeft: 12 }}>
                    <button type="button" onClick={() => setUnlockApproveModal(prev => ({ ...prev, hours: 0.5 }))}
                      style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #ddd", background: unlockApproveModal.hours === 0.5 ? "#3b82f6" : "#fff", color: unlockApproveModal.hours === 0.5 ? "#fff" : "#333", cursor: "pointer", fontSize: "0.8rem" }}>
                      30p
                    </button>
                    <button type="button" onClick={() => setUnlockApproveModal(prev => ({ ...prev, hours: 1 }))}
                      style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #ddd", background: unlockApproveModal.hours === 1 ? "#3b82f6" : "#fff", color: unlockApproveModal.hours === 1 ? "#fff" : "#333", cursor: "pointer", fontSize: "0.8rem" }}>
                      1h
                    </button>
                    <button type="button" onClick={() => setUnlockApproveModal(prev => ({ ...prev, hours: 2 }))}
                      style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #ddd", background: unlockApproveModal.hours === 2 ? "#3b82f6" : "#fff", color: unlockApproveModal.hours === 2 ? "#fff" : "#333", cursor: "pointer", fontSize: "0.8rem" }}>
                      2h
                    </button>
                    <button type="button" onClick={() => setUnlockApproveModal(prev => ({ ...prev, hours: 4 }))}
                      style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #ddd", background: unlockApproveModal.hours === 4 ? "#3b82f6" : "#fff", color: unlockApproveModal.hours === 4 ? "#fff" : "#333", cursor: "pointer", fontSize: "0.8rem" }}>
                      4h
                    </button>
                    <button type="button" onClick={() => setUnlockApproveModal(prev => ({ ...prev, hours: 24 }))}
                      style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #ddd", background: unlockApproveModal.hours === 24 ? "#3b82f6" : "#fff", color: unlockApproveModal.hours === 24 ? "#fff" : "#333", cursor: "pointer", fontSize: "0.8rem" }}>
                      24h
                    </button>
                  </div>
                </div>
                <p style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: 6 }}>
                  Hệ thống sẽ tự động khóa lại sau {unlockApproveModal.hours} giờ
                </p>
              </div>

              <div className="modal-section">
                <label>Ghi chú (tùy chọn)</label>
                <textarea
                  rows={2}
                  value={unlockApproveModal.notes}
                  onChange={(e) => setUnlockApproveModal(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Nhập ghi chú phê duyệt..."
                  style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ddd", resize: "vertical" }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-modal-reject"
                onClick={() => setUnlockApproveModal({ open: false, request: null, hours: 1, notes: "" })}
                disabled={unlockApproveMutation.isPending}
              >
                Hủy
              </button>
              <button
                className="btn-modal-approve"
                onClick={confirmApproveUnlock}
                disabled={unlockApproveMutation.isPending || unlockApproveModal.hours <= 0}
              >
                {unlockApproveMutation.isPending ? "Đang xử lý..." : "Xác nhận duyệt"}
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
        isProcessing={processMutation.isPending}
      />
    </div>
  );
}
