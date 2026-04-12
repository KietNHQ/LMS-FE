import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiEdit2, FiX } from "react-icons/fi";
import "./teacherInformationSection.css";

function getAvatarLetter(name) {
	if (!name) return "G";
	return name.trim().charAt(0).toUpperCase();
}

function formatDisplayDate(dateString) {
	if (!dateString) return "—";
	const parts = String(dateString).split("-");
	if (parts.length === 3) {
		return `${parts[2]}/${parts[1]}/${parts[0]}`;
	}
	return dateString;
}

export default function TeacherInformationSection({
	mode = "view",
	formData,
	classOptions,
	subjectOptions = [],
	onChange,
	onClose,
	onSubmit,
	onRequestEdit,
}) {
	const isViewMode = mode === "view";

	const [isSubjectOpen, setIsSubjectOpen] = useState(false);
	const [isClassOpen, setIsClassOpen] = useState(false);
	const [isStatusOpen, setIsStatusOpen] = useState(false);

	const subjectRef = useRef(null);
	const classRef = useRef(null);
	const statusRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (subjectRef.current && !subjectRef.current.contains(event.target)) setIsSubjectOpen(false);
			if (classRef.current && !classRef.current.contains(event.target)) setIsClassOpen(false);
			if (statusRef.current && !statusRef.current.contains(event.target)) setIsStatusOpen(false);
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="teacher-modal-overlay" onClick={onClose}>
			<div className="teacher-modal" onClick={(e) => e.stopPropagation()}>
				{isViewMode ? (
					<>
						<div className="teacher-view-header">
							<div className="teacher-view-main">
								<div className="teacher-view-avatar">{getAvatarLetter(formData.name)}</div>

								<div>
									<h3>{formData.name || "—"}</h3>
									<p>{formData.subject || "Chưa có môn dạy"}</p>
								</div>
							</div>
							<div className="teacher-view-header-actions">
								<button
									type="button"
									className="teacher-view-icon-btn"
									onClick={onRequestEdit}
									title="Chỉnh sửa"
									aria-label="Chỉnh sửa"
								>
									<FiEdit2 />
								</button>
								<button
									type="button"
									className="teacher-view-icon-btn"
									onClick={onClose}
									title="Đóng"
									aria-label="Đóng"
								>
									<FiX />
								</button>
							</div>
						</div>

						<div className="teacher-view-list">
							<div className="teacher-view-row">
								<span>Ngày sinh</span>
								<strong>{formatDisplayDate(formData.dob)}</strong>
							</div>
							<div className="teacher-view-row">
								<span>Email</span>
								<strong>{formData.email || "—"}</strong>
							</div>
							<div className="teacher-view-row">
								<span>Số điện thoại</span>
								<strong>{formData.phone || "—"}</strong>
							</div>
							<div className="teacher-view-row">
								<span>Lớp chủ nhiệm</span>
								<strong>{formData.homeroomClass || "Chưa phân công"}</strong>
							</div>
							<div className="teacher-view-row">
								<span>Trạng thái</span>
								<strong>{formData.status || "—"}</strong>
							</div>
						</div>

						<div className="teacher-modal-actions single">
							<button className="teacher-cancel-btn" onClick={onClose}>
								Đóng
							</button>
						</div>
					</>
				) : (
					<>
						<h2>Chỉnh sửa giáo viên</h2>

						<div className="teacher-modal-form">
							<div className="teacher-form-group full">
								<label>Họ và tên</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) => onChange("name", e.target.value)}
								/>
							</div>

							<div className="teacher-form-grid two-cols">
								<div className="teacher-form-group">
									<label>Ngày sinh</label>
									<input
										type="date"
										value={formData.dob}
										onChange={(e) => onChange("dob", e.target.value)}
									/>
								</div>

								<div className="teacher-form-group">
									<label>Email</label>
									<input
										type="email"
										value={formData.email}
										onChange={(e) => onChange("email", e.target.value)}
									/>
								</div>
							</div>

							<div className="teacher-form-grid two-cols">
								<div className="teacher-form-group">
									<label>Môn dạy</label>
									<div className="teacher-custom-select" ref={subjectRef}>
										<div
											className={`teacher-custom-select-trigger ${isSubjectOpen ? 'active' : ''}`}
											onClick={() => {
												setIsSubjectOpen(!isSubjectOpen);
												setIsClassOpen(false);
												setIsStatusOpen(false);
											}}
										>
											<span>{formData.subject || "Chọn môn dạy"}</span>
											<FiChevronDown className={`teacher-select-icon ${isSubjectOpen ? 'open' : ''}`} />
										</div>
										{isSubjectOpen && (
											<div className="teacher-custom-select-options">
												<div
													className={`teacher-custom-select-option ${!formData.subject ? 'active' : ''}`}
													onClick={() => { onChange("subject", ""); setIsSubjectOpen(false); }}
												>
													Chọn môn dạy
												</div>
												{subjectOptions.map((subject) => (
													<div
														key={subject}
														className={`teacher-custom-select-option ${formData.subject === subject ? 'active' : ''}`}
														onClick={() => {
															onChange("subject", subject);
															setIsSubjectOpen(false);
														}}
													>
														{subject}
													</div>
												))}
											</div>
										)}
									</div>
								</div>

								<div className="teacher-form-group">
									<label>Số điện thoại</label>
									<input
										type="text"
										value={formData.phone}
										onChange={(e) => onChange("phone", e.target.value)}
										placeholder="10 chữ số"
									/>
								</div>
							</div>

							<div className="teacher-form-grid two-cols">
								<div className="teacher-form-group">
									<label>Lớp chủ nhiệm</label>
									<div className="teacher-custom-select" ref={classRef}>
										<div
											className={`teacher-custom-select-trigger ${isClassOpen ? 'active' : ''}`}
											onClick={() => {
												setIsClassOpen(!isClassOpen);
												setIsSubjectOpen(false);
												setIsStatusOpen(false);
											}}
										>
											<span>{formData.homeroomClass || "Chưa phân công"}</span>
											<FiChevronDown className={`teacher-select-icon ${isClassOpen ? 'open' : ''}`} />
										</div>
										{isClassOpen && (
											<div className="teacher-custom-select-options">
												<div
													className={`teacher-custom-select-option ${!formData.homeroomClass ? 'active' : ''}`}
													onClick={() => { onChange("homeroomClass", ""); setIsClassOpen(false); }}
												>
													Chưa phân công
												</div>
												{classOptions.map((className) => (
													<div
														key={className}
														className={`teacher-custom-select-option ${formData.homeroomClass === className ? 'active' : ''}`}
														onClick={() => {
															onChange("homeroomClass", className);
															setIsClassOpen(false);
														}}
													>
														{className}
													</div>
												))}
											</div>
										)}
									</div>
								</div>

								<div className="teacher-form-group">
									<label>Trạng thái</label>
									<div className="teacher-custom-select" ref={statusRef}>
										<div
											className={`teacher-custom-select-trigger ${isStatusOpen ? 'active' : ''}`}
											onClick={() => {
												setIsStatusOpen(!isStatusOpen);
												setIsSubjectOpen(false);
												setIsClassOpen(false);
											}}
										>
											<span>{formData.status || "Hoạt động"}</span>
											<FiChevronDown className={`teacher-select-icon ${isStatusOpen ? 'open' : ''}`} />
										</div>
										{isStatusOpen && (
											<div className="teacher-custom-select-options">
												{["Hoạt động", "Tạm khóa"].map((item) => (
													<div
														key={item}
														className={`teacher-custom-select-option ${formData.status === item ? 'active' : ''}`}
														onClick={() => {
															onChange("status", item);
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
						</div>

						<div className="teacher-modal-actions">
							<button className="teacher-cancel-btn" onClick={onClose}>
								Hủy
							</button>
							<button className="teacher-submit-btn" onClick={onSubmit}>
								Lưu thay đổi
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

