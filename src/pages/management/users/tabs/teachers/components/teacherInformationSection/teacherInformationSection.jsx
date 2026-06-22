import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiEdit2, FiX } from "react-icons/fi";
import "./teacherInformationSection.css";

function getAvatarLetter(name) {
	if (!name) return "G";
	return name.trim().charAt(0).toUpperCase();
}

function formatDisplayDate(dateString) {
	if (!dateString) return "—";
	const normalizedDate = String(dateString).trim().slice(0, 10);
	if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
		const [year, month, day] = normalizedDate.split("-");
		return `${day}/${month}/${year}`;
	}
	return dateString;
}

function formatInputDate(dateString) {
	if (!dateString || dateString === "—" || dateString === "--") return "";
	const text = String(dateString).trim();
	if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);

	const parts = text.split("/");
	if (parts.length === 3 && parts[2].length === 4) {
		return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
	}

	return "";
}

function normalizeText(value) {
	return String(value || "").trim().toLocaleLowerCase("vi");
}

function isCatalogSubject(value, subjectOptions = []) {
	const normalizedValue = normalizeText(value);
	if (!normalizedValue) return false;
	return subjectOptions.some((subject) => normalizeText(subject) === normalizedValue);
}

export default function TeacherInformationSection({
	mode = "view",
	formData,
	classOptions = [],
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

	const selectedSubject = formData.subject || formData.profile?.subject || "";
	const assignedSubjects = formData.subjects || formData.assignedSubjects || "";
	const rawQualification = formData.qualification ?? formData.profile?.qualification ?? "";
	const qualificationLooksLikeSubject =
		normalizeText(rawQualification) === normalizeText(selectedSubject) ||
		(!assignedSubjects && isCatalogSubject(rawQualification, subjectOptions));
	const qualificationValue = qualificationLooksLikeSubject ? "" : String(rawQualification || "").trim();
	const phoneValue = formData.phone || formData.profile?.phone || "";
	const normalizedPhone = phoneValue === "—" || phoneValue === "--" ? "" : phoneValue;

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
			<div className="teacher-modal" onClick={(event) => event.stopPropagation()}>
				{isViewMode ? (
					<>
						<div className="teacher-view-header">
							<div className="teacher-view-main">
								<div className="teacher-view-avatar">{getAvatarLetter(formData.name)}</div>
								<div>
									<h3>{formData.name || "—"}</h3>
									<p>{selectedSubject || "Chưa có môn dạy"}</p>
									{qualificationValue && <p>{qualificationValue}</p>}
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
								<span>Trình độ</span>
								<strong>{qualificationValue || "—"}</strong>
							</div>
							<div className="teacher-view-row">
								<span>Ngày sinh</span>
								<strong>{formatDisplayDate(formData.dob || formData.profile?.dob)}</strong>
							</div>
							<div className="teacher-view-row">
								<span>Email</span>
								<strong>{formData.email || "—"}</strong>
							</div>
							<div className="teacher-view-row">
								<span>Số điện thoại</span>
								<strong>{normalizedPhone || "—"}</strong>
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
							<button type="button" className="teacher-cancel-btn" onClick={onClose}>
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
									value={formData.name || ""}
									onChange={(event) => onChange("name", event.target.value)}
								/>
							</div>

							<div className="teacher-form-grid two-cols">
								<div className="teacher-form-group">
									<label>Ngày sinh</label>
									<input
										type="date"
										value={formatInputDate(formData.dob || formData.profile?.dob)}
										onChange={(event) => onChange("dob", event.target.value)}
									/>
								</div>

								<div className="teacher-form-group">
									<label>Email</label>
									<input
										type="email"
										value={formData.email || ""}
										onChange={(event) => onChange("email", event.target.value)}
									/>
								</div>
							</div>

							<div className="teacher-form-grid two-cols">
								<div className="teacher-form-group">
									<label>Môn dạy</label>
									<div className="teacher-custom-select" ref={subjectRef}>
										<button
											type="button"
											className={`teacher-custom-select-trigger ${isSubjectOpen ? "active" : ""}`}
											onClick={() => {
												setIsSubjectOpen(!isSubjectOpen);
												setIsClassOpen(false);
												setIsStatusOpen(false);
											}}
										>
											<span>{selectedSubject || "Chọn môn dạy"}</span>
											<FiChevronDown className={`teacher-select-icon ${isSubjectOpen ? "open" : ""}`} />
										</button>
										{isSubjectOpen && (
											<div className="teacher-custom-select-options">
												<div
													className={`teacher-custom-select-option ${!selectedSubject ? "active" : ""}`}
													onClick={() => {
														onChange("subject", "");
														setIsSubjectOpen(false);
													}}
												>
													Chọn môn dạy
												</div>
												{subjectOptions.map((subject) => (
													<div
														key={subject}
														className={`teacher-custom-select-option ${selectedSubject === subject ? "active" : ""}`}
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
									<label>Trình độ</label>
									<input
										type="text"
										value={qualificationValue}
										onChange={(event) => onChange("qualification", event.target.value)}
										placeholder="VD: Cử nhân"
									/>
								</div>
							</div>

							<div className="teacher-form-grid two-cols">
								<div className="teacher-form-group">
									<label>Số điện thoại</label>
									<input
										type="text"
										value={normalizedPhone}
										onChange={(event) => onChange("phone", event.target.value)}
										placeholder="10 chữ số"
									/>
								</div>

								<div className="teacher-form-group">
									<label>Lớp chủ nhiệm</label>
									<div className="teacher-custom-select" ref={classRef}>
										<button
											type="button"
											className={`teacher-custom-select-trigger ${isClassOpen ? "active" : ""}`}
											onClick={() => {
												setIsClassOpen(!isClassOpen);
												setIsSubjectOpen(false);
												setIsStatusOpen(false);
											}}
										>
											<span>{formData.homeroomClass || "Chưa phân công"}</span>
											<FiChevronDown className={`teacher-select-icon ${isClassOpen ? "open" : ""}`} />
										</button>
										{isClassOpen && (
											<div className="teacher-custom-select-options">
												<div
													className={`teacher-custom-select-option ${!formData.homeroomClass ? "active" : ""}`}
													onClick={() => {
														onChange("homeroomClass", "");
														setIsClassOpen(false);
													}}
												>
													Chưa phân công
												</div>
												{classOptions.map((className) => (
													<div
														key={className}
														className={`teacher-custom-select-option ${
															formData.homeroomClass === className ? "active" : ""
														}`}
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
							</div>

							<div className="teacher-form-grid two-cols">
								<div className="teacher-form-group">
									<label>Trạng thái</label>
									<div className="teacher-custom-select" ref={statusRef}>
										<button
											type="button"
											className={`teacher-custom-select-trigger ${isStatusOpen ? "active" : ""}`}
											onClick={() => {
												setIsStatusOpen(!isStatusOpen);
												setIsSubjectOpen(false);
												setIsClassOpen(false);
											}}
										>
											<span>{formData.status || "Hoạt động"}</span>
											<FiChevronDown className={`teacher-select-icon ${isStatusOpen ? "open" : ""}`} />
										</button>
										{isStatusOpen && (
											<div className="teacher-custom-select-options">
												{["Hoạt động", "Vô hiệu hóa"].map((item) => (
													<div
														key={item}
														className={`teacher-custom-select-option ${
															formData.status === item ? "active" : ""
														}`}
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
							<button type="button" className="teacher-cancel-btn" onClick={onClose}>
								Hủy
							</button>
							<button type="button" className="teacher-submit-btn" onClick={onSubmit}>
								Lưu thay đổi
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
