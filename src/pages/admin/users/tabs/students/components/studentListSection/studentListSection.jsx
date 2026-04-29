import React from "react";
import { FiEdit2, FiTrash2, FiUserX, FiUserCheck, FiLock } from "react-icons/fi";
import "./studentListSection.css";

function formatDate(dateString) {
    if (!dateString) return "—";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            // Fallback for YYYY-MM-DD
            const parts = dateString.split("-");
            if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
            return dateString;
        }
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return dateString;
    }
}

function getAvatarLetter(name) {
    if (!name) return "A";
    return name.trim().charAt(0).toUpperCase();
}

function getStatusClass(status) {
    switch (status) {
        case "Đang học": return "status-active";
        case "Đình chỉ": return "status-suspended";
        case "Bảo lưu": return "status-reserved";
        case "Đã tốt nghiệp": return "status-graduated";
        default: return "status-active";
    }
}

export default function StudentListSection({
    students,
    emptyMessage = "Không tìm thấy học sinh phù hợp.",
    onSelectStudent,
    onEdit,
    onDelete,
    onResetPassword,
    onToggleStatus,
    selectedUserIds = [],
    onSelectRow,
    onSelectAll,
}) {
    const isAllSelected = students.length > 0 && selectedUserIds.length === students.length;
    return (
        <section className="student-list-card">
            <div className="student-list-table-wrap">
                <table className="student-list-table">
                    <thead>
                        <tr>
                            <th className="student-checkbox-col">
                                <input 
                                    type="checkbox" 
                                    checked={isAllSelected}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                />
                            </th>
                            <th>HỌC SINH</th>
                            <th>NGÀY SINH</th>
                            <th>LỚP</th>
                            <th>GVCN</th>
                            <th>PHỤ HUYNH</th>
                            <th>TRẠNG THÁI</th>
                            <th className="student-actions-col">THAO TÁC</th>
                        </tr>
                    </thead>

                    <tbody>
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="student-empty-row">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr
                                    key={student.id}
                                    onClick={() => onSelectStudent(student)}
                                    tabIndex={0}
                                    className={selectedUserIds.includes(student.id) ? "is-selected" : ""}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            onSelectStudent(student);
                                        }
                                    }}
                                >
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedUserIds.includes(student.id)}
                                            onChange={() => onSelectRow(student.id)}
                                        />
                                    </td>
                                    <td>
                                        <div className="student-main-info">
                                            <div className="student-avatar">
                                                {getAvatarLetter(student.name)}
                                            </div>

                                            <div className="student-name-wrap">
                                                <h4>{student.name}</h4>
                                                <p className="student-email-text">{student.email?.replace("thptlocal.edu.vn", "") || "—"}</p>
                                                <div className="student-dob-gender">
                                                    Giới tính: {student.gender || "Nam"}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <span className="student-dob-text">{formatDate(student.dob)}</span>
                                    </td>

                                    <td>
                                        <span className="student-class-badge">{student.className}</span>
                                    </td>

                                    <td>
                                        <span className="student-teacher-text">{student.teacher}</span>
                                    </td>

                                    <td>
                                        <div className="student-parent-wrap">
                                            <h5>{student.parentName}</h5>
                                            <span>{student.parentPhone}</span>
                                        </div>
                                    </td>

                                    <td>
                                        <span className={`student-status-badge ${getStatusClass(student.status)}`}>{student.status}</span>
                                    </td>

                                    <td>
                                        <div className="student-row-actions" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                type="button"
                                                className="student-icon-btn edit"
                                                onClick={() => onEdit(student)}
                                                aria-label="Sửa"
                                                title="Sửa"
                                            >
                                                <FiEdit2 />
                                            </button>

                                            <button
                                                type="button"
                                                className="student-icon-btn block"
                                                onClick={() => onToggleStatus(student)}
                                                title={student.status === "Đang học" ? "Đình chỉ" : "Kích hoạt"}
                                            >
                                                {student.status === "Đang học" ? <FiUserX /> : <FiUserCheck />}
                                            </button>

                                            {onResetPassword && (
                                                <button
                                                    type="button"
                                                    className="student-icon-btn reset"
                                                    onClick={() => onResetPassword(student)}
                                                    title="Đặt lại mật khẩu"
                                                >
                                                    <FiLock />
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                className="student-icon-btn delete"
                                                onClick={() => onDelete(student)}
                                                aria-label="Xóa"
                                                title="Xóa"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}