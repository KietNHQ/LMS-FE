import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import "./TeacherDetailSection.css";

function toPercent(value) {
	if (typeof value !== "number") return "0%";
	return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

export default function TeacherDetailSection({
	mode,
	teacher,
	classOptions,
	onAssignClass,
	onRemoveAssignedClass,
	onUpdateHomeroomClass,
	onClose,
}) {
	const [classInput, setClassInput] = useState("");

	if (!teacher) return null;

	const progress = teacher.progress || {
		completionRate: 0,
		attendanceRate: 0,
		averageScore: 0,
		pendingLessonPlans: 0,
	};

	return (
		<div className="teacher-detail-overlay" onClick={onClose}>
			<div className="teacher-detail-modal" onClick={(e) => e.stopPropagation()}>
				<div className="teacher-detail-header">
					<div className="teacher-detail-info">
						<div className="teacher-detail-avatar">{teacher.name.charAt(0).toUpperCase()}</div>
						<div>
							<h2>{teacher.name}</h2>
							<p className="teacher-detail-subject">{teacher.subject} • {teacher.email}</p>
						</div>
					</div>
					<button className="teacher-detail-close" onClick={onClose} aria-label="Đóng">
						<FiX />
					</button>
				</div>

				<div className="teacher-detail-body">
					{/* Phân công giảng dạy */}
					<div className="teacher-detail-section">
						<h3>Phân công giảng dạy</h3>

						<div className="teacher-detail-row">
							<span>Giáo viên</span>
							<strong>{teacher.name}</strong>
						</div>

						<div className="teacher-detail-control">
							<label>Lớp chủ nhiệm</label>
							<select
								value={teacher.homeroomClass || ""}
								onChange={(e) => onUpdateHomeroomClass(e.target.value)}
							>
								<option value="">Chưa phân công</option>
								{classOptions.map((className) => (
									<option key={className} value={className}>
										{className}
									</option>
								))}
							</select>
						</div>

						<div className="teacher-detail-control">
							<label>Thêm lớp giảng dạy</label>
							<div className="teacher-detail-add-row">
								<select
									value={classInput}
									onChange={(e) => setClassInput(e.target.value)}
								>
									<option value="" disabled>Chọn lớp...</option>
									{classOptions.map((className) => (
										<option 
											key={className} 
											value={className}
											disabled={teacher.assignedClasses?.includes(className)}
										>
											{className}
										</option>
									))}
								</select>
								<button
									type="button"
									onClick={() => {
										if (classInput.trim()) {
											onAssignClass(classInput);
											setClassInput("");
										}
									}}
								>
									Thêm
								</button>
							</div>
						</div>

						<div className="teacher-detail-chip-wrap">
							{teacher.assignedClasses.length === 0 ? (
								<p className="teacher-detail-empty">Chưa có lớp được phân công.</p>
							) : (
								teacher.assignedClasses.map((className) => (
									<span key={className} className="teacher-detail-chip">
										{className}
										<button type="button" onClick={() => onRemoveAssignedClass(className)}>
											×
										</button>
									</span>
								))
							)}
						</div>
					</div>

					{/* Tiến độ giảng dạy */}
					<div className="teacher-detail-section">
						<h3>Tiến độ giảng dạy</h3>

						<div className="teacher-detail-progress-grid">
							<article>
								<span>Hoàn thành giáo án</span>
								<strong>{toPercent(progress.completionRate)}</strong>
							</article>
							<article>
								<span>Điểm danh lớp</span>
								<strong>{toPercent(progress.attendanceRate)}</strong>
							</article>
							<article>
								<span>Điểm trung bình</span>
								<strong>{Number(progress.averageScore || 0).toFixed(1)}</strong>
							</article>
							<article>
								<span>Giáo án chờ duyệt</span>
								<strong>{progress.pendingLessonPlans || 0}</strong>
							</article>
						</div>

						<div className="teacher-detail-note">
							<p>
								Đang phụ trách {teacher.assignedClasses?.length || 0} lớp
								{teacher.homeroomClass ? `, chủ nhiệm ${teacher.homeroomClass}.` : "."}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

