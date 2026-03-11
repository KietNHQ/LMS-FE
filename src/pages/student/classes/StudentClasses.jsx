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
						<h1>My Classes</h1>
 					</div>
					<p>Track your learning progress, schedule, and upcoming assignments.</p>
				</div>
			</header>

			<div className="student-classes-stats">
				<article className="student-classes-stat-card">
					<p>Active Classes</p>
					<strong>{classList.length}</strong>
				</article>
				<article className="student-classes-stat-card">
					<p>Pending Assignments</p>
					<strong>
						{classList.reduce(
							(sum, item) => sum + item.assignmentsPending,
							0
						)}
					</strong>
				</article>
				<article className="student-classes-stat-card">
					<p>Average Progress</p>
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
						<h2>Class List</h2>
						<div className="student-classes-main-actions">
							<span>{classList.length} classes</span>
							<Link
								to={`/student/classes/${classList[0].id}`}
								className="student-classes-primary-btn"
							>
								Go to Latest Class
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
										{item.assignmentsPending} pending
									</span>
								</div>

								<ul className="student-class-info-list">
									<li>Teacher: {item.teacher}</li>
									<li>Schedule: {item.schedule}</li>
									<li>
										Completed: {item.completedLessons}/{item.totalLessons} sessions
									</li>
								</ul>

								<div className="student-class-progress-wrap">
									<div className="student-class-progress-label">
										<span>Course Progress</span>
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
									View Class Details
								</Link>
							</article>
						))}
					</div>
				</section>

				<aside className="student-classes-side-panel">
					<h2>To-Do</h2>
					{upcomingTasks.map((task) => (
						<div key={task.id} className="student-task-item">
							<p className="student-task-title">{task.title}</p>
							<p className="student-task-meta">{task.subject}</p>
							<span className="student-task-due">
								Due: {task.due}
							</span>
						</div>
					))}
				</aside>
			</div>
		</section>
	);
}
