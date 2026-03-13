import React from "react";
import "./LeaveRequestSection.css";

export default function LeaveRequestSection() {
    const requests = [
        {
            title: "Sốt cao và nghỉ tại nhà",
            date: "2026-03-01",
            approvedBy: "Giáo viên chủ nhiệm",
            status: "approved",
            statusText: "Đã duyệt",
        },
        {
            title: "Công việc của gia đình",
            date: "2026-03-08",
            approvedBy: "—",
            status: "pending",
            statusText: "Đang chờ",
        },
        {
            title: "Khám sức khỏe",
            date: "2026-03-10",
            approvedBy: "Văn phòng nhà trường",
            status: "rejected",
            statusText: "Bị từ chối",
        },
    ];

    return (
        <div className="leave-card">

            <div className="section-heading">
                <h3>Đơn xin phép</h3>
                <p>Theo dõi các đơn xin phép đã gửi và trạng thái duyệt.</p>
            </div>

            <div className="leave-list">
                {requests.map((item, index) => (
                    <div key={index} className="leave-item">

                        <div className="leave-info">
                            <strong>{item.title}</strong>

                            <span>
                {item.date} • Được duyệt bởi: {item.approvedBy}
              </span>
                        </div>

                        <div className={`leave-status ${item.status}`}>
                            {item.statusText}
                        </div>

                    </div>
                ))}
            </div>



        </div>
    );
}