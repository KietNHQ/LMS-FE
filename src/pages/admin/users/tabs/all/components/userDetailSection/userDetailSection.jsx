import React from "react";
import { FiEdit2, FiTrash2, FiUserCheck, FiUserX, FiKey } from "react-icons/fi";
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
    // Extract YYYY-MM-DD part if it's an ISO string or similar
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
                                           }) {
    const isAllSelected = users.length > 0 && selectedUserIds.length === users.length;

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
                                    <div className="user-detail-email">{user.email?.replace("thptlocal.edu.vn", "")}</div>
                                </div>
                            </div>

                            <div>
                  <span className={`user-role-chip ${getRoleClass(user.role)}`}>
                    {user.role}
                  </span>
                            </div>

                            <div className="user-detail-phone">{user.phone}</div>

                            <div>
                  <span
                      className={`user-status-chip ${
                          user.status === "Hoạt động" ? "active" : "inactive"
                      }`}
                  >
                    {user.status}
                  </span>
                            </div>

                            <div className="user-detail-date">{formatDate(user.dob)}</div>

                            <div className="user-detail-actions" onClick={(e) => e.stopPropagation()}>
                                <button
                                    className="user-detail-action-btn edit"
                                    onClick={() => onEdit(user)}
                                    title="Chỉnh sửa"
                                >
                                    <FiEdit2 />
                                </button>

                                <button
                                    className="user-detail-action-btn status"
                                    onClick={() => onToggleStatus(user)}
                                    title="Khóa / mở"
                                >
                                    {user.status === "Hoạt động" ? <FiUserX /> : <FiUserCheck />}
                                </button>

                                <button
                                    className="user-detail-action-btn reset"
                                    onClick={() => onResetPassword(user)}
                                    title="Đặt lại mật khẩu"
                                >
                                    <FiKey />
                                </button>

                                {onDelete && (
                                    <button
                                        className="user-detail-action-btn delete"
                                        onClick={() => onDelete(user.id)}
                                        title="Xóa"
                                    >
                                        <FiTrash2 />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}