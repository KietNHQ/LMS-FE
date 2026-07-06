import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiArrowRight, FiTrendingDown, FiMoreVertical } from "react-icons/fi";
import "./OperationalAlerts.css";

export default function OperationalAlerts({ alerts = [] }) {
    const navigate = useNavigate();
    const displayAlerts = alerts.slice(0, 4);

    return (
        <div className="operational-alerts">
            <div className="alerts-header-vpa">
                <h3>Cảnh báo Nghiệp vụ & Chất lượng</h3>
                <button className="btn-icon-vpa"><FiMoreVertical /></button>
            </div>

            <div className="alerts-container">
                {displayAlerts.length === 0 ? (
                    <div className="alert-card-vpa">
                        <h4>Chưa có cảnh báo nghiệp vụ</h4>
                        <p>Không có cảnh báo chuyên môn nào từ hệ thống trong bộ lọc hiện tại.</p>
                    </div>
                ) : displayAlerts.map(alert => (
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
