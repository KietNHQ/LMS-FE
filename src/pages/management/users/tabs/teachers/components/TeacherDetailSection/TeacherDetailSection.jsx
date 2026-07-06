import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiX } from "react-icons/fi";
import "./TeacherDetailSection.css";

function toPercent(value) {
	if (typeof value !== "number") return "0%";
	return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

function normalizeText(value) {
	return String(value || "").trim().toLocaleLowerCase("vi");
}

function isQualificationText(value) {
	return ["cử nhân", "cu nhan", "thạc sĩ", "thac si", "tiến sĩ", "tien si"].includes(normalizeText(value));
}

export default function TeacherDetailSection({
	teacher,
	classOptions,
	onAssignClass,
	onRemoveAssignedClass,
	onUpdateHomeroomClass,
	onClose,
}) {
	const [classInput, setClassInput] = useState("");
	const [isHomeroomOpen, setIsHomeroomOpen] = useState(false);
	const [isClassOpen, setIsClassOpen] = useState(false);

	const homeroomRef = useRef(null);
	const classRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (homeroomRef.current && !homeroomRef.current.contains(event.target)) {
				setIsHomeroomOpen(false);
			}
			if (classRef.current && !classRef.current.contains(event.target)) {
				setIsClassOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	if (!teacher) return null;

	const progress = teacher.progress || {
		completionRate: 0,
		attendanceRate: 0,
		averageScore: 0,
		pendingLessonPlans: 0,
	};
	const rawSubject =
		teacher.subjects ||
		teacher.assignedSubjects ||
		teacher.subject ||
		teacher.profile?.subject ||
		"";
	const qualification = teacher.qualification || teacher.profile?.qualification || "";
	const teachingSubject = isQualificationText(rawSubject) ? "" : rawSubject;
	const subjectSummary = teachingSubject || "Chưa có môn dạy";

	return (
		<div className="teacher-detail-overlay" onClick={onClose}>
			<div className="teacher-detail-modal" onClick={(e) => e.stopPropagation()}>
				<div className="teacher-detail-header">
					<div className="teacher-detail-info">
						<div className="teacher-detail-avatar">{teacher.name.charAt(0).toUpperCase()}</div>
						<div>
							<h2>{teacher.name}</h2>
							<p className="teacher-detail-subject">{subjectSummary} • {teacher.email}</p>
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

						<div className="teacher-detail-row">
							<span>Môn dạy</span>
							<strong>{subjectSummary}</strong>
						</div>

						<div className="teacher-detail-row">
							<span>Trình độ</span>
							<strong>{qualification || "—"}</strong>
						</div>

						<div className="teacher-detail-control">
							<label>Lớp chủ nhiệm</label>
							<div className="teacher-detail-custom-select" ref={homeroomRef}>
								<button
									type="button"
									className={`teacher-detail-custom-select-trigger ${isHomeroomOpen ? "active" : ""}`}
									onClick={() => {
										setIsHomeroomOpen((prev) => !prev);
										setIsClassOpen(false);
									}}
								>
									<span>{teacher.homeroomClass || "Chưa phân công"}</span>
									<FiChevronDown className={`teacher-detail-select-icon ${isHomeroomOpen ? "open" : ""}`} />
								</button>
								{isHomeroomOpen && (
									<div className="teacher-detail-custom-select-options">
										<div
											className={`teacher-detail-custom-select-option ${!teacher.homeroomClass ? "active" : ""}`}
											onClick={() => {
												onUpdateHomeroomClass("");
												setIsHomeroomOpen(false);
											}}
										>
											Chưa phân công
										</div>
										{classOptions.map((className) => (
											<div
												key={className}
												className={`teacher-detail-custom-select-option ${teacher.homeroomClass === className ? "active" : ""}`}
												onClick={() => {
													onUpdateHomeroomClass(className);
													setIsHomeroomOpen(false);
												}}
											>
												{className}
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						<div className="teacher-detail-control">
							<label>Thêm lớp giảng dạy</label>
							<div className="teacher-detail-add-row">
								<div className="teacher-detail-custom-select" ref={classRef}>
									<button
										type="button"
										className={`teacher-detail-custom-select-trigger ${isClassOpen ? "active" : ""}`}
										onClick={() => {
											setIsClassOpen((prev) => !prev);
											setIsHomeroomOpen(false);
										}}
									>
										<span>{classInput || "Chọn lớp..."}</span>
										<FiChevronDown className={`teacher-detail-select-icon ${isClassOpen ? "open" : ""}`} />
									</button>
									{isClassOpen && (
										<div className="teacher-detail-custom-select-options">
											{classOptions.map((className) => {
												const isDisabled = (teacher.assignedClasses || []).includes(className);
												return (
													<div
														key={className}
														className={`teacher-detail-custom-select-option ${classInput === className ? "active" : ""} ${isDisabled ? "disabled" : ""}`}
														onClick={() => {
															if (isDisabled) return;
															setClassInput(className);
															setIsClassOpen(false);
														}}
													>
														{className}
													</div>
												);
											})}
										</div>
									)}
								</div>
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
							{(!teacher.assignedClasses || teacher.assignedClasses.length === 0) ? (
								<p className="teacher-detail-empty">Chưa có lớp được phân công.</p>
							) : (
								(teacher.assignedClasses || []).map((className) => (
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

