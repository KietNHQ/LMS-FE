import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader, SchoolYearTermSelector, Pagination } from "../../../../components/common";
import Select from "../../../../components/ui/Select/Select";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { adminApiService } from "../../../../services/pages/admin";
import { 
  FiSearch, FiActivity, FiShield, FiAlertOctagon, 
  FiUser, FiSlash, FiRefreshCw
} from "react-icons/fi";
import "./PrincipalAuditLogs.css";

const getRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.logs)) return payload.logs;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.logs)) return payload.data.logs;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const formatLabel = (value) => {
  const text = `${value || ""}`.trim();
  if (!text) return "Không xác định";
  return text.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatTimestamp = (value) => {
  if (!value) return { date: "Không ghi nhận", time: "" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: String(value), time: "" };
  return {
    date: date.toLocaleDateString("vi-VN"),
    time: date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
};

const normalizeLog = (row = {}) => {
  const action = `${row.action || row.operation || row.event || "UNKNOWN"}`.toUpperCase();
  const module = row.table_name || row.entity_type || row.module || row.resource || "Hệ thống";
  const actor = row.performed_by_name || row.user_name || row.actor || row.user_email || row.performed_by || "Không xác định";
  const user = row.performed_by || row.user || row.user_email || actor;
  const changedFields = Array.isArray(row.changed_fields) ? row.changed_fields.join(", ") : "";

  return {
    id: row.id || `${action}-${row.record_id || row.entity_id || row.performed_at || Math.random()}`,
    user,
    name: actor,
    role: row.role || row.user_role || row.performed_by_role || row.target_user_role || "System",
    action,
    module: formatLabel(module),
    details: row.description || row.details || changedFields || "Không có chi tiết thay đổi",
    timestamp: row.performed_at || row.timestamp || row.created_at || row.updated_at,
  };
};

const buildOptions = (rows, key, allLabel) => {
  const seen = new Set();
  const options = [{ value: "All", label: allLabel }];
  rows.forEach((row) => {
    const value = row[key];
    if (!value || seen.has(value)) return;
    seen.add(value);
    options.push({ value, label: formatLabel(value) });
  });
  return options;
};

export default function PrincipalAuditLogs() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterAction, setFilterAction] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminApiService.callByKey("get_audit_logs", {
        params: {
          limit: 200,
          schoolYearId: selectedSchoolYear?.id || selectedSchoolYear,
          semesterId: selectedTerm?.id || selectedTerm,
        },
      });
      setLogs(getRows(response).map(normalizeLog));
    } catch (error) {
      console.error("Failed to fetch principal audit logs:", error);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSchoolYear, selectedTerm]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const metrics = useMemo(() => {
    return {
      total: logs.length,
      critical: logs.filter(l => l.action === "DELETE").length,
      activeToday: new Set(logs.map(l => l.user)).size,
      updates: logs.filter(l => l.action === "UPDATE").length
    };
  }, [logs]);

  const roleOptions = useMemo(() => buildOptions(logs, "role", "Tất cả vai trò"), [logs]);
  const actionOptions = useMemo(() => buildOptions(logs, "action", "Tất cả hành động"), [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = 
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchRole = filterRole === "All" || log.role === filterRole;
      const matchAction = filterAction === "All" || log.action === filterAction;
      
      return matchSearch && matchRole && matchAction;
    });
  }, [logs, searchTerm, filterRole, filterAction]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const visibleLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const getActionClass = (action) => action?.toLowerCase() || "";
  const getRoleClass = (role) => role?.toLowerCase() || "";

  return (
    <div className="principal-audit-logs">
      <PageHeader
        title="Truy Xuất Nhật Ký"
        actions={
          <SchoolYearTermSelector
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            onTermChange={handleTermChange}
          />
        }
      />

      <div className="audit-hero-section">
        <div className="audit-metric-card">
          <div className="icon-label"><FiActivity /> Tổng hoạt động</div>
          <div className="value">{metrics.total}</div>
        </div>
        <div className="audit-metric-card critical">
          <div className="icon-label"><FiAlertOctagon /> Thao tác xóa</div>
          <div className="value">{metrics.critical}</div>
        </div>
        <div className="audit-metric-card">
          <div className="icon-label"><FiUser /> Nhân sự vận hành</div>
          <div className="value">{metrics.activeToday}</div>
        </div>
        <div className="audit-metric-card">
          <div className="icon-label"><FiShield /> Nhật ký cập nhật</div>
          <div className="value">{metrics.updates}</div>
        </div>
      </div>

      <div className="audit-toolbar-refined">
        <div className="search-box-wrapper">
          <FiSearch />
          <input 
            type="text" 
            placeholder="Tìm kiếm người thực hiện, phân hệ hoặc chi tiết..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="filters-row">
          <div className="filter-item">
            <Select 
              variant="custom"
              options={roleOptions}
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
              placeholder="Vai trò"
            />
          </div>
          <div className="filter-item">
            <Select 
              variant="custom"
              options={actionOptions}
              value={filterAction}
              onChange={(e) => { setFilterAction(e.target.value); setCurrentPage(1); }}
              placeholder="Hành động"
            />
          </div>
          <button type="button" className="audit-refresh-btn" onClick={fetchLogs} disabled={isLoading}>
            <FiRefreshCw /> Làm mới
          </button>
        </div>
      </div>

      <div className="audit-table-container">
        <div className="table-wrapper">
          {isLoading ? (
            <div className="empty-state">
              <FiRefreshCw />
              <p>Đang tải nhật ký từ hệ thống...</p>
            </div>
          ) : visibleLogs.length === 0 ? (
            <div className="empty-state">
              <FiSlash />
              <p>Không tìm thấy bản ghi nhật ký nào phù hợp.</p>
            </div>
          ) : (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Đối tượng thực hiện</th>
                  <th>Thao tác</th>
                  <th>Phân hệ</th>
                  <th>Chi tiết hoạt động</th>
                </tr>
              </thead>
              <tbody>
                {visibleLogs.map((log) => {
                  const { date, time } = formatTimestamp(log.timestamp);
                  return (
                    <tr key={log.id}>
                      <td>
                        <div className="time-cell">
                          <span className="date">{date}</span>
                          <span className="time">{time}</span>
                        </div>
                      </td>
                      <td>
                        <div className="operator-cell">
                          <span className="name">{log.name}</span>
                          <div className="id-role">
                            <span className="id">{log.user}</span>
                            <span className={`role-badge ${getRoleClass(log.role)}`}>
                              {log.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`action-badge ${getActionClass(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <span className="module-tag">{log.module}</span>
                      </td>
                      <td>
                        <div style={{ lineHeight: 1.5, color: '#334155', maxWidth: '350px' }}>
                          {log.details}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div style={{ padding: '0px 1.25rem 1.25rem' }}>
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
