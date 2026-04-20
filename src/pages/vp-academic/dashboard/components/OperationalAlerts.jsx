import React from "react";
import { FiAlertCircle, FiArrowRight, FiInfo, FiTrendingDown, FiMoreVertical } from "react-icons/fi";
import "./OperationalAlerts.css";

const ALERTS_DATA = [
    { id: 1, type: "quality", title: "Sụt giảm chất lượng môn Toán", desc: "Khối 10 giảm 1.2 điểm trung bình so với kỳ trước.", severity: "high" },
    { id: 2, type: "data", title: "Thiếu dữ liệu điểm môn Văn", desc: "Lớp 11A5 chưa nhập điểm kiểm tra cuối kỳ.", severity: "medium" },
    { id: 3, type: "process", title: "Hành vi chỉnh sửa điểm bất thường", desc: "Phát hiện 15 lượt sửa điểm sau khóa tại lớp 12A2.", severity: "high" },
];

export default function OperationalAlerts() {
    return (
        <div className="operational-alerts">
            <div className="alerts-header-vpa">
                <h3>Cảnh báo Nghiệp vụ & Chất lượng</h3>
                <button className="btn-icon-vpa"><FiMoreVertical /></button>
            </div>

            <div className="alerts-container">
                {ALERTS_DATA.map(alert => (
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
                            <button className="btn-vpa-resolve">
                                Xử lý ngay <FiArrowRight />
                            </button>
                            <button className="btn-vpa-ignore">Phớt lờ</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="audit-ticker">
                <div className="ticker-label"><FiInfo /> Nhật ký mới nhất:</div>
                <div className="ticker-content">
                    <span>• 10:15 - GV. Nguyễn Y đã sửa điểm 12A1</span>
                    <span>• 09:45 - Đã mở khóa 10A2 thành công</span>
                </div>
            </div>
        </div>
    );
}
