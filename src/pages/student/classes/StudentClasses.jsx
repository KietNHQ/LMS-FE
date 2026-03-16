import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./StudentClasses.css";
import { classList, upcomingTasks } from "./classesData";
import { SearchBar } from "../../../components/common";

const ITEMS_PER_PAGE = 4;
const TOTAL_WEEKS = 15;
const LAST_VISITED_CLASS_KEY = "student_last_visited_class";

export default function StudentClasses() {
	const navigate = useNavigate();

	const [searchValue, setSearchValue] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [lastVisitedClassId, setLastVisitedClassId] = useState(null);

	useEffect(() => {
		const savedClassId = localStorage.getItem(LAST_VISITED_CLASS_KEY);
		if (savedClassId) {
			setLastVisitedClassId(savedClassId);
		}
	}, []);

	const totalAssignmentsPending = useMemo(() => {
		return classList.reduce((sum, item) => sum + item.assignmentsPending, 0);
	}, []);

	const totalCompletedLessons = useMemo(() => {
		return classList.reduce((sum, item) => sum + item.completedLessons, 0);
	}, []);

	const totalLessons = useMemo(() => {
		return classList.reduce((sum, item) => sum + item.totalLessons, 0);
	}, []);

	const progressPercent = useMemo(() => {
		if (!totalLessons) return 0;
		return Math.round((totalCompletedLessons / totalLessons) * 100);
	}, [totalCompletedLessons, totalLessons]);

	const currentWeek = useMemo(() => {
		if (!classList.length) return 1;

		const weekNumbers = classList.map((item) => {
			if (!item.totalLessons || !item.completedLessons) return 1;
			const ratio = item.completedLessons / item.totalLessons;
			return Math.max(1, Math.ceil(ratio * TOTAL_WEEKS));
		});

		const avgWeek = Math.round(
			weekNumbers.reduce((sum, week) => sum + week, 0) / weekNumbers.length
		);

		return Math.min(TOTAL_WEEKS, Math.max(1, avgWeek));
	}, []);

	const filteredClasses = useMemo(() => {
		const keyword = searchValue.trim().toLowerCase();

		if (!keyword) return classList;

		return classList.filter((item) => {
			return (
				item.title.toLowerCase().includes(keyword) ||
				item.teacher.toLowerCase().includes(keyword) ||
				item.className.toLowerCase().includes(keyword) ||
				item.schedule.toLowerCase().includes(keyword) ||
				item.room.toLowerCase().includes(keyword)
			);
		});
	}, [searchValue]);

	const totalPages = Math.max(1, Math.ceil(filteredClasses.length / ITEMS_PER_PAGE));

	const paginatedClasses = useMemo(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE;
		return filteredClasses.slice(start, start + ITEMS_PER_PAGE);
	}, [filteredClasses, currentPage]);

	const lastVisitedClass = useMemo(() => {
		return classList.find((item) => String(item.id) === String(lastVisitedClassId)) || null;
	}, [lastVisitedClassId]);

	const handleSearchChange = (e) => {
		setSearchValue(e.target.value);
		setCurrentPage(1);
	};

	const handleClearSearch = () => {
		setSearchValue("");
		setCurrentPage(1);
	};

	const handleViewClassDetail = (classId) => {
		localStorage.setItem(LAST_VISITED_CLASS_KEY, String(classId));
		setLastVisitedClassId(String(classId));
		navigate(`/student/classes/${classId}`);
	};

	const handleGoToLastVisitedClass = () => {
		if (!lastVisitedClass) return;
		navigate(`/student/classes/${lastVisitedClass.id}`);
	};

	const goPrevPage = () => {
		setCurrentPage((prev) => Math.max(1, prev - 1));
	};

	const goNextPage = () => {
		setCurrentPage((prev) => Math.min(totalPages, prev + 1));
	};

	return (
		<section className="student-classes-page">
			<header className="student-classes-header">
				<div className="student-classes-title-wrap">
					<h1>Lớp học của tôi</h1>
				</div>
			</header>

			<div className="student-classes-stats">
				<article className="student-classes-stat-card">
					<p>Bài tập chưa hoàn thành</p>
					<strong>{totalAssignmentsPending}</strong>
				</article>

				<article className="student-classes-stat-card">
					<p>Tiến độ buổi học</p>
					<strong>
						{totalCompletedLessons}/{totalLessons}
					</strong>
				</article>

				<article className="student-classes-stat-card">
					<p>Tuần hiện tại</p>
					<strong>{currentWeek}/{TOTAL_WEEKS}</strong>
				</article>
			</div>

			<div className="student-classes-layout">
				<section className="student-classes-main">
					<div className="student-classes-main-head">
						<div className="student-classes-main-title">
							<h2>Danh sách lớp học</h2>
						</div>

						<div className="student-classes-main-actions">
							<div className="student-classes-search-wrap">
								<SearchBar
									value={searchValue}
									onChange={handleSearchChange}
									onClear={handleClearSearch}
									placeholder="Tìm theo môn học, giáo viên, lớp, phòng..."
								/>
							</div>

							<button
								type="button"
								className={`student-classes-primary-btn ${
									!lastVisitedClass ? "student-classes-primary-btn--disabled" : ""
								}`}
								onClick={handleGoToLastVisitedClass}
								disabled={!lastVisitedClass}
								title={
									lastVisitedClass
										? `Mở lại lớp ${lastVisitedClass.title}`
										: "Chưa có lớp đã truy cập gần nhất"
								}
							>
								Vào lớp gần nhất
							</button>
						</div>
					</div>

					{paginatedClasses.length > 0 ? (
						<>
							<div className="student-classes-grid">
								{paginatedClasses.map((item) => {
									const examPreview =
										item.assignments?.[0]?.title || "Chưa có bài kiểm tra sắp tới";

									return (
										<article
											key={item.id}
											className="student-class-card"
											onClick={() => handleViewClassDetail(item.id)}
											role="button"
											tabIndex={0}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													handleViewClassDetail(item.id);
												}
											}}
										>
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

											<div className="student-class-highlight">
                        <span className="student-class-highlight-label">
                          Bài nổi bật
                        </span>
												<p>{examPreview}</p>
											</div>

											<div className="student-class-card-actions">
												<button
													type="button"
													className="student-class-secondary-btn"
													onClick={(e) => {
														e.stopPropagation();
														handleViewClassDetail(item.id);
													}}
												>
													Xem chi tiết lớp học
												</button>
											</div>
										</article>
									);
								})}
							</div>

							<div className="student-classes-pagination">
								<button
									type="button"
									className="student-classes-page-btn"
									onClick={goPrevPage}
									disabled={currentPage === 1}
									aria-label="Trang trước"
								>
									<FiChevronLeft />
								</button>

								<div className="student-classes-page-indicator">
									<span>{currentPage}</span>
									<small>/ {totalPages}</small>
								</div>

								<button
									type="button"
									className="student-classes-page-btn"
									onClick={goNextPage}
									disabled={currentPage === totalPages}
									aria-label="Trang sau"
								>
									<FiChevronRight />
								</button>
							</div>
						</>
					) : (
						<div className="student-classes-empty">
							<h3>Không tìm thấy lớp phù hợp</h3>
							<p>Hãy thử lại với từ khóa khác.</p>
						</div>
					)}
				</section>

				<aside className="student-classes-side-panel">
					<h2>Việc cần làm</h2>

					{upcomingTasks.map((task) => (
						<div key={task.id} className="student-task-item">
							<div className="student-task-main">
								<p className="student-task-title">{task.title}</p>
								<p className="student-task-meta">{task.subject}</p>
								<span className="student-task-due">Hạn nộp: {task.due}</span>
							</div>

							<div className="student-task-hover-detail">
								<span>Bài sẽ kiểm tra:</span>{" "}
								{task.title.includes("Kiểm tra")
									? task.title
									: `${task.subject} - nội dung cần ôn tập`}
							</div>
						</div>
					))}
				</aside>
			</div>
		</section>
	);
}