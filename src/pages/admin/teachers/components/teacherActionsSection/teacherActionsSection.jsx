import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
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
	const [isSubjectOpen, setIsSubjectOpen] = useState(false);
	const [isStatusOpen, setIsStatusOpen] = useState(false);
	const subjectRef = useRef(null);
	const statusRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (subjectRef.current && !subjectRef.current.contains(event.target)) {
				setIsSubjectOpen(false);
			}
			if (statusRef.current && !statusRef.current.contains(event.target)) {
				setIsStatusOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

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
					<div className="teacher-custom-select" ref={subjectRef}>
						<div
							className="teacher-custom-select-trigger"
							onClick={() => {
								setIsSubjectOpen(!isSubjectOpen);
								setIsStatusOpen(false);
							}}
						>
							<span>{selectedSubject}</span>
							<FiChevronDown className={`teacher-select-icon ${isSubjectOpen ? 'open' : ''}`} />
						</div>
						{isSubjectOpen && (
							<div className="teacher-custom-select-options">
								{subjectOptions.map((item) => (
									<div
										key={item}
										className={`teacher-custom-select-option ${selectedSubject === item ? 'active' : ''}`}
										onClick={() => {
											onSubjectChange(item);
											setIsSubjectOpen(false);
										}}
									>
										{item}
									</div>
								))}
							</div>
						)}
					</div>

					<div className="teacher-custom-select" ref={statusRef}>
						<div
							className="teacher-custom-select-trigger"
							onClick={() => {
								setIsStatusOpen(!isStatusOpen);
								setIsSubjectOpen(false);
							}}
						>
							<span>{selectedStatus}</span>
							<FiChevronDown className={`teacher-select-icon ${isStatusOpen ? 'open' : ''}`} />
						</div>
						{isStatusOpen && (
							<div className="teacher-custom-select-options">
								{statusOptions.map((item) => (
									<div
										key={item}
										className={`teacher-custom-select-option ${selectedStatus === item ? 'active' : ''}`}
										onClick={() => {
											onStatusChange(item);
											setIsStatusOpen(false);
										}}
									>
										{item}
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
