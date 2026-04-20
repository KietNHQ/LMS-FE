import { useState, useMemo } from "react";
import { PageHeader, SchoolYearTermSelector, Pagination } from "../../../components/common";
import Select from "../../../components/ui/Select/Select";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { 
  FiSearch, FiActivity, FiShield, FiAlertOctagon, 
  FiClock, FiUser, FiInfo, FiSlash 
} from "react-icons/fi";
import "./PrincipalAuditLogs.css";

const MOCK_LOGS = [
  { id: "LOG01", user: "GV_Toan_01", name: "Nguyễn Văn A", role: "Teacher", action: "UPDATE", module: "Quản lý điểm", details: "Sửa điểm 15p môn Toán lớp 10A1 (Kỳ 1)", timestamp: "15/10/2026 14:30:00" },
  { id: "LOG02", user: "SA_Admin", name: "Trần Quản Trị", role: "Admin", action: "CREATE", module: "Người Dùng", details: "Tạo mới tài khoản Giáo viên bộ môn (Lý - Tổ Tự Nhiên)", timestamp: "15/10/2026 09:15:00" },
  { id: "LOG03", user: "admin_truong", name: "Hiệu Trưởng", role: "Admin", action: "DELETE", module: "Phê duyệt", details: "Từ chối đề xuất ngân sách Hoạt động hè", timestamp: "15/10/2026 09:10:00" },
  { id: "LOG04", user: "KT_Ngoc_01", name: "Lê Ngọc", role: "Admin", action: "CREATE", module: "Tài chính", details: "Lập hóa đơn học phí khối 10 tháng 10", timestamp: "14/10/2026 16:45:00" },
  { id: "LOG05", user: "GV_Van_02", name: "Bùi Thị B", role: "Teacher", action: "UPDATE", module: "Nề nếp", details: "Cập nhật vi phạm HS lớp 11A2", timestamp: "14/10/2026 10:20:00" },
  { id: "LOG06", user: "admin_truong", name: "Hiệu Trưởng", role: "Admin", action: "UPDATE", module: "Cấu hình", details: "Thay đổi thời gian ca học buổi chiều", timestamp: "14/10/2026 08:30:00" },
  { id: "LOG07", user: "KT_Ngoc_01", name: "Lê Ngọc", role: "Admin", action: "UPDATE", module: "Tài chính", details: "Nghị quyết thu học phí bổ sung kỳ 1", timestamp: "13/10/2026 15:20:00" },
  { id: "LOG08", user: "GV_Toan_01", name: "Nguyễn Văn A", role: "Teacher", action: "LOGIN", module: "Hệ thống", details: "Đăng nhập thành công từ địa chỉ IP 14.232.x.x", timestamp: "13/10/2026 07:10:00" },
];

const ROLE_OPTIONS = [
  { value: "All", label: "Tất cả vai trò" },
  { value: "Admin", label: "Quản trị / Hiệu trưởng" },
  { value: "Teacher", label: "Giáo viên" },
  { value: "Student", label: "Học sinh / Phụ huynh" },
];

const ACTION_OPTIONS = [
  { value: "All", label: "Tất cả hành động" },
  { value: "CREATE", label: "Thêm mới (Create)" },
  { value: "UPDATE", label: "Cập nhật (Update)" },
  { value: "DELETE", label: "Xóa dữ liệu (Delete)" },
  { value: "LOGIN", label: "Đăng nhập (System)" },
];

export default function PrincipalAuditLogs() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterAction, setFilterAction] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const metrics = useMemo(() => {
    return {
      total: MOCK_LOGS.length,
      critical: MOCK_LOGS.filter(l => l.action === "DELETE").length,
      activeToday: new Set(MOCK_LOGS.map(l => l.user)).size,
      updates: MOCK_LOGS.filter(l => l.action === "UPDATE").length
    };
  }, []);

  const filteredLogs = useMemo(() => {
    return MOCK_LOGS.filter(log => {
      const matchSearch = 
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchRole = filterRole === "All" || log.role === filterRole;
      const matchAction = filterAction === "All" || log.action === filterAction;
      
      return matchSearch && matchRole && matchAction;
    });
  }, [searchTerm, filterRole, filterAction]);

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
              options={ROLE_OPTIONS}
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
              placeholder="Vai trò"
            />
          </div>
          <div className="filter-item">
            <Select 
              variant="custom"
              options={ACTION_OPTIONS}
              value={filterAction}
              onChange={(e) => { setFilterAction(e.target.value); setCurrentPage(1); }}
              placeholder="Hành động"
            />
          </div>
        </div>
      </div>

      <div className="audit-table-container">
        <div className="table-wrapper">
          {visibleLogs.length === 0 ? (
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
                  const [date, time] = log.timestamp.split(" ");
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
