import React, { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { 
    FiCheckCircle, FiAlertTriangle, FiUnlock, FiTrendingDown, 
    FiDatabase, FiBell, FiShield, FiMoreHorizontal,
    FiClock, FiCalendar, FiActivity
} from "react-icons/fi";
import VpActionQueue from "./components/VpActionQueue";
import OperationalAlerts from "./components/OperationalAlerts";
import "./VpAcademicDashboard.css";

export default function VpAcademicDashboard() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [cycle, setCycle] = useState("daily"); // daily, weekly, monthly

    // Top 4 Primary KPIs
    const primaryStats = [
        { label: "Tiến độ Nhập Điểm", value: "92.5%", trend: "+2.1%", status: "success", icon: <FiCheckCircle /> },
        { label: "Lớp/Môn Quá Hạn", value: "08", trend: "-2", status: "danger", icon: <FiAlertTriangle /> },
        { label: "Yêu cầu Chờ Duyệt", value: "05", trend: "+3", status: "warning", icon: <FiUnlock /> },
        { label: "Sụt giảm Chất lượng", value: "03", trend: "+1", status: "danger", icon: <FiTrendingDown /> },
    ];

    // Secondary Management KPIs
    const secondaryStats = [
        { label: "Môn chưa có dữ liệu", value: "02", icon: <FiDatabase /> },
        { label: "% Chốt sổ học kỳ", value: "65%", icon: <FiShield /> },
        { label: "Sửa điểm sau khóa", value: "12", icon: <FiActivity /> },
        { label: "Phụ huynh chưa báo", value: "15%", icon: <FiBell /> },
    ];

    return (
        <div className="vpa-cockpit">
            <PageHeader
                title="Trung Tâm Điều Hành Chuyên Môn"
                eyebrow="Phó Hiệu trưởng Chuyên môn - Buồng lái vận hành học vụ"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            {/* 1. Primary Cockpit Stats */}
            <div className="vpa-stats-grid-premium">
                {primaryStats.map((stat, i) => (
                    <div key={i} className={`vpa-stat-card-premium ${stat.status}`}>
                        <div className="vpa-card-top">
                            <div className="vpa-card-icon">{stat.icon}</div>
                            <span className="vpa-card-trend">{stat.trend}</span>
                        </div>
                        <div className="vpa-card-body">
                            <h3 className="vpa-card-value text-glow">{stat.value}</h3>
                            <p className="vpa-card-label">{stat.label}</p>
                        </div>
                        <div className="vpa-card-footer">
                            <button className="vpa-card-action">Xử lý ngay</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="vpa-main-layout">
                <div className="vpa-left-col">
                    {/* 2. Secondary Mini Stats */}
                    <div className="vpa-secondary-grid">
                        {secondaryStats.map((stat, i) => (
                            <div key={i} className="vpa-mini-card">
                                <div className="mini-card-icon">{stat.icon}</div>
                                <div className="mini-card-info">
                                    <span className="mini-card-value">{stat.value}</span>
                                    <span className="mini-card-label">{stat.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 3. Operational Cycle View */}
                    <div className="vpa-cycle-panel">
                        <div className="vpa-panel-header-v2">
                            <div className="header-text-v2">
                                <h3>Trình tự Nghiệp vụ</h3>
                                <p>Phối hợp điều hành theo chu trình thời gian</p>
                            </div>
                            <div className="cycle-tabs">
                                <button className={cycle === 'daily' ? 'active' : ''} onClick={() => setCycle('daily')}>Ngày</button>
                                <button className={cycle === 'weekly' ? 'active' : ''} onClick={() => setCycle('weekly')}>Tuần</button>
                                <button className={cycle === 'monthly' ? 'active' : ''} onClick={() => setCycle('monthly')}>Tháng</button>
                            </div>
                        </div>
                        
                        <div className="cycle-content">
                            <div className="cycle-todo-list">
                                {cycle === 'daily' && (
                                    <>
                                        <div className="cycle-todo-item urgent">
                                            <FiClock /> <span>Nhắc giáo viên 12A1 nộp điểm kiểm tra bù trước 17:00</span>
                                            <button className="btn-vpa-sm">Thực hiện</button>
                                        </div>
                                        <div className="cycle-todo-item">
                                            <FiUnlock /> <span>Duyệt yêu cầu mở khóa 10A2 (Đã trễ 2h)</span>
                                            <button className="btn-vpa-sm">Xử lý</button>
                                        </div>
                                    </>
                                )}
                                {cycle === 'weekly' && (
                                    <div className="cycle-todo-item">
                                        <FiCalendar /> <span>Review báo cáo tuần và gửi Hiệu trưởng</span>
                                        <button className="btn-vpa-sm">Gửi</button>
                                    </div>
                                )}
                                {cycle === 'monthly' && (
                                    <div className="cycle-todo-item">
                                        <FiShield /> <span>Chốt dữ liệu học bạ tháng 04/2026</span>
                                        <button className="btn-vpa-sm">Xem hồ sơ</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 4. Action Queue */}
                    <VpActionQueue />
                </div>

                <div className="vpa-right-col">
                    <OperationalAlerts />
                    
                    <div className="vpa-quick-ops">
                        <button className="btn-action-primary">
                            <FiCheckCircle /> Tạo gói trình ký Hiệu trưởng
                        </button>
                        <button className="btn-action-secondary">
                            <FiDatabase /> Đồng bộ CSDL Sở GD
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
