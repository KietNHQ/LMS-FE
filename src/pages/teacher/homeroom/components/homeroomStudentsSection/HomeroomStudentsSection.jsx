import { useMemo, useState } from "react";
import { FiEdit2, FiUserPlus, FiUsers } from "react-icons/fi";
import HomeroomStudentDetailDialog from "./HomeroomStudentDetailDialog";
import "./HomeroomStudentsSection.css";

function formatDate(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function getAvatarLetter(name) {
    if (!name) return "A";
    return name.trim().charAt(0).toUpperCase();
}

function getRoleClass(roleKey) {
    switch (roleKey) {
        case "monitor": return "role-monitor";
        case "viceMonitor": return "role-vice";
        case "secretary": return "role-secretary";
        default: return "role-empty";
    }
}

export default function HomeroomStudentsSection({
    students = [],
    officers = [],
    onUpdateStudent,
    onAssignOfficer,
    onBanCanSuLopClick,
}) {
    const [activeStudentId, setActiveStudentId] = useState(null);
    const [dialogMode, setDialogMode] = useState("view");

    const activeStudent = useMemo(
        () => students.find((student) => student.id === activeStudentId) || null,
        [students, activeStudentId]
    );

    const officerLabelByStudentId = useMemo(() => {
        return officers.reduce((acc, officer) => {
            if (officer.studentId) acc[officer.studentId] = officer.label;
            return acc;
        }, {});
    }, [officers]);

    const openStudentDialog = (student, mode = "view") => {
        setActiveStudentId(student.id);
        setDialogMode(mode);
    };

    const closeStudentDialog = () => {
        setActiveStudentId(null);
        setDialogMode("view");
    };

    const handleSaveStudent = (studentId, payload) => {
        const saved = onUpdateStudent?.(studentId, payload);
        if (saved) {
            setDialogMode("view");
        }
    };

    const handleAssignOfficer = (studentId, roleKey) => {
        const assigned = onAssignOfficer?.(studentId, roleKey);
        if (assigned) {
            setDialogMode("view");
        }
    };

    return (
        <div className="homeroom-students-section homeroom-students-list-card">
            <div className="homeroom-students-list-header">
                <div>
                    <span className="homeroom-students-list-kicker">
                        <FiUsers />
                        <span>Danh sách học sinh</span>
                    </span>
                    <h2>Quản lý học sinh lớp chủ nhiệm</h2>
                    <p>Click vào từng thẻ để xem chi tiết. Phần thao tác chỉ cho phép chỉnh sửa và cấp quyền ban cán sự cho học sinh đó.</p>
                </div>
                <button
                    type="button"
                    className="homeroom-students-list-badge"
                    onClick={() => onBanCanSuLopClick?.()}
                >
                    <FiUserPlus />
                    <span>Ban cán sự lớp</span>
                </button>
            </div>

            <div className="homeroom-students-table-wrap">
                <table className="homeroom-students-table">
                    <thead>
                        <tr>
                            <th>HỌC SINH</th>
                            <th>GIỚI TÍNH</th>
                            <th>NGÀY SINH</th>
                            <th>PHỤ HUYNH</th>
                            <th>SĐT PHỤ HUYNH</th>
                            <th>VAI TRÒ</th>
                            <th>THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="homeroom-students-empty-row">Không có dữ liệu học sinh.</td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr
                                    key={student.id}
                                    className="homeroom-students-row"
                                    onClick={() => openStudentDialog(student, "view")}
                                >
                                    <td>
                                        <div className="homeroom-students-main-info">
                                            <div className="homeroom-students-avatar">{getAvatarLetter(student.name)}</div>
                                            <div className="homeroom-students-name-wrap">
                                                <h4>{student.name}</h4>
                                                <p>{student.email || "—"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="homeroom-students-muted">{student.gender || "—"}</span>
                                    </td>
                                    <td>
                                        <span className="homeroom-students-muted">{formatDate(student.dob)}</span>
                                    </td>
                                    <td>
                                        <div className="homeroom-students-parent-wrap">
                                            <h5>{student.parentName || "—"}</h5>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="homeroom-students-muted">{student.parentPhone || "—"}</span>
                                    </td>
                                    <td>
                                        <span className={`homeroom-students-role-badge ${getRoleClass(student.officerRole)}`}>
                                            {officerLabelByStudentId[student.id] || "Chưa phân công"}
                                        </span>
                                    </td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div className="homeroom-students-row-actions">
                                            <button
                                                type="button"
                                                className="homeroom-students-icon-btn"
                                                onClick={() => openStudentDialog(student, "edit")}
                                                title="Chỉnh sửa"
                                                aria-label="Chỉnh sửa"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                type="button"
                                                className="homeroom-students-icon-btn primary"
                                                onClick={() => openStudentDialog(student, "view")}
                                                title="Cấp quyền"
                                                aria-label="Cấp quyền"
                                            >
                                                <FiUserPlus />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <HomeroomStudentDetailDialog
                open={Boolean(activeStudent)}
                mode={dialogMode}
                student={activeStudent}
                officerRows={officers}
                onClose={closeStudentDialog}
                onEdit={(student) => {
                    if (!student) return;
                    setDialogMode("edit");
                }}
                onSave={handleSaveStudent}
                onAssignOfficer={handleAssignOfficer}
            />
        </div>
    );
}


