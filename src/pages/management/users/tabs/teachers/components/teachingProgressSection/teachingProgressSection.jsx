import React from "react";
import "./teachingProgressSection.css";

function toPercent(value) {
	if (typeof value !== "number") return "0%";
	return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

export default function TeachingProgressSection({ teacher }) {
	if (!teacher) {
		return (
			<section className="teaching-progress-card">
				<h3>Tiến độ giảng dạy</h3>
				<p className="teaching-progress-empty">Chọn giáo viên để xem tiến độ.</p>
			</section>
		);
	}

	const progress = teacher.progress || {
		completionRate: 0,
		attendanceRate: 0,
		averageScore: 0,
		pendingLessonPlans: 0,
	};

	return (
		<section className="teaching-progress-card">
			<h3>Tiến độ giảng dạy</h3>

			<div className="teaching-progress-grid">
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

			<div className="teaching-progress-note">
				<p>
					Đang phụ trách {teacher.assignedClasses?.length || 0} lớp
					{teacher.homeroomClass ? `, chủ nhiệm ${teacher.homeroomClass}.` : "."}
				</p>
			</div>
		</section>
	);
}

