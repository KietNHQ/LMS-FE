import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiClock, FiCheck, FiX, FiAlertCircle, FiSearch, FiCalendar } from "react-icons/fi";
import { toast } from "react-toastify";
import { classesService } from "../../../services/pages/management/classes";
import { managementLeaveService } from "../../../services/pages/management/leave-requests";
import { Pagination, StatusBadge, LoadingSpinner, PageHeader } from "../../../components/common";
import LeaveRequestDetailModal from "./components/LeaveRequestDetailModal";
import LeaveRequestActionModal from "./components/LeaveRequestActionModal";
import { normalizePermissions } from "../../../hooks/useAuth";
import { resolveSemester } from "../../../services/shared/schoolYearLookup";
import { formatDateTimeVi, formatDateVi, toDateOnlyString } from "../../../utils/dateUtils";
import "./ManagementLeaveRequests.css";

export default function ManagementLeaveRequests({ selectedSchoolYear, selectedTerm }) {
  // State
  const [requests, setRequests] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [actionType, setActionType] = useState(""); // 'approved' | 'rejected'
  const [actionNotes, setActionNotes] = useState("");

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClass, setFilterClass] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [termDateRange, setTermDateRange] = useState({ dateFrom: "", dateTo: "" });
  const [isTermRangeLoading, setIsTermRangeLoading] = useState(false);

  // Pagination stats
  const itemsPerPage = 10;

  // Retrieve user permissions for conditional action display
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    try {
      const isPersistent = localStorage.getItem("isPersistent") === "true";
      const userStr = sessionStorage.getItem("user") || (isPersistent ? localStorage.getItem("user") : null);
      if (userStr) {
        const user = JSON.parse(userStr);
        const perms = normalizePermissions(user.permissions || []);
        setUserPermissions(perms);
      }
    } catch (e) {
      console.warn("Failed to load user permissions", e);
    }
  }, []);

  const canApprove = userPermissions.includes("leave_requests:approve") || userPermissions.includes("leave_requests:manage");

  useEffect(() => {
    let isMounted = true;

    const loadTermDateRange = async () => {
      if (!selectedSchoolYear || !selectedTerm) {
        if (isMounted) setTermDateRange({ dateFrom: "", dateTo: "" });
        if (isMounted) setIsTermRangeLoading(false);
        return;
      }

      try {
        setIsTermRangeLoading(true);
        const semester = await resolveSemester(selectedSchoolYear, selectedTerm);
        if (!isMounted) return;
        setTermDateRange({
          dateFrom: toDateOnlyString(semester?.start_date || semester?.startDate),
          dateTo: toDateOnlyString(semester?.end_date || semester?.endDate),
        });
      } catch (err) {
        console.warn("Failed to resolve leave request semester date range.", err);
        if (isMounted) setTermDateRange({ dateFrom: "", dateTo: "" });
      } finally {
        if (isMounted) setIsTermRangeLoading(false);
      }
    };

    loadTermDateRange();
    setCurrentPage(1);

    return () => {
      isMounted = false;
    };
  }, [selectedSchoolYear, selectedTerm]);

  const effectiveDateFrom = filterDateFrom || termDateRange.dateFrom;
  const effectiveDateTo = filterDateTo || termDateRange.dateTo;

  // Fetch Class list for filter dropdown on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const list = await classesService.listClasses();
        setClasses(list || []);
      } catch (err) {
        console.warn("Failed to load classes for filter.", err);
      }
    };
    fetchClasses();
  }, []);

  // Fetch data when filters or page change
  const fetchData = useCallback(async () => {
    if (isTermRangeLoading) {
      setIsLoading(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await managementLeaveService.getLeaveRequests({
        page: currentPage,
        limit: itemsPerPage,
        status: filterStatus,
        classId: filterClass,
        dateFrom: effectiveDateFrom,
        dateTo: effectiveDateTo,
        search: searchTerm,
        mock: false
      });

      if (res && res.success) {
        setRequests(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.total_pages || 1);
        } else {
          // fallback if mock returned direct list without wrapper (should be wrapped in service already)
          setTotalPages(Math.ceil(res.data.length / itemsPerPage) || 1);
        }
      }
    } catch (error) {
      console.error("Error loading leave requests:", error);
      toast.error("Không thể tải danh sách đơn nghỉ phép.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filterStatus, filterClass, effectiveDateFrom, effectiveDateTo, searchTerm, isTermRangeLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Simple statistics count matching the queried filters (or all requests)
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const fetchStatsRef = useRef(null);
  fetchStatsRef.current = async () => {
    if (isTermRangeLoading) return;

    try {
      // Query everything without pagination and filters to show global totals
      const allRes = await managementLeaveService.getLeaveRequests({
        page: 1,
        limit: 1000,
        classId: filterClass,
        dateFrom: effectiveDateFrom,
        dateTo: effectiveDateTo,
        search: searchTerm,
        mock: false
      });
      if (allRes && allRes.success) {
        const list = allRes.data || [];
        setStats({
          total: list.length,
          pending: list.filter((r) => r.status === "pending").length,
          approved: list.filter((r) => r.status === "approved").length,
          rejected: list.filter((r) => r.status === "rejected").length
        });
      }
    } catch (err) {
      console.warn("Failed to load global statistics.", err);
    }
  };

  useEffect(() => {
    fetchStatsRef.current();
  }, [requests, filterClass, effectiveDateFrom, effectiveDateTo, searchTerm, isTermRangeLoading]); // Refreshes when scoped filters change

  // Action handlers
  const handleViewDetail = (req) => {
    setSelectedRequest(req);
    setIsDetailOpen(true);
  };

  const handleOpenAction = (req, type) => {
    setSelectedRequest(req);
    setActionType(type);
    setActionNotes("");
    setIsActionOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest) return;
    try {
      let res;
      if (actionType === "approved") {
        res = await managementLeaveService.approveLeaveRequest(selectedRequest.id, actionNotes);
      } else {
        res = await managementLeaveService.rejectLeaveRequest(selectedRequest.id, actionNotes);
      }

      if (res && res.success) {
        toast.success(
          actionType === "approved"
            ? "Đã phê duyệt đơn xin nghỉ phép thành công!"
            : "Đã từ chối đơn xin nghỉ phép thành công!"
        );
        setIsActionOpen(false);
        fetchData(); // refresh list
      } else {
        toast.error("Thực hiện thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Action error:", err);
      toast.error("Có lỗi xảy ra khi cập nhật đơn nghỉ phép.");
    }
  };

  return (
    <div className="mlr-page-view animate-fade-in">
      <PageHeader 
        title="Quản Lý Đơn Nghỉ Phép"
        eyebrow="Phân hệ Giám Sát"
        description="Theo dõi, phê duyệt hoặc từ chối các yêu cầu nghỉ phép của học sinh từ phụ huynh gửi lên."
      />
      {/* 4 Stats Cards Grid */}
      <div className="mlr-stats-grid-dashboard">
        <div className="mlr-stat-dashboard-card total">
          <div className="card-left">
            <span className="card-title-lbl">Tổng số đơn</span>
            <span className="card-value-lbl">{stats.total}</span>
          </div>
          <div className="card-icon-circle bg-blue">
            <FiCalendar size={24} />
          </div>
        </div>

        <div className="mlr-stat-dashboard-card pending">
          <div className="card-left">
            <span className="card-title-lbl">Đang chờ duyệt</span>
            <span className="card-value-lbl">{stats.pending}</span>
          </div>
          <div className="card-icon-circle bg-yellow">
            <FiClock size={24} />
          </div>
        </div>

        <div className="mlr-stat-dashboard-card approved">
          <div className="card-left">
            <span className="card-title-lbl">Đã phê duyệt</span>
            <span className="card-value-lbl">{stats.approved}</span>
          </div>
          <div className="card-icon-circle bg-green">
            <FiCheck size={24} />
          </div>
        </div>

        <div className="mlr-stat-dashboard-card rejected">
          <div className="card-left">
            <span className="card-title-lbl">Bị từ chối</span>
            <span className="card-value-lbl">{stats.rejected}</span>
          </div>
          <div className="card-icon-circle bg-red">
            <FiX size={24} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mlr-filter-dashboard-bar">
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            className="filter-search-box"
            placeholder="Tìm học sinh, phụ huynh..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset page on query
            }}
          />
        </div>

        <div className="filters-group-right">
          <select
            className="filter-select-box"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>

          <select
            className="filter-select-box"
            value={filterClass}
            onChange={(e) => {
              setFilterClass(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Tất cả lớp học</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.grade})
              </option>
            ))}
          </select>

          <div className="date-inputs-group">
            <input
              type="date"
              className="filter-date-box"
              value={filterDateFrom}
              title="Từ ngày"
              onChange={(e) => {
                setFilterDateFrom(e.target.value);
                setCurrentPage(1);
              }}
            />
            <span className="date-separator">→</span>
            <input
              type="date"
              className="filter-date-box"
              value={filterDateTo}
              title="Đến ngày"
              onChange={(e) => {
                setFilterDateTo(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="mlr-table-dashboard-container">
        {isLoading ? (
          <div className="mlr-loading-spinner-box">
            <LoadingSpinner size="lg" label="Đang nạp dữ liệu đơn nghỉ phép..." />
          </div>
        ) : requests.length === 0 ? (
          <div className="mlr-empty-dashboard-state">
            <FiAlertCircle size={44} className="empty-icon" />
            <p className="empty-msg">Không tìm thấy đơn xin nghỉ phép nào phù hợp.</p>
          </div>
        ) : (
          <>
            <table className="mlr-premium-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>STT</th>
                  <th>Học sinh</th>
                  <th>Phụ huynh</th>
                  <th>Thời gian nghỉ</th>
                  <th style={{ maxWidth: "250px" }}>Lý do nghỉ</th>
                  <th>Trạng thái</th>
                  <th>Người phê duyệt</th>
                  <th style={{ width: "220px", textAlign: "center" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, index) => (
                  <tr key={req.id} className="row-hover-animation">
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>
                      <div className="student-cell">
                        <span className="student-name-val">{req.studentName}</span>
                        <span className="student-code-class">{req.studentCode} • {req.className}</span>
                      </div>
                    </td>
                    <td className="guardian-name-val">{req.guardianName}</td>
                    <td>
                      <div className="date-duration-cell">
                        <span className="date-range-text">{formatDateVi(req.startDate)} → {formatDateVi(req.endDate)}</span>
                        <span className="duration-pill">{req.totalDays} ngày</span>
                      </div>
                    </td>
                    <td className="reason-cell-val" title={req.reason}>
                      {req.reason}
                    </td>
                    <td>
                      <StatusBadge status={req.status === "approved" ? "success" : req.status}>
                        {req.status === "pending" && <FiClock style={{ marginRight: "4px" }} />}
                        {req.status === "approved" && <FiCheck style={{ marginRight: "4px" }} />}
                        {req.status === "rejected" && <FiX style={{ marginRight: "4px" }} />}
                        {req.statusLabel || (req.status === "pending" ? "Chờ duyệt" : req.status === "approved" ? "Đã duyệt" : "Từ chối")}
                      </StatusBadge>
                    </td>
                    <td className="reviewed-by-cell">
                      {req.reviewedByName ? (
                        <div className="reviewed-by-info">
                          <span className="reviewer-name">{req.reviewedByName}</span>
                          <span className="reviewer-time">{formatDateTimeVi(req.reviewedAt)}</span>
                        </div>
                      ) : (
                        <span className="no-reviewer">-</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <div className="actions-buttons-container">
                        <button
                          className="action-btn view-only"
                          title="Xem chi tiết"
                          onClick={() => handleViewDetail(req)}
                        >
                          Chi tiết
                        </button>
                        {req.status === "pending" && canApprove && (
                          <>
                            <button
                              className="action-btn approve-btn"
                              title="Duyệt đơn"
                              onClick={() => handleOpenAction(req, "approved")}
                            >
                              Duyệt
                            </button>
                            <button
                              className="action-btn reject-btn"
                              title="Từ chối đơn"
                              onClick={() => handleOpenAction(req, "rejected")}
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mlr-pagination-dashboard">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailOpen && selectedRequest && (
        <LeaveRequestDetailModal
          request={selectedRequest}
          canApprove={canApprove}
          onClose={() => setIsDetailOpen(false)}
          onAction={handleOpenAction}
        />
      )}

      {/* Action Modal */}
      {isActionOpen && selectedRequest && (
        <LeaveRequestActionModal
          request={selectedRequest}
          actionType={actionType}
          notes={actionNotes}
          onNotesChange={setActionNotes}
          onConfirm={handleConfirmAction}
          onCancel={() => setIsActionOpen(false)}
        />
      )}
    </div>
  );
}
