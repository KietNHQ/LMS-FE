import React from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiArrowRight, FiTrendingDown, FiMoreVertical } from "react-icons/fi";
import "./OperationalAlerts.css";

const ALERTS_DATA = [
    { 
        id: 1, 
        type: "quality", 
        title: "Sụt giảm chất lượng môn Toán", 
        desc: "Khối 10 giảm 1.2 điểm trung bình so với kỳ trước.", 
        severity: "high",
        path: "/vp-academic/grades"
    },
    { 
        id: 2, 
        type: "data", 
        title: "Thiếu dữ liệu điểm môn Văn", 
        desc: "Lớp 11A5 chưa nhập điểm kiểm tra cuối kỳ.", 
        severity: "medium",
        path: "/vp-academic/grades"
    },
    { 
        id: 3, 
        type: "process", 
        title: "Hành vi chỉnh sửa điểm bất thường", 
        desc: "Phát hiện 15 lượt sửa điểm sau khóa tại lớp 12A2.", 
        severity: "high",
        path: "/vp-academic/approvals"
    },
    { 
        id: 4, 
        type: "quality", 
        title: "Tỷ lệ chuyên môn Khối 11", 
        desc: "Có sự biến động nhẹ về tiến độ nhập liệu.", 
        severity: "medium",
        path: "/vp-academic/teaching-assignment"
    },
    { 
        id: 5, 
        type: "process", 
        title: "Quá hạn nộp giáo án", 
        desc: "Tổ Lý chưa hoàn thành nộp giáo án tuần 22.", 
        severity: "high",
        path: "/vp-academic/timetable"
    },
];

export default function OperationalAlerts() {
    const navigate = useNavigate();
    
    // Luôn hiển thị tối đa 4 cảnh báo mới nhất
    const displayAlerts = ALERTS_DATA.slice(0, 4);

    return (
        <div className="operational-alerts">
            <div className="alerts-header-vpa">
                <h3>Cảnh báo Nghiệp vụ & Chất lượng</h3>
                <button className="btn-icon-vpa"><FiMoreVertical /></button>
            </div>

            <div className="alerts-container">
                {displayAlerts.map(alert => (
                    <div key={alert.id} className={`alert-card-vpa ${alert.severity}`}>
                        <div className="alert-vpa-top">
                            <div className="alert-type-badge">
                                {alert.type === 'quality' ? <FiTrendingDown /> : <FiAlertCircle />}
                                {alert.type === 'quality' ? 'Chất lượng' : 'Quy trình'}
                            </div>
                            <span className={`severity-tag ${alert.severity}`}>{alert.severity === 'high' ? 'Khẩn cấp' : 'Cảnh báo'}</span>
                        </div>
                        
                        <h4>{alert.title}</h4>
                        <p>{alert.desc}</p>

                        <div className="alert-vpa-actions">
                            <button 
                                className="btn-vpa-resolve"
                                onClick={() => navigate(alert.path)}
                            >
                                Xử lý ngay <FiArrowRight />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

