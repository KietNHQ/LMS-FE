import React, { useState, useEffect, useRef } from "react";
import { FiEdit2, FiTrash2, FiUserX, FiUserCheck, FiKey, FiMoreHorizontal } from "react-icons/fi";
import "./parentListSection.css";

function getAvatarLetter(name) {
	if (!name) return "P";
	return name.trim().charAt(0).toUpperCase();
}

export default function ParentListSection({
	parents,
	emptyMessage = "Không có phụ huynh nào phù hợp.",
	onView,
	onEdit,
	onDelete,
    onResetPassword,
    onToggleStatus,
    selectedUserIds = [],
    onSelectRow,
    onSelectAll,
}) {
    const isAllSelected = parents.length > 0 && selectedUserIds.length === parents.length;
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
		<section className="parent-list-card">
			<div className="parent-list-table-wrap">
				<table className="parent-list-table">
					<thead>
						<tr>
                            <th className="parent-checkbox-col">
                                <input 
                                    type="checkbox" 
                                    checked={isAllSelected}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                />
                            </th>
							<th>PHỤ HUYNH</th>
							<th>SỐ ĐIỆN THOẠI</th>
							<th>HỌC SINH LIÊN KẾT</th>
							<th>TRẠNG THÁI</th>
							<th className="parent-actions-col">THAO TÁC</th>
						</tr>
					</thead>

					<tbody>
						{parents.length === 0 ? (
							<tr>
								<td colSpan="6" className="parent-empty-row">
									{emptyMessage}
								</td>
							</tr>
						) : (
							parents.map((parent, index) => {
                                const isMenuOpen = openMenuId === parent.id;
                                const isSelected = selectedUserIds.includes(parent.id);
                                const displayName = parent.name || parent.email?.split("@")[0] || "Phụ huynh";

                                return (
                                    <tr
                                        key={parent.id}
                                        onClick={() => onView(parent)}
                                        className={`${isSelected ? "is-selected" : ""} ${isMenuOpen ? "menu-open" : ""}`.trim()}
                                    >
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                onChange={() => onSelectRow(parent.id)}
                                            />
                                        </td>
                                        <td>
                                            <div className="parent-main-info">
                                                <div className="parent-avatar">{getAvatarLetter(displayName)}</div>
                                                <div className="parent-name-wrap">
                                                    <h4>{displayName}</h4>
                                                    <p className="parent-email-text">{parent.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td>{parent.phone || "—"}</td>

                                        <td>
                                            <div className="parent-children-badges">
                                                {(parent.profile?.children || []).length > 0 ? (
                                                    parent.profile.children.map((child, idx) => (
                                                        <span key={idx} className="child-badge">
                                                            {child.childName} ({child.childClass})
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="child-badge graduated">Chưa liên kết</span>
                                                )}
                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className={`parent-status-chip ${
                                                    parent.status === "Hoạt động" ? "active" : "inactive"
                                                }`}
                                            >
                                                {parent.status}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="parent-row-actions" onClick={(e) => e.stopPropagation()}>
                                                <div className={`parent-actions-dropdown ${isMenuOpen ? "is-open" : ""} ${index >= 4 ? "open-up" : ""}`} ref={isMenuOpen ? menuRef : null}>
                                                    <button className="parent-actions-trigger" onClick={(e) => toggleMenu(e, parent.id)}>
                                                        <FiMoreHorizontal />
                                                    </button>

                                                    {isMenuOpen && (
                                                        <div className="parent-actions-menu">
                                                            <button className="parent-menu-item" onClick={() => { onEdit(parent); setOpenMenuId(null); }}>
                                                                <FiEdit2 />
                                                                <span>Chỉnh sửa</span>
                                                            </button>

                                                            <button 
                                                                className="parent-menu-item status" 
                                                                onClick={() => { onToggleStatus(parent); setOpenMenuId(null); }}
                                                            >
                                                                {parent.status === "Hoạt động" ? <FiUserX /> : <FiUserCheck />}
                                                                <span>{parent.status === "Hoạt động" ? "Khóa" : "Mở khóa"}</span>
                                                            </button>

                                                            {onResetPassword && (
                                                                <button className="parent-menu-item reset" onClick={() => { onResetPassword(parent); setOpenMenuId(null); }}>
                                                                    <FiKey />
                                                                    <span>Đặt lại mật khẩu</span>
                                                                </button>
                                                            )}

                                                            <button 
                                                                className="parent-menu-item delete" 
                                                                onClick={() => { onDelete(parent); setOpenMenuId(null); }}
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
