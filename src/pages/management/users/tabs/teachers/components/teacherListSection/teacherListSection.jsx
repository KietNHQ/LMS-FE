import React, { useState, useEffect, useRef } from "react";
import { FiEdit2, FiTrash2, FiEye, FiUserX, FiUserCheck, FiKey, FiMoreHorizontal, FiShield } from "react-icons/fi";
import "./teacherListSection.css";

function getAvatarLetter(name) {
	if (!name) return "G";
	return name.trim().charAt(0).toUpperCase();
}

export default function TeacherListSection({
	teachers,
	emptyMessage = "Không tìm thấy giáo viên phù hợp.",
	onSelectTeacher,
	onView,
	onEdit,
	onDelete,
    onResetPassword,
    onToggleStatus,
    selectedUserIds = [],
    onSelectRow,
    onSelectAll,
    currentUser,
}) {
    const isAllSelected = teachers.length > 0 && selectedUserIds.length === teachers.length;
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
		<section className="teacher-list-card">
			<div className="teacher-list-table-wrap">
				<table className="teacher-list-table">
					<thead>
						<tr>
                            <th className="teacher-checkbox-col">
                                <input 
                                    type="checkbox" 
                                    checked={isAllSelected}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                />
                            </th>
							<th>GIÁO VIÊN</th>
							<th>MÔN DẠY</th>
                            <th>LỚP CHỦ NHIỆM</th>
							<th>SĐT</th>
							<th>TRẠNG THÁI</th>
							<th className="teacher-actions-col">THAO TÁC</th>
						</tr>
					</thead>

					<tbody>
						{teachers.length === 0 ? (
							<tr>
								<td colSpan="7" className="teacher-empty-row">
									<div className="user-detail-empty">
										<FiShield size={42} strokeWidth={1.5} />
										<p>{emptyMessage}</p>
									</div>
								</td>
							</tr>
						) : (
							teachers.map((teacher, index) => {
                                const isMenuOpen = openMenuId === teacher.id;
                                const isSelected = selectedUserIds.includes(teacher.id);

                                return (
                                    <tr
                                        key={teacher.id}
                                        onClick={() => onView(teacher)}
                                        tabIndex={0}
                                        className={`${isSelected ? "is-selected" : ""} ${isMenuOpen ? "menu-open" : ""}`.trim()}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                onView(teacher);
                                            }
                                        }}
                                    >
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                onChange={() => onSelectRow(teacher.id)}
                                            />
                                        </td>
                                        <td>
                                            <div className="teacher-main-info">
                                                <div className="teacher-avatar">{getAvatarLetter(teacher.name)}</div>

                                                <div className="teacher-name-wrap">
                                                    <h4>{teacher.name || teacher.email?.split("@")[0] || "Chưa đặt tên"}</h4>
                                                    <p className="teacher-email-text">{teacher.email || "—"}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <span className="teacher-subject-badge">{teacher.subject || "—"}</span>
                                        </td>

                                        <td>
                                            <span className={`teacher-subject-badge ${teacher.homeroomClass ? '' : 'inactive'}`}>
                                                {teacher.homeroomClass || "Không có"}
                                            </span>
                                        </td>

                                        <td>{teacher.phone || "—"}</td>

                                        <td>
                                            <span
                                                className={`teacher-status-badge ${
                                                    teacher.status === "Hoạt động" ? "active" : "inactive"
                                                }`}
                                            >
                                                {teacher.status}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="teacher-row-actions" onClick={(e) => e.stopPropagation()}>
                                                <div className={`teacher-actions-dropdown ${isMenuOpen ? "is-open" : ""} ${index >= 4 ? "open-up" : ""}`} ref={isMenuOpen ? menuRef : null}>
                                                    <button className="teacher-actions-trigger" onClick={(e) => toggleMenu(e, teacher.id)}>
                                                        <FiMoreHorizontal />
                                                    </button>

                                                    {isMenuOpen && (
                                                        <div className="teacher-actions-menu">
                                                            <button className="teacher-menu-item" onClick={() => { onSelectTeacher(teacher); setOpenMenuId(null); }}>
                                                                <FiEye />
                                                                <span>Xem chi tiết</span>
                                                            </button>

                                                            <button className="teacher-menu-item edit" onClick={() => { onEdit(teacher); setOpenMenuId(null); }}>
                                                                <FiEdit2 />
                                                                <span>Chỉnh sửa</span>
                                                            </button>

                                                            <button 
                                                                className="teacher-menu-item status" 
                                                                onClick={() => { onToggleStatus(teacher); setOpenMenuId(null); }}
                                                                disabled={teacher.id === currentUser?.id}
                                                            >
                                                                {teacher.status === "Hoạt động" ? <FiUserX /> : <FiUserCheck />}
                                                                <span>{teacher.status === "Hoạt động" ? "Vô hiệu hóa" : "Kích hoạt"}</span>
                                                            </button>

                                                            {onResetPassword && (
                                                                <button className="teacher-menu-item reset" onClick={() => { onResetPassword(teacher); setOpenMenuId(null); }}>
                                                                    <FiKey />
                                                                    <span>Đặt lại mật khẩu</span>
                                                                </button>
                                                            )}

                                                            <button 
                                                                className="teacher-menu-item delete" 
                                                                onClick={() => { onDelete(teacher); setOpenMenuId(null); }}
                                                                disabled={teacher.id === currentUser?.id}
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


