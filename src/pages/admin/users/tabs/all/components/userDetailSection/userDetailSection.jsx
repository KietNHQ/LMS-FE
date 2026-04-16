import React from "react";
import { FiEdit2, FiTrash2, FiUserCheck, FiUserX } from "react-icons/fi";
import "./UserDetailSection.css";

function getRoleClass(role) {
    if (role === "Admin") return "admin";
    if (role === "Giáo viên") return "teacher";
    if (role === "Học sinh") return "student";
    if (role === "Phụ huynh") return "parent";
    return "parent";
}

function formatDate(dateString) {
    if (!dateString) return "—";
    const parts = dateString.split("-");
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
}

export default function UserDetailSection({
                                              users,
                                              emptyMessage = "Không có người dùng phù hợp.",
                                              onEdit,
                                              onToggleStatus,
                                              onDelete,
                                          }) {
    return (
        <div className="user-detail-section">
            <div className="user-detail-head">
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
                users.map((user) => (
                    <div
                        className={`user-detail-row ${
                            user.status === "Vô hiệu hóa" ? "is-inactive" : ""
                        }`.trim()}
                        key={user.id}
                    >
                        <div className="user-detail-user">
                            <div className={`user-detail-avatar ${user.color}`}>{user.avatar}</div>

                            <div className="user-detail-info">
                                <div className="user-detail-name">{user.name}</div>
                                <div className="user-detail-email">{user.email}</div>
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

                        <div className="user-detail-actions">
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
                                className="user-detail-action-btn delete"
                                onClick={() => onDelete(user.id)}
                                title="Xóa"
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}