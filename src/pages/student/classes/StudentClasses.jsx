import React from "react";
import { Link } from "react-router-dom";
import "./StudentClasses.css";
import { classList, upcomingTasks } from "./classesData";

export default function StudentClasses() {
	return (
		<section className="student-classes-page">
			<header className="student-classes-header">
				<div>
					<h1>Lop hoc cua em</h1>
					<p>Theo doi tien do, lich hoc va bai tap sap den han.</p>
				</div>
				<Link
					to={`/student/classes/${classList[0].id}`}
					className="student-classes-primary-btn"
				>
					Vao lop gan nhat
				</Link>
			</header>

			<div className="student-classes-stats">
				<article className="student-classes-stat-card">
					<p>So lop dang hoc</p>
					<strong>{classList.length}</strong>
				</article>
				<article className="student-classes-stat-card">
					<p>Bai tap chua hoan thanh</p>
					<strong>
						{classList.reduce(
							(sum, item) => sum + item.assignmentsPending,
							0
						)}
					</strong>
				</article>
				<article className="student-classes-stat-card">
					<p>Tien do trung binh</p>
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
				<div className="student-classes-grid">
					{classList.map((item) => (
						<article key={item.id} className="student-class-card">
							<div className="student-class-card-top">
								<div>
									<span className="student-class-tag">{item.className}</span>
									<h3>{item.title}</h3>
									<p className="student-class-code">{item.code}</p>
								</div>
								<span className="student-class-pending">
									{item.assignmentsPending} bai cho nop
								</span>
							</div>

							<ul className="student-class-info-list">
								<li>Giao vien: {item.teacher}</li>
								<li>Lich hoc: {item.schedule}</li>
								<li>
									Da hoc: {item.completedLessons}/{item.totalLessons} buoi
								</li>
							</ul>

							<div className="student-class-progress-wrap">
								<div className="student-class-progress-label">
									<span>Tien do khoa hoc</span>
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
								Xem chi tiet lop
							</Link>
						</article>
					))}
				</div>

				<aside className="student-classes-side-panel">
					<h2>Viec can lam</h2>
					{upcomingTasks.map((task) => (
						<div key={task.id} className="student-task-item">
							<p className="student-task-title">{task.title}</p>
							<p className="student-task-meta">{task.subject}</p>
							<span className="student-task-due">
								Han nop: {task.due}
							</span>
						</div>
					))}
				</aside>
			</div>
		</section>
	);
}
