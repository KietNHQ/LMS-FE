import React from "react";
import { FiEdit2, FiEye, FiTrash2 } from "react-icons/fi";
import "./teacherListSection.css";

function getAvatarLetter(name) {
	if (!name) return "G";
	return name.trim().charAt(0).toUpperCase();
}

export default function TeacherListSection({
	teachers,
	selectedTeacherId,
	onSelectTeacher,
	onView,
	onEdit,
	onDelete,
}) {
	return (
		<section className="teacher-list-card">
			<div className="teacher-list-table-wrap">
				<table className="teacher-list-table">
					<thead>
						<tr>
							<th>GIÁO VIÊN</th>
							<th>MÔN DẠY</th>
							<th>SĐT</th>
							<th>TRẠNG THÁI</th>
							<th className="teacher-actions-col">THAO TÁC</th>
						</tr>
					</thead>

					<tbody>
						{teachers.length === 0 ? (
							<tr>
								<td colSpan="5" className="teacher-empty-row">
									Không tìm thấy giáo viên phù hợp.
								</td>
							</tr>
						) : (
							teachers.map((teacher) => (
								<tr
									key={teacher.id}
									className={selectedTeacherId === teacher.id ? "is-selected" : ""}
									onClick={() => onSelectTeacher(teacher.id)}
								>
									<td>
										<div className="teacher-main-info">
											<div className="teacher-avatar">{getAvatarLetter(teacher.name)}</div>

											<div className="teacher-name-wrap">
												<h4>{teacher.name}</h4>
												<p>{teacher.email}</p>
											</div>
										</div>
									</td>

									<td>
										<span className="teacher-subject-badge">{teacher.subject || "—"}</span>
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
												className="teacher-icon-btn"
												onClick={() => onView(teacher)}
												aria-label="Xem"
												title="Xem"
											>
												<FiEye />
											</button>

											<button
												type="button"
												className="teacher-icon-btn"
												onClick={() => onEdit(teacher)}
												aria-label="Sửa"
												title="Sửa"
											>
												<FiEdit2 />
											</button>

											<button
												type="button"
												className="teacher-icon-btn"
												onClick={() => onDelete(teacher.id)}
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

