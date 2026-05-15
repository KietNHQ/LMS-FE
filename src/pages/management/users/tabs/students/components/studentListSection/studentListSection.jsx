import React, { useState, useEffect, useRef } from "react";
import { FiEdit2, FiTrash2, FiUserX, FiUserCheck, FiKey, FiMoreHorizontal, FiEye, FiShield } from "react-icons/fi";
import "./studentListSection.css";

function getAvatarLetter(name) {
    if (!name) return "S";
    return name.trim().charAt(0).toUpperCase();
}

function formatDate(dateString) {
    if (!dateString) return "—";
    const cleanDate = dateString.slice(0, 10);
    const parts = cleanDate.split("-");
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return cleanDate;
}

const getStatusClass = (status) => {
    switch (status) {
        case "Đang học": return "status-active";
        case "Đình chỉ": return "status-suspended";
        case "Bảo lưu": return "status-reserved";
        case "Đã tốt nghiệp": return "status-graduated";
        default: return "";
    }
};

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
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = (e, userId) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === userId ? null : userId);
    };

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
                            <th>LỚP</th>
                            <th>PHÁI</th>
                            <th>NGÀY SINH</th>
                            <th>PHỤ HUYNH</th>
                            <th>TRẠNG THÁI</th>
                            <th className="student-actions-col">THAO TÁC</th>
                        </tr>
                    </thead>

                    <tbody>
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="student-empty-row">
                                    <div className="user-detail-empty">
                                        <FiShield size={42} strokeWidth={1.5} />
                                        <p>{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            students.map((student, index) => {
                                const isMenuOpen = openMenuId === student.id;
                                const isSelected = selectedUserIds.includes(student.id);

                                return (
                                    <tr
                                        key={student.id}
                                        onClick={() => onSelectStudent(student)}
                                        className={`${isSelected ? "is-selected" : ""} ${isMenuOpen ? "menu-open" : ""}`.trim()}
                                    >
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => onSelectRow(student.id)}
                                            />
                                        </td>
                                        <td>
                                            <div className="student-main-info">
                                                <div className="student-avatar">{getAvatarLetter(student.name)}</div>
                                                <div className="student-name-wrap">
                                                    <h4>{student.name || student.email?.split("@")[0]}</h4>
                                                    <p className="student-email-text">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="student-class-badge">{student.className || "—"}</span>
                                        </td>
                                        <td>{student.gender || "—"}</td>
                                        <td>
                                            <span className="student-dob-text">{formatDate(student.dob)}</span>
                                        </td>
                                        <td>
                                            <div className="student-parent-wrap">
                                                <h5>{student.parentName || "—"}</h5>
                                                <span>{student.parentPhone || "—"}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`student-status-badge ${getStatusClass(student.status)}`}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="student-row-actions" onClick={(e) => e.stopPropagation()}>
                                                <div className={`student-actions-dropdown ${isMenuOpen ? "is-open" : ""} ${index >= 4 ? "open-up" : ""}`} ref={isMenuOpen ? menuRef : null}>
                                                    <button className="student-actions-trigger" onClick={(e) => toggleMenu(e, student.id)}>
                                                        <FiMoreHorizontal />
                                                    </button>

                                                    {isMenuOpen && (
                                                        <div className="student-actions-menu">
                                                            <button className="student-menu-item" onClick={() => { onSelectStudent(student); setOpenMenuId(null); }}>
                                                                <FiEye />
                                                                <span>Xem chi tiết</span>
                                                            </button>
                                                            <button className="student-menu-item" onClick={() => { onEdit(student); setOpenMenuId(null); }}>
                                                                <FiEdit2 />
                                                                <span>Chỉnh sửa</span>
                                                            </button>

                                                            <button 
                                                                className="student-menu-item status" 
                                                                onClick={() => { onToggleStatus(student); setOpenMenuId(null); }}
                                                            >
                                                                {student.status === "Đang học" ? <FiUserX /> : <FiUserCheck />}
                                                                <span>{student.status === "Đang học" ? "Vô hiệu hóa" : "Kích hoạt"}</span>
                                                            </button>

                                                            {onResetPassword && (
                                                                <button className="student-menu-item reset" onClick={() => { onResetPassword(student); setOpenMenuId(null); }}>
                                                                    <FiKey />
                                                                    <span>Đặt lại mật khẩu</span>
                                                                </button>
                                                            )}

                                                            <button 
                                                                className="student-menu-item delete" 
                                                                onClick={() => { onDelete(student); setOpenMenuId(null); }}
                                                            >
                                                                <FiTrash2 />
                                                                <span>Xóa tài khoản</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
