import React, { useState } from "react";
import { useChangePassword, useLogout } from "../../../../hooks/useAuth";
import { toast } from "react-toastify";
import { Eye, EyeOff, X } from "lucide-react";
import "./ChangePasswordDialog.css";

export default function ChangePasswordDialog({ open, role = "student", onClose, isMandatory = false }) {
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
	const logoutMutation = useLogout();

	if (!open) return null;

	const togglePasswordVisibility = (field) => {
		setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
	};

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setError("");
	};

	const handleClose = () => {
		if (isMandatory) {
			// If mandatory, closing the dialog means logging out (as requested by user)
			if (window.confirm("Bạn cần đổi mật khẩu để tiếp tục sử dụng. Bạn có muốn đăng xuất không?")) {
				logoutMutation.mutate();
			}
			return;
		}
		onClose?.();
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!formData.currentPassword) {
			setError("Vui lòng nhập mật khẩu hiện tại.");
			return;
		}

		if (!formData.newPassword || !formData.confirmPassword) {
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

		try {
			await changePasswordMutation.mutateAsync({
				currentPassword: formData.currentPassword,
				newPassword: formData.newPassword
			});
			
			setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
			toast.success("Đặt lại mật khẩu thành công!");
			
			onClose?.();
		} catch (err) {
			const apiError = err.response?.data?.error || err.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu.";
			setError(apiError);
		}
	};

	return (
		<div className="change-password-overlay" onClick={isMandatory ? undefined : handleClose}>
			<div className="change-password-dialog" onClick={(event) => event.stopPropagation()}>
				<div className="change-password-header">
					<h3>{isAdmin ? "Đặt lại mật khẩu" : "Đổi mật khẩu"}</h3>
					<button 
						className="change-password-close-btn" 
						onClick={handleClose}
						title={isMandatory ? "Hủy và Đăng xuất" : "Đóng"}
					>
						<X size={20} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className={`change-password-form role-${role}`}>
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

					{isMandatory && (
						<div className="mandatory-password-notice">
							<p><strong>Yêu cầu bảo mật:</strong> Bạn cần đổi mật khẩu mặc định trước khi có thể sử dụng hệ thống.</p>
						</div>
					)}

					{error ? <p className="change-password-error">{error}</p> : null}

					<div className="change-password-actions">
						{!isMandatory && (
							<button type="button" className="change-password-cancel" onClick={onClose}>
								Hủy
							</button>
						)}
						<button type="submit" className="change-password-submit">
							{isAdmin ? "Xác nhận đặt lại" : "Cập nhật"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

