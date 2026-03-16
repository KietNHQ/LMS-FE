import React from "react";
import { Link } from "react-router-dom";
import "./StudentClasses.css";
import { classList, upcomingTasks } from "./classesData";

export default function StudentClasses() {
	return (
		<section className="student-classes-page">
			<header className="student-classes-header">
				<div>
					<div className="student-classes-title-row">
						<h1>Lớp học của tôi</h1>
 					</div>
				</div>
			</header>

			<div className="student-classes-stats">
				<article className="student-classes-stat-card">
					<p>Lớp học đang theo học</p>
					<strong>{classList.length}</strong>
				</article>
				<article className="student-classes-stat-card">
					<p>Bài tập chưa hoàn thành</p>
					<strong>
						{classList.reduce(
							(sum, item) => sum + item.assignmentsPending,
							0
						)}
					</strong>
				</article>
				<article className="student-classes-stat-card">
					<p>Tiến độ trung bình</p>
					<strong>
						{Math.round(
							classList.reduce((sum, item) => sum + item.progress, 0) /
								classList.length
						)}
						%
					</strong>
				</article>
			</div>

			<div className="student-classes-layout">
				<section className="student-classes-main">
					<div className="student-classes-main-head">
						<h2>Danh sách lớp học</h2>
						<div className="student-classes-main-actions">
							<span>{classList.length} lớp</span>
							<Link
								to={`/student/classes/${classList[0].id}`}
								className="student-classes-primary-btn"
							>
								Vào lớp gần nhất
							</Link>
						</div>
					</div>
					<div className="student-classes-grid">
						{classList.map((item) => (
							<article key={item.id} className="student-class-card">
								<div className="student-class-card-top">
									<div>
										<span className="student-class-tag">{item.className}</span>
										<h3>{item.title}</h3>
									</div>
									<span className="student-class-pending">
										{item.assignmentsPending} chưa hoàn thành
									</span>
								</div>

								<ul className="student-class-info-list">
									<li>Giáo viên: {item.teacher}</li>
									<li>Lịch học: {item.schedule}</li>
									<li>
										Đã học: {item.completedLessons}/{item.totalLessons} buổi
									</li>
								</ul>

								<div className="student-class-progress-wrap">
									<div className="student-class-progress-label">
										<span>Tiến độ môn học</span>
										<strong>{item.progress}%</strong>
									</div>
									<div className="student-class-progress-track">
										<div style={{ width: `${item.progress}%` }} />
									</div>
								</div>

								<Link
									to={`/student/classes/${item.id}`}
									className="student-class-secondary-btn"
								>
									Xem chi tiết lớp học
								</Link>
							</article>
						))}
					</div>
				</section>

				<aside className="student-classes-side-panel">
					<h2>Việc cần làm</h2>
					{upcomingTasks.map((task) => (
						<div key={task.id} className="student-task-item">
							<p className="student-task-title">{task.title}</p>
							<p className="student-task-meta">{task.subject}</p>
							<span className="student-task-due">
								Hạn nộp: {task.due}
							</span>
						</div>
					))}
				</aside>
			</div>
		</section>
	);
}
