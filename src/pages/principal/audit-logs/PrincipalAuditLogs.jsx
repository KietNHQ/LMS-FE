import { useState, useMemo } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiSearch, FiFilter, FiActivity } from "react-icons/fi";
import "./PrincipalAuditLogs.css";

const MOCK_LOGS = [
    { id: "LOG01", user: "GV_Toan_01", name: "Nguyễn Văn A", role: "Teacher", action: "UPDATE", module: "Quản lý điểm", details: "Sửa điểm 15p môn Toán lớp 10A1 (Kỳ 1)", timestamp: "15/10/2026 14:30:00" },
    { id: "LOG02", user: "SA_Admin", name: "Trần Quản Trị", role: "Admin", action: "CREATE", module: "Người Dùng", details: "Tạo mới tài khoản Giáo viên bộ môn (Lý - Tổ Tự Nhiên)", timestamp: "15/10/2026 09:15:00" },
    { id: "LOG03", user: "admin_truong", name: "Hiệu Trưởng", role: "Admin", action: "DELETE", module: "Phê duyệt", details: "Từ chối đề xuất ngân sách Hoạt động hè", timestamp: "15/10/2026 09:10:00" },
    { id: "LOG04", user: "KT_Ngoc_01", name: "Lê Ngọc", role: "Admin", action: "CREATE", module: "Tài chính", details: "Lập hóa đơn học phí khối 10 tháng 10", timestamp: "14/10/2026 16:45:00" },
    { id: "LOG05", user: "GV_Van_02", name: "Bùi Thị B", role: "Teacher", action: "UPDATE", module: "Nề nếp", details: "Cập nhật vi phạm HS lớp 11A2", timestamp: "14/10/2026 10:20:00" },
];

export default function PrincipalAuditLogs() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("All");
    const [filterAction, setFilterAction] = useState("All");

    const filteredLogs = useMemo(() => {
        return MOCK_LOGS.filter(log => {
            const matchSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                log.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchRole = filterRole === "All" || log.role === filterRole;
            const matchAction = filterAction === "All" || log.action === filterAction;
            
            return matchSearch && matchRole && matchAction;
        });
    }, [searchTerm, filterRole, filterAction]);

    return (
        <div className="principal-audit-logs">
            <PageHeader
                title="Truy Xuất Nhật Ký (Audit Logs)"
                eyebrow="Giám sát mọi thao tác quan trọng diễn ra trên hệ thống LMS toàn trường"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="audit-logs-container">
                <div className="audit-logs-toolbar">
                    <div style={{position: 'relative', flex: 1}}>
                        <FiSearch style={{position: 'absolute', top: '1rem', left: '1rem', color: '#94a3b8'}} />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm người dùng, module hoặc chi tiết hành động..." 
                            className="audit-search-input"
                            style={{paddingLeft: '2.5rem'}}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="audit-filter-select"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                    >
                        <option value="All">Phân loại Vai trò</option>
                        <option value="Admin">Hiệu Trưởng / Admin</option>
                        <option value="Teacher">Giáo Viên</option>
                        <option value="Student">Học Sinh / Phụ Huynh</option>
                    </select>
                    <select 
                        className="audit-filter-select"
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                    >
                        <option value="All">Loại Hành động</option>
                        <option value="CREATE">Tạo mới (Create)</option>
                        <option value="UPDATE">Cập nhật (Update)</option>
                        <option value="DELETE">Xóa (Delete)</option>
                        <option value="LOGIN">Hệ thống (System)</option>
                    </select>
                </div>

                <div className="audit-table-wrapper">
                    <table className="audit-table">
                        <thead>
                            <tr>
                                <th><FiActivity size={12}/> Thời gian</th>
                                <th>Đối tượng thực hiện</th>
                                <th>Thao tác</th>
                                <th>Phân hệ</th>
                                <th>Chi tiết hoạt động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="log-time">{log.timestamp}</td>
                                        <td>
                                            <div style={{fontWeight: 700}}>{log.user}</div>
                                            <div style={{fontSize: '0.8rem', color: '#64748b'}}>{log.name}</div>
                                            <span className={`log-role ${log.role}`}>{log.role}</span>
                                        </td>
                                        <td><span className={`log-action ${log.action}`}>{log.action}</span></td>
                                        <td><strong>{log.module}</strong></td>
                                        <td style={{lineHeight: 1.4, maxWidth: '300px'}}>{log.details}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{textAlign: 'center', color: '#94a3b8', padding: '3rem'}}>Không tìm thấy bản ghi nhật ký phù hợp với bộ lọc.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
