import React, { useMemo, useState } from "react";
import "./AttendanceSection.css";

export default function AttendanceSection({ data, compact = false }) {
    const [activePeriod, setActivePeriod] = useState("week");

    const periodData = useMemo(() => {
        if (activePeriod === "month") {
            return data.monthlySummary || {};
        }
        return data.weeklySummary || {};
    }, [activePeriod, data.monthlySummary, data.weeklySummary]);

    const periodRecords = activePeriod === "month"
        ? (data.monthlyRecords || data.records || [])
        : (data.weeklyRecords || data.records || []);

    return (
        <div className={`attendance-card ${compact ? "compact" : ""}`}>
            <div className="attendance-heading">
                <div className="attendance-heading-text">
                    <h3>Điểm danh</h3>
                    <p>Theo dõi chuyên cần của con theo tuần hoặc tháng.</p>
                </div>
            </div>

            <div className="attendance-period-switch" role="tablist" aria-label="Bộ lọc kỳ điểm danh">
                <button
                    type="button"
                    className={`attendance-switch-btn ${activePeriod === "week" ? "active" : ""}`}
                    onClick={() => setActivePeriod("week")}
                >
                    Tuần
                </button>
                <button
                    type="button"
                    className={`attendance-switch-btn ${activePeriod === "month" ? "active" : ""}`}
                    onClick={() => setActivePeriod("month")}
                >
                    Tháng
                </button>
            </div>

            <div className="attendance-period-summary">
                <div className="attendance-period-title">
                    {activePeriod === "week" ? "Tổng quan tuần" : "Tổng quan tháng"}
                </div>
                <div className="attendance-period-text">
                    Tổng số buổi: <strong>{periodData.total || 0}</strong>
                </div>
            </div>

            <div className="attendance-record-list">
                {periodRecords.map((item, index) => (
                    <div key={index} className="attendance-record-item">
                        <span>{item.day}</span>
                        <strong className={item.status.toLowerCase().replace(/\s+/g, "-")}>
                            {item.status}
                        </strong>
                    </div>
                ))}
            </div>

            <div className="attendance-stats">
                <div className="attendance-stat present">
                    <span>Có mặt</span>
                    <strong>{periodData.present || 0}</strong>
                </div>

                <div className="attendance-stat absent">
                    <span>Vắng mặt</span>
                    <strong>{periodData.absent || 0}</strong>
                </div>

                <div className="attendance-stat late">
                    <span>Đi muộn</span>
                    <strong>{periodData.late || 0}</strong>
                </div>
            </div>


        </div>
    );
}