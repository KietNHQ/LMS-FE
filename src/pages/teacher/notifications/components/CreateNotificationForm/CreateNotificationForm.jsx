import { useState } from "react";
import { Send, AlertCircle, CheckCircle2, X } from "lucide-react";
import Select from "../../../../../components/ui/Select/Select";
import "./CreateNotificationForm.css";
export default function CreateNotificationForm({ onClose }) {
    const [formData, setFormData] = useState({
        receiver: "homeroom",
        title: "",
        content: ""
    });
    const [status, setStatus] = useState("idle"); // idle, submitting, success, error

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.title.trim() || !formData.content.trim()) {
            return;
        }

        setStatus("submitting");

        // Simulate API call
        setTimeout(() => {
            setStatus("success");
            setFormData({
                receiver: "homeroom",
                title: "",
                content: ""
            });
            
            setTimeout(() => {
                setStatus("idle");
                if (onClose) onClose();
            }, 2000);
        }, 1000);
    };

    return (
        <div className="create-notification-form-container">
            <div className="create-notification-header">
                <div>
                    <h2>Soạn thông báo / Yêu cầu</h2>
                    <p>Gửi thông báo cho lớp chủ nhiệm hoặc gửi yêu cầu đến ban giám hiệu.</p>
                </div>
                {onClose && (
                    <button className="create-notification-close" onClick={onClose} type="button">
                        <X size={20} />
                    </button>
                )}
            </div>

            {status === "success" && (
                <div className="create-notification-alert success">
                    <CheckCircle2 size={20} />
                    <span>Gửi thành công!</span>
                </div>
            )}

            <form className="create-notification-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <Select
                        variant="custom"
                        id="receiver"
                        name="receiver"
                        label="Gửi đến"
                        value={formData.receiver}
                        onChange={handleChange}
                        options={[
                            { value: "homeroom", label: "Lớp chủ nhiệm (Gửi thông báo lớp)" },
                            { value: "admin", label: "Ban Giám Hiệu (Gửi yêu cầu hỗ trợ)" }
                        ]}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="title">Tiêu đề</label>
                    <input 
                        type="text" 
                        id="title" 
                        name="title" 
                        placeholder="Nhập tiêu đề..."
                        value={formData.title}
                        onChange={handleChange}
                        className="form-control premium-input"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="content">Nội dung</label>
                    <textarea 
                        id="content" 
                        name="content" 
                        placeholder="Nhập nội dung chi tiết..."
                        value={formData.content}
                        onChange={handleChange}
                        className="form-control premium-input"
                        rows="6"
                        required
                    />
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className={`submit-btn ${status === 'submitting' ? 'loading' : ''}`}
                        disabled={status === "submitting" || !formData.title.trim() || !formData.content.trim()}
                    >
                        <Send size={18} className="btn-icon" />
                        {status === "submitting" ? "Đang gửi..." : "Gửi"}
                    </button>
                </div>
            </form>
        </div>
    );
}
