import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiCalendar, FiClock, FiActivity, FiShield, FiAlertCircle } from "react-icons/fi";
import "./VpAcademicTimetable.css";

export default function VpAcademicTimetable() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    const stats = [
        { label: "Số tiết trong tuần", value: "1,240", icon: <FiCalendar /> },
        { label: "Xung đột lịch", value: "0", icon: <FiShield /> },
        { label: "Giáo viên chờ bù tiết", value: "12", icon: <FiAlertCircle /> },
    ];

    const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const slots = ["Tiết 1", "Tiết 2", "Tiết 3", "Tiết 4", "Tiết 5"];

    return (
        <div className="vp-timetable-premium">
            <PageHeader
                title="Khung Thời Khóa Biểu Chung"
                eyebrow="Góc nhìn kiểm soát vướng lịch, kẹt lịch và giám sát giảng dạy toàn trường"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            {/* Operations Summary */}
            <div className="timetable-ops-summary">
                {stats.map((s, i) => (
                    <div className="ops-card-vpa" key={i}>
                        <div className="ops-icon-vpa">{s.icon}</div>
                        <div className="ops-info-vpa">
                            <h4>{s.label}</h4>
                            <span>{s.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="timetable-grid-vpa">
                <div className="tt-header-vpa">
                    <div className="tt-col-vpa">Thời gian</div>
                    {days.map(day => <div key={day} className="tt-col-vpa">{day}</div>)}
                </div>
                
                <div className="tt-body-vpa">
                    {slots.map(slot => (
                        <div key={slot} className="tt-row-vpa">
                            <div className="tt-time-vpa">{slot}</div>
                            {days.map(day => (
                                <div key={day} className="tt-cell-vpa">
                                    <div className="tt-preview-box">Trống</div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
