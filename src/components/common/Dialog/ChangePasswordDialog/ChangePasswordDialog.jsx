import React, { useState } from "react";
import "./ChangePasswordDialog.css";

export default function ChangePasswordDialog({ open, role = "student", onClose }) {
	const [formData, setFormData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: ""
	});
	const [error, setError] = useState("");

	if (!open) return null;

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setError("");
	};

	const handleSubmit = (event) => {
		event.preventDefault();

		if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
			setError("Vui lòng điền đầy đủ thông tin.");
			return;
		}

		if (formData.newPassword.length < 6) {
			setError("Mật khẩu mới cần tối thiểu 6 ký tự.");
			return;
		}

		if (formData.newPassword !== formData.confirmPassword) {
			setError("Mật khẩu xác nhận không khớp.");
			return;
		}

		setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
		onClose?.();
	};

	return (
		<div className="change-password-overlay" onClick={onClose}>
			<div className="change-password-dialog" onClick={(event) => event.stopPropagation()}>
				<h3>Đổi mật khẩu</h3>

				<form onSubmit={handleSubmit} className="change-password-form">
					<label>
						Mật khẩu hiện tại
						<input
							type="password"
							name="currentPassword"
							value={formData.currentPassword}
							onChange={handleChange}
							placeholder="Nhập mật khẩu hiện tại"
						/>
					</label>

					<label>
						Mật khẩu mới
						<input
							type="password"
							name="newPassword"
							value={formData.newPassword}
							onChange={handleChange}
							placeholder="Nhập mật khẩu mới"
						/>
					</label>

					<label>
						Xác nhận mật khẩu mới
						<input
							type="password"
							name="confirmPassword"
							value={formData.confirmPassword}
							onChange={handleChange}
							placeholder="Nhập lại mật khẩu mới"
						/>
					</label>

					{error ? <p className="change-password-error">{error}</p> : null}

					<div className={`change-password-actions role-${role}`}>
						<button type="button" className="change-password-cancel" onClick={onClose}>
							Hủy
						</button>
						<button type="submit" className="change-password-submit">
							Cập nhật
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

