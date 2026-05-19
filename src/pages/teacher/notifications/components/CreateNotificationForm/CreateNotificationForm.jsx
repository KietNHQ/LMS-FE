import { useState, useEffect } from "react";
import { Send, AlertCircle, CheckCircle2, X } from "lucide-react";
import Select from "../../../../../components/ui/Select/Select";
import teacherService from "../../../../../services/pages/teacher/teacherService";
import "./CreateNotificationForm.css";

export default function CreateNotificationForm({ onClose }) {
    const [formData, setFormData] = useState({
        receiver: "homeroom",
        title: "",
        content: ""
    });
    const [status, setStatus] = useState("idle"); // idle, submitting, success, error
    const [errorMessage, setErrorMessage] = useState("");
    const [homeroomClass, setHomeroomClass] = useState(null);
    const [isLoadingClass, setIsLoadingClass] = useState(true);

    useEffect(() => {
        const fetchHomeroomClass = async () => {
            try {
                // Call actual backend to find homeroom classes for this teacher
                const response = await teacherService.getHomeroomClasses({
                    pathParams: { id: "me" },
                    mock: false
                });
                
                if (response.success && response.data && response.data.length > 0) {
                    setHomeroomClass(response.data[0]); // A teacher usually has 1 homeroom class in the current semester
                }
            } catch (err) {
                console.error("Failed to load teacher homeroom class:", err);
            } finally {
                setIsLoadingClass(false);
            }
        };

        fetchHomeroomClass();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim() || !formData.content.trim()) {
            return;
        }

        setStatus("submitting");
        setErrorMessage("");

        try {
            if (formData.receiver === "homeroom") {
                if (!homeroomClass) {
                    setStatus("error");
                    setErrorMessage("Bạn không chủ nhiệm lớp nào trong học kỳ này để có thể gửi thông báo lớp.");
                    return;
                }

                // Call real endpoint: POST /notifications/class/:id/broadcast
                const res = await teacherService.broadcastToClass({
                    pathParams: { id: homeroomClass.id },
                    body: {
                        title: formData.title,
                        content: formData.content,
                        sendEmail: true // Auto-notify via email as well
                    },
                    mock: false
                });

                if (res.success) {
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
                } else {
                    setStatus("error");
                    setErrorMessage(res.error || "Gửi thông báo lớp thất bại.");
                }
            } else if (formData.receiver === "admin") {
                // Call real support ticket API: POST /communications/tickets
                const res = await teacherService.createTicket({
                    body: {
                        category: "other",
                        subject: formData.title,
                        content: formData.content,
                        priority: "normal"
                    },
                    mock: false
                });

                if (res.success) {
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
                } else {
                    setStatus("error");
                    setErrorMessage(res.error || "Gửi yêu cầu đến Ban Giám Hiệu thất bại.");
                }
            }
        } catch (error) {
            console.error("Error submitting notification/ticket:", error);
            setStatus("error");
            setErrorMessage(error.response?.data?.error || error.message || "Lỗi kết nối máy chủ.");
        }
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

            {status === "error" && (
                <div className="create-notification-alert error">
                    <AlertCircle size={20} />
                    <span>{typeof errorMessage === 'object' ? errorMessage.message || JSON.stringify(errorMessage) : errorMessage || "Có lỗi xảy ra, vui lòng thử lại!"}</span>
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
                    {formData.receiver === "homeroom" && isLoadingClass && (
                        <span className="class-loading-hint">Đang kiểm tra thông tin lớp...</span>
                    )}
                    {formData.receiver === "homeroom" && !isLoadingClass && !homeroomClass && (
                        <div className="class-warning-hint">
                            <AlertCircle size={14} className="warning-icon" />
                            <span>Bạn hiện không có lớp chủ nhiệm được phân công. Không thể gửi thông báo lớp.</span>
                        </div>
                    )}
                    {formData.receiver === "homeroom" && !isLoadingClass && homeroomClass && (
                        <div className="class-success-hint">
                            <span>Lớp chủ nhiệm nhận thông báo: <strong>{homeroomClass.class_name || homeroomClass.name}</strong> ({homeroomClass.school_year})</span>
                        </div>
                    )}
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
                        disabled={status === "submitting" || !formData.title.trim() || !formData.content.trim() || (formData.receiver === "homeroom" && !isLoadingClass && !homeroomClass)}
                    >
                        <Send size={18} className="btn-icon" />
                        {status === "submitting" ? "Đang gửi..." : "Gửi"}
                    </button>
                </div>
            </form>
        </div>
    );
}




