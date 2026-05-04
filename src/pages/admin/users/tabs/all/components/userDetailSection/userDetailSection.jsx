import React, { useState, useEffect, useRef } from "react";
import { FiEdit2, FiTrash2, FiUserCheck, FiUserX, FiKey, FiMoreHorizontal } from "react-icons/fi";
import { PERMISSIONS } from "../../../../../../../config/permissions";
import "./UserDetailSection.css";

function getRoleClass(role) {
    if (role === "Quản lý" || role === "Quản trị viên") return "admin";
    if (role === "Giáo viên") return "teacher";
    if (role === "Học sinh") return "student";
    if (role === "Phụ huynh") return "parent";
    return "parent";
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

export default function UserDetailSection({
                                               users,
                                               selectedUserIds = [],
                                               onSelectAll,
                                               onSelectRow,
                                               emptyMessage = "Không có người dùng phù hợp.",
                                               onView,
                                               onEdit,
                                               onToggleStatus,
                                               onDelete,
                                               onResetPassword,
                                               currentUser,
                                               hasPermission,
                                           }) {
    const isAllSelected = users.length > 0 && selectedUserIds.length === users.length;
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
        <div className="user-detail-section">
            <div className="user-detail-head">
                <div className="user-detail-checkbox-col">
                    <input
                        type="checkbox"
                        className="user-detail-checkbox"
                        checked={isAllSelected}
                        onChange={(e) => onSelectAll(e.target.checked)}
                    />
                </div>
                <span>Người dùng</span>
                <span>Vai trò</span>
                <span>Điện thoại</span>
                <span>Trạng thái</span>
                <span>Ngày sinh</span>
                <span>Thao tác</span>
            </div>

            {users.length === 0 ? (
                <div className="user-detail-empty">{emptyMessage}</div>
            ) : (
                users.map((user) => {
                    const isSelected = selectedUserIds.includes(user.id);
                    const isMenuOpen = openMenuId === user.id;
                    const isDisabled = user.id === currentUser?.id || user.role === 'Quản trị viên' || user.role === 'admin';

                    return (
                        <div
                            className={`user-detail-row ${
                                user.status === "Vô hiệu hóa" ? "is-inactive" : ""
                            } ${isSelected ? "is-selected" : ""}`.trim()}
                            key={user.id}
                            onClick={() => onView && onView(user)}
                        >
                            <div className="user-detail-checkbox-col" onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    className="user-detail-checkbox"
                                    checked={isSelected}
                                    onChange={() => onSelectRow(user.id)}
                                />
                            </div>
                            <div className="user-detail-user">
                                <div className={`user-detail-avatar ${user.color}`}>{user.avatar}</div>

                                <div className="user-detail-info">
                                    <div className="user-detail-name">{user.name}</div>
                                    <div className="user-detail-email">{user.email?.split('@')[0]}</div>
                                </div>
                            </div>

                            <div className="user-detail-role-group">
                                <span className={`user-role-chip ${getRoleClass(user.role)}`}>
                                    {user.role}
                                </span>
                            </div>

                            <div className="user-detail-phone">{user.phone}</div>

                            <div>
                                <span className={`user-status-chip ${user.status === "Hoạt động" ? "active" : "inactive"}`}>
                                    {user.status}
                                </span>
                            </div>

                            <div className="user-detail-date">{formatDate(user.dob)}</div>

                            <div className="user-detail-actions" onClick={(e) => e.stopPropagation()}>
                                <div className={`user-actions-dropdown ${isMenuOpen ? "is-open" : ""}`} ref={isMenuOpen ? menuRef : null}>
                                    <button className="user-actions-trigger" onClick={(e) => toggleMenu(e, user.id)}>
                                        <FiMoreHorizontal />
                                    </button>
                                    
                                    {isMenuOpen && (
                                        <div className="user-actions-menu">
                                            <button className="user-menu-item edit" onClick={() => { onEdit(user); setOpenMenuId(null); }}>
                                                <FiEdit2 />
                                                <span>Chỉnh sửa</span>
                                            </button>
                                            
                                            <button 
                                                className="user-menu-item status" 
                                                onClick={() => { onToggleStatus(user); setOpenMenuId(null); }}
                                                disabled={isDisabled}
                                            >
                                                {user.status === "Hoạt động" ? <FiUserX /> : <FiUserCheck />}
                                                <span>{user.status === "Hoạt động" ? "Vô hiệu hóa" : "Kích hoạt"}</span>
                                            </button>

                                            <button className="user-menu-item reset" onClick={() => { onResetPassword(user); setOpenMenuId(null); }}>
                                                <FiKey />
                                                <span>Đặt lại mật khẩu</span>
                                            </button>

                                            <button 
                                                className="user-menu-item delete" 
                                                onClick={() => { onDelete(user.id); setOpenMenuId(null); }}
                                                disabled={isDisabled}
                                            >
                                                <FiTrash2 />
                                                <span>Xóa tài khoản</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}