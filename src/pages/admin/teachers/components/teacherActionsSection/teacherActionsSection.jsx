import React from "react";
import { FiChevronDown, FiSearch } from "react-icons/fi";
import "./teacherActionsSection.css";

export default function TeacherActionsSection({
	totalTeachers,
	searchTerm,
	selectedStatus,
	selectedSubject,
	statusOptions,
	subjectOptions,
	onSearchChange,
	onStatusChange,
	onSubjectChange,
	onCreateTeacherAccount,
}) {
	return (
		<section className="teacher-actions-section">
			<div className="teacher-actions-top">
				<div className="teacher-actions-title-wrap">
					<div className="teacher-actions-title-row">
						<h1>Quản lý Giáo viên</h1>
						<div className="teacher-total-badge" aria-live="polite">
							<span className="teacher-total-number">{totalTeachers}</span>
							<span className="teacher-total-label">giáo viên</span>
						</div>
					</div>
				</div>

				<button className="teacher-create-account-btn" onClick={onCreateTeacherAccount}>
					Tạo tài khoản giáo viên
				</button>
			</div>

			<div className="teacher-toolbar-card">
				<div className="teacher-search-box">
					<FiSearch className="teacher-search-icon" />
					<input
						type="text"
						placeholder="Tìm theo tên, email, số điện thoại..."
						value={searchTerm}
						onChange={(e) => onSearchChange(e.target.value)}
					/>
				</div>

				<div className="teacher-filter-wrap">
					<div className="teacher-select-wrap">
						<select
							value={selectedStatus}
							onChange={(e) => onStatusChange(e.target.value)}
						>
							{statusOptions.map((status) => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</select>
						<FiChevronDown className="teacher-select-icon" />
					</div>

					<div className="teacher-select-wrap">
						<select
							value={selectedSubject}
							onChange={(e) => onSubjectChange(e.target.value)}
						>
							{subjectOptions.map((subject) => (
								<option key={subject} value={subject}>
									{subject}
								</option>
							))}
						</select>
						<FiChevronDown className="teacher-select-icon" />
					</div>
				</div>
			</div>
		</section>
	);
}

