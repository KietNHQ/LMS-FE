import React, { useState } from "react";
import { useChangePassword } from "../../../../hooks/useAuth";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import "./ChangePasswordDialog.css";

export default function ChangePasswordDialog({ open, role = "student", onClose }) {
	const isAdmin = role === "admin";
	const [formData, setFormData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: ""
	});
	const [showPasswords, setShowPasswords] = useState({
		current: false,
		new: false,
		confirm: false
	});
	const [error, setError] = useState("");
	const changePasswordMutation = useChangePassword();

	if (!open) return null;

	const togglePasswordVisibility = (field) => {
		setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
	};

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setError("");
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!formData.currentPassword) {
			setError("Vui lòng nhập mật khẩu hiện tại.");
			return;
		}

		if (!isAdmin && (!formData.newPassword || !formData.confirmPassword)) {
			setError("Vui lòng điền đầy đủ thông tin.");
			return;
		}

		if (!isAdmin && formData.newPassword.length < 6) {
			setError("Mật khẩu mới cần tối thiểu 6 ký tự.");
			return;
		}

		if (!isAdmin && formData.newPassword !== formData.confirmPassword) {
			setError("Mật khẩu xác nhận không khớp.");
			return;
		}

		// Generate random password for Admin reset flow
		const generatedPassword = isAdmin ? Math.random().toString(36).slice(-10) : formData.newPassword;

		try {
			await changePasswordMutation.mutateAsync({
				currentPassword: formData.currentPassword,
				newPassword: generatedPassword
			});
			
			setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
			
			if (isAdmin) {
				toast.success(
					<div>
						<strong>Đặt lại mật khẩu thành công!</strong>
						<div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
							Mật khẩu mới của bạn là: <span style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '1.1rem' }}>{generatedPassword}</span>
						</div>
						<div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
							Vui lòng sao chép và lưu trữ an toàn.
						</div>
					</div>, 
					{ autoClose: false, closeOnClick: false, draggable: false }
				);
			} else {
				toast.success("Đổi mật khẩu thành công!");
			}
			
			onClose?.();
		} catch (err) {
			const apiError = err.response?.data?.error || err.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu.";
			setError(apiError);
		}
	};

	return (
		<div className="change-password-overlay" onClick={onClose}>
			<div className="change-password-dialog" onClick={(event) => event.stopPropagation()}>
				<h3>{isAdmin ? "Đặt lại mật khẩu" : "Đổi mật khẩu"}</h3>

				{isAdmin && (
					<div className="admin-reset-notice" style={{ 
						padding: '0.75rem', 
						background: '#f8fafc', 
						border: '1px solid #e2e8f0', 
						borderRadius: '8px',
						marginBottom: '1rem',
						fontSize: '0.875rem',
						color: '#475569'
					}}>
						Hệ thống sẽ tự động tạo mật khẩu mới sau khi bạn xác nhận mật khẩu hiện tại.
					</div>
				)}

				<form onSubmit={handleSubmit} className="change-password-form">
					<label>
						Mật khẩu hiện tại
						<div className="password-input-wrapper">
							<input
								type={showPasswords.current ? "text" : "password"}
								name="currentPassword"
								value={formData.currentPassword}
								onChange={handleChange}
								placeholder="Nhập mật khẩu hiện tại để xác nhận"
							/>
							<button
								type="button"
								className="password-toggle-btn"
								onClick={() => togglePasswordVisibility("current")}
							>
								{showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						</div>
					</label>

					{!isAdmin && (
						<>
							<label>
								Mật khẩu mới
								<div className="password-input-wrapper">
									<input
										type={showPasswords.new ? "text" : "password"}
										name="newPassword"
										value={formData.newPassword}
										onChange={handleChange}
										placeholder="Nhập mật khẩu mới"
									/>
									<button
										type="button"
										className="password-toggle-btn"
										onClick={() => togglePasswordVisibility("new")}
									>
										{showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								</div>
							</label>

							<label>
								Xác nhận mật khẩu mới
								<div className="password-input-wrapper">
									<input
										type={showPasswords.confirm ? "text" : "password"}
										name="confirmPassword"
										value={formData.confirmPassword}
										onChange={handleChange}
										placeholder="Nhập lại mật khẩu mới"
									/>
									<button
										type="button"
										className="password-toggle-btn"
										onClick={() => togglePasswordVisibility("confirm")}
									>
										{showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								</div>
							</label>
						</>
					)}

					{error ? <p className="change-password-error">{error}</p> : null}

					<div className={`change-password-actions role-${role}`}>
						<button type="button" className="change-password-cancel" onClick={onClose}>
							Hủy
						</button>
						<button type="submit" className="change-password-submit">
							{isAdmin ? "Xác nhận đặt lại" : "Cập nhật"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
