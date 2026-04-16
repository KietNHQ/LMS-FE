import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { 
    FiDollarSign, FiAlertCircle, FiTrendingUp, FiUsers, FiCheckSquare, 
    FiInfo, FiExternalLink, FiShield, FiPlus, FiZap, FiDownload, FiActivity 
} from "react-icons/fi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FinanceDashboard.css";

// Components
import PeriodClosingWizard from "./components/PeriodClosingWizard";

export default function FinanceDashboard() {
    const navigate = useNavigate();
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [isPeriodLocked, setIsPeriodLocked] = useState(false);
    const [showClosingWizard, setShowClosingWizard] = useState(false);
    const [expandedTask, setExpandedTask] = useState(null);

    const handleProcess = (type) => {
        switch(type) {
            case 'approval': navigate('/finance/approvals'); break;
            case 'reconcile': navigate('/finance/payment-hub'); break;
            case 'error': navigate('/finance/reports?tab=invoices'); break;
            default: break;
        }
    };

    const stats = {
        totalReceivable: 12950000000,
        totalRevenue: 12500000000,
        totalDebt: 450000000,
        collectionRate: 96.5,
        unpaidStudents: 52
    };

    const formatCompactNumber = (number) => {
        if (number >= 1000000000) {
            return (number / 1000000000).toFixed(2).replace(/\.00$/, '') + " Tỷ";
        }
        if (number >= 1000000) {
            return (number / 1000000).toFixed(0) + " Tr";
        }
        return number.toLocaleString();
    };

    const dailyTasks = [
        { 
            id: 1, 
            text: "Ký số hóa đơn cuối ngày", 
            count: 25, 
            priority: 'high',
            type: 'error',
            details: [
                { id: 'e1', label: 'Batch hóa đơn học phí tháng 10', count: 25 }
            ]
        },
        { 
            id: 2, 
            text: "Xử lý khoản báo có chưa đối soát", 
            count: 12, 
            priority: 'medium',
            type: 'reconcile',
            details: [
                { id: 'r1', label: 'Giao dịch Vietcombank 16/10', amount: '4,500,000đ' },
                { id: 'r2', label: 'Giao dịch BIDV 15/10', amount: '1,200,000đ' }
            ]
        },
        { 
            id: 3, 
            text: "Phê duyệt hồ sơ miễn giảm mới", 
            count: 5, 
            priority: 'low',
            type: 'approval',
            details: [
                { id: 'a1', label: 'Miễn giảm hộ nghèo (K10)', status: 'Chờ duyệt' },
                { id: 'a2', label: 'Giảm phí con thương binh (K12)', status: 'Chờ duyệt' }
            ]
        }
    ];

    const exceptions = [
        { id: 1, title: "Lệch sổ quỹ tiền mặt", detail: "Chênh lệch 200,000đ so với thực tế kiểm kê", severity: 'high', target: '/finance/audit-log' },
        { id: 2, title: "HS chưa có mã định danh", detail: "15 học sinh chưa thể xuất HĐĐT do thiếu thông tin", severity: 'medium', target: '/finance/reports?tab=invoices' }
    ];

    const toggleTask = (id) => {
        setExpandedTask(expandedTask === id ? null : id);
    };

    return (
        <div className="fin-dashboard">
            <div className="fin-dash-header-wrap">
                <PageHeader
                    title="Bảng Điều Khiển Tài Chính"
                    actions={
                        <SchoolYearTermSelector
                            selectedSchoolYear={selectedSchoolYear}
                            selectedTerm={selectedTerm}
                            onYearChange={handleYearArrow}
                            onTermChange={handleTermChange}
                        />
                    }
                />
                <div className="fin-system-status-row">
                    <div className="fin-system-status">
                        <span className={`status-dot ${isPeriodLocked ? 'locked' : 'open'}`}></span>
                        Trạng thái sổ: <strong>{isPeriodLocked ? "Đã Khóa" : "Đang Mở"}</strong>
                        <button 
                            className="btn-status-action" 
                            onClick={() => !isPeriodLocked && setShowClosingWizard(true)}
                        >
                            {isPeriodLocked ? <FiShield /> : "Chốt sổ"}
                        </button>
                    </div>
                </div>
            </div>


            {/* Quick Actions & Insights */}
            <div className="fin-control-bar">
                <div className="fin-quick-actions-pills">
                    <button className="btn-pill" onClick={() => navigate('/finance/fee-management?tab=batches')}>
                        <FiPlus /> Tạo đợt thu
                    </button>
                    <button className="btn-pill" onClick={() => navigate('/finance/payment-hub')}>
                        <FiZap /> Thu tiền nhanh
                    </button>
                    <button className="btn-pill ghost">
                        <FiDownload /> Xuất báo cáo nhanh
                    </button>
                </div>
                <div className="fin-today-insight">
                    <FiActivity /> 
                    <span>Hôm nay: <strong>+120 tr</strong> đã thu | <strong>25</strong> giao dịch | <strong>3</strong> HĐ chờ ký</span>
                </div>
            </div>

            <div className="fin-stats-grid v2">
                <div className="fin-stat-card info">
                    <div className="fin-stat-icon"><FiCheckSquare /></div>
                    <div className="fin-stat-body">
                        <p className="fin-stat-label">Tổng Phải Thu</p>
                        <h3 className="fin-stat-value">{formatCompactNumber(stats.totalReceivable)} ₫</h3>
                    </div>
                </div>
                <div className="fin-stat-card success">
                    <div className="fin-stat-icon"><FiTrendingUp /></div>
                    <div className="fin-stat-body">
                        <p className="fin-stat-label">Doanh Thu Đã Thu</p>
                        <h3 className="fin-stat-value fin-money-val">{formatCompactNumber(stats.totalRevenue)} ₫</h3>
                    </div>
                </div>
                <div className="fin-stat-card warning">
                    <div className="fin-stat-icon"><FiDollarSign /></div>
                    <div className="fin-stat-body">
                        <p className="fin-stat-label">Tổng Công Nợ</p>
                        <h3 className="fin-stat-value" style={{color: '#d97706'}}>{formatCompactNumber(stats.totalDebt)} ₫</h3>
                    </div>
                </div>

                <div className="fin-stat-card primary">
                    <div className="fin-stat-icon"><FiUsers /></div>
                    <div className="fin-stat-body">
                        <p className="fin-stat-label">Tỷ lệ Hoàn thành</p>
                        <h3 className="fin-stat-value">{stats.collectionRate}%</h3>
                    </div>
                </div>
                <div className="fin-stat-card danger">
                    <div className="fin-stat-icon"><FiAlertCircle /></div>
                    <div className="fin-stat-body">
                        <p className="fin-stat-label">Số HS Còn Nợ</p>
                        <h3 className="fin-stat-value" style={{color: '#dc2626'}}>{stats.unpaidStudents}</h3>
                    </div>
                </div>
            </div>
            
            <div className="fin-stacked-panels">
                <div className="fin-panel todo-panel full-row">
                    <div className="fin-panel-header">
                        <FiCheckSquare /> Việc cần làm
                    </div>
                    <div className="fin-todo-accordion">
                        {dailyTasks.map(t => (
                            <div key={t.id} className={`fin-todo-row priority-${t.priority} ${expandedTask === t.id ? 'expanded' : ''}`}>
                                <div className="todo-row-main" onClick={() => toggleTask(t.id)}>
                                    <div className="todo-label">
                                        <span className={`priority-marker ${t.priority}`}></span>
                                        <strong>{t.text}</strong>
                                        <span className="todo-count-badge">{t.count}</span>
                                    </div>
                                    <div className="todo-row-actions">
                                        <button 
                                            className="btn-action-mini" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleProcess(t.type);
                                            }}
                                        >
                                            Xử lý <FiExternalLink />
                                        </button>
                                        <span className="chevron-icon">
                                            <FiInfo />
                                        </span>
                                    </div>
                                </div>
                                {expandedTask === t.id && (
                                    <div className="todo-row-details">
                                        {t.details.map((d, idx) => (
                                            <div key={idx} className="todo-detail-item">
                                                <span>{d.label}</span>
                                                <span className="detail-status">{d.status || d.amount}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="fin-panel exception-panel footer-alert-panel">
                    <div className="fin-panel-header urgent-header">
                        <FiAlertCircle /> Cảnh báo ngoại lệ (Đối soát/Hệ thống)
                    </div>
                    <div className="fin-exception-grid">
                        {exceptions.map(e => (
                            <div 
                                key={e.id} 
                                className={`fin-exception-card clickable ${e.severity}`}
                                onClick={() => navigate(e.target)}
                            >
                                <div className="exc-icon">
                                    <FiAlertCircle />
                                </div>
                                <div className="exc-body">
                                    <strong>{e.title}</strong>
                                    <p>{e.detail}</p>
                                </div>
                                <div className="btn-fix-arrow">
                                    <FiExternalLink />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showClosingWizard && (
                <PeriodClosingWizard 
                    onClose={() => setShowClosingWizard(false)} 
                    onLockComplete={() => setIsPeriodLocked(true)}
                />
            )}
        </div>
    );
}
