import React from "react";
import "./teacherInformationSection.css";

function getAvatarLetter(name) {
	if (!name) return "G";
	return name.trim().charAt(0).toUpperCase();
}

export default function TeacherInformationSection({
	mode = "view",
	formData,
	classOptions,
	onChange,
	onClose,
	onSubmit,
}) {
	const isViewMode = mode === "view";

	return (
		<div className="teacher-modal-overlay" onClick={onClose}>
			<div className="teacher-modal" onClick={(e) => e.stopPropagation()}>
				{isViewMode ? (
					<>
						<div className="teacher-view-header">
							<div className="teacher-view-avatar">{getAvatarLetter(formData.name)}</div>

							<div>
								<h3>{formData.name || "—"}</h3>
								<p>{formData.subject || "Chưa có môn dạy"}</p>
							</div>
						</div>

						<div className="teacher-view-list">
							<div className="teacher-view-row">
								<span>Ngày sinh</span>
								<strong>{formData.dob || "—"}</strong>
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
									<input
										type="text"
										value={formData.subject}
										onChange={(e) => onChange("subject", e.target.value)}
									/>
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
									<select
										value={formData.homeroomClass}
										onChange={(e) => onChange("homeroomClass", e.target.value)}
									>
										<option value="">Chưa phân công</option>
										{classOptions.map((className) => (
											<option key={className} value={className}>
												{className}
											</option>
										))}
									</select>
								</div>

								<div className="teacher-form-group">
									<label>Trạng thái</label>
									<select
										value={formData.status}
										onChange={(e) => onChange("status", e.target.value)}
									>
										<option value="Hoạt động">Hoạt động</option>
										<option value="Tạm khóa">Tạm khóa</option>
									</select>
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

