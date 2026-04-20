import React from "react";
import { FiCalendar, FiClock } from "react-icons/fi";
import "./AcademicTimeline.css";

const TIMELINE_DATA = [
    { months: "T3 - T5", icon: "📋", title: "Chuẩn bị tuyển sinh", tasks: ["Rà soát chỉ tiêu", "Chuẩn bị biểu mẫu"] },
    { months: "T5 - T7", icon: "📥", title: "Tiếp nhận hồ sơ", tasks: ["Nhận hồ sơ lớp 10", "Đối chiếu dữ liệu"] },
    { months: "T7 - T8", icon: "🏫", title: "Ổn định đầu năm", tasks: ["Lập sổ đăng bộ", "Xếp lớp, TKB"] },
    { months: "T9 - T10", icon: "📈", title: "Ổn định sĩ số", tasks: ["Xử lý chuyển đi/đến", "Điểm danh chuyên cần"] },
    { months: "T11 - T12", icon: "🔍", title: "Rà soát hồ sơ", tasks: ["Kiểm lỗi học bạ", "Theo dõi kiểm tra"] },
    { months: "T1", icon: "📄", title: "Chốt học kỳ I", tasks: ["Khóa dữ liệu điểm", "In học bạ điện tử"] },
    { months: "T2 - T4", icon: "🔄", title: "Duy trì vận hành", tasks: ["Dạy bù, chuyển trường", "Chuẩn bị hồ sơ thi"] },
    { months: "T5", icon: "🏆", title: "Kết thúc năm học", tasks: ["Chốt đánh giá năm", "Xét khen thưởng/kỷ luật"] },
    { months: "T6 - T7", icon: "🎓", title: "Tốt nghiệp & Trả hồ sơ", tasks: ["Cấp GCN hoàn thành", "Trả bằng & giấy tờ"] },
];

export default function AcademicTimeline() {
    return (
        <div className="academic-timeline-container">
            <div className="timeline-header">
                <h3><FiCalendar /> Chu trình Học vụ hằng năm</h3>
                <span className="timeline-badge"><FiClock /> Năm học 2026 - 2027</span>
            </div>
            <div className="timeline-scroll-wrapper">
                <div className="timeline-track">
                    {TIMELINE_DATA.map((item, index) => (
                        <div key={index} className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                                <span className="time-range">{item.months}</span>
                                <div className="item-header">
                                    <span className="item-icon">{item.icon}</span>
                                    <h4>{item.title}</h4>
                                </div>
                                <ul className="item-tasks">
                                    {item.tasks.map((t, i) => <li key={i}>{t}</li>)}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
