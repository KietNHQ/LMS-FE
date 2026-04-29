import React from "react";
import { FiEdit2, FiTrash2, FiBarChart2, FiUserX, FiUserCheck, FiLock } from "react-icons/fi";
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
}) {
    const isAllSelected = teachers.length > 0 && selectedUserIds.length === teachers.length;
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
								<td colSpan="5" className="teacher-empty-row">
									{emptyMessage}
								</td>
							</tr>
						) : (
							teachers.map((teacher) => (
								<tr
									key={teacher.id}
									onClick={() => onView(teacher)}
									tabIndex={0}
                                    className={selectedUserIds.includes(teacher.id) ? "is-selected" : ""}
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
                                            checked={selectedUserIds.includes(teacher.id)}
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
											<button
												type="button"
												className="teacher-icon-btn details"
												onClick={() => onSelectTeacher(teacher)}
												aria-label="Chi tiết"
												title="Chi tiết"
											>
												<FiBarChart2 />
											</button>

											<button
												type="button"
												className="teacher-icon-btn edit"
												onClick={() => onEdit(teacher)}
												aria-label="Sửa"
												title="Sửa"
											>
												<FiEdit2 />
											</button>

											<button
												type="button"
												className="teacher-icon-btn block"
												onClick={() => onToggleStatus(teacher)}
												title={teacher.status === "Hoạt động" ? "Khóa" : "Mở khóa"}
											>
												{teacher.status === "Hoạt động" ? <FiUserX /> : <FiUserCheck />}
											</button>

											{onResetPassword && (
												<button
													type="button"
													className="teacher-icon-btn reset"
													onClick={() => onResetPassword(teacher)}
													title="Đặt lại mật khẩu"
												>
													<FiLock />
												</button>
											)}

											<button
												type="button"
												className="teacher-icon-btn delete"
												onClick={() => onDelete(teacher)}
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

