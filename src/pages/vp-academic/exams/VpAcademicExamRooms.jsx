import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiGrid, FiClock, FiUsers, FiHome, FiEdit3, FiInfo } from "react-icons/fi";
import "./VpAcademicExamRooms.css";

export default function VpAcademicExamRooms() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("rooms");

    const stats = [
        { label: "Tổng số phòng", value: "15", icon: <FiHome />, color: "#34d399" },
        { label: "Cán bộ coi thi", value: "30", icon: <FiUsers />, color: "#3b82f6" },
        { label: "Tổng thí sinh", value: "450", icon: <FiUsers />, color: "#8b5cf6" },
    ];

    const rooms = [
        { id: "P01", name: "Phòng 101", students: 30, supervisors: ["Nguyễn Văn A", "Trần Thị B"], status: "Đã xếp" },
        { id: "P02", name: "Phòng 102", students: 30, supervisors: ["Lê Văn C", "Phạm Thị D"], status: "Đã xếp" },
        { id: "P03", name: "Phòng 103", students: 30, supervisors: ["Hoàng Văn E", "Vũ Thị F"], status: "Đã xếp" },
        { id: "P04", name: "Phòng 104", students: 25, supervisors: ["Đặng Văn G", "Bùi Thị H"], status: "Chưa đủ" },
        { id: "P05", name: "Phòng 201", students: 30, supervisors: ["Ngô Văn I", "Lý Thị K"], status: "Đã xếp" },
        { id: "P06", name: "Phòng 202", students: 30, supervisors: ["Phan Văn L", "Đỗ Thị M"], status: "Đã xếp" },
    ];

    const schedule = [
        { time: "07:30 - 09:30", subject: "Toán học", date: "25/11/2026", type: "Tự luận", status: "Sẵn sàng" },
        { time: "14:00 - 15:30", subject: "Ngữ văn", date: "25/11/2026", type: "Tự luận", status: "Sẵn sàng" },
        { time: "08:00 - 09:00", subject: "Tiếng Anh", date: "26/11/2026", type: "Trắc nghiệm", status: "Chưa chốt" },
        { time: "14:00 - 15:30", subject: "Vật lý", date: "26/11/2026", type: "Trắc nghiệm", status: "Chưa chốt" },
    ];

    return (
        <div className="vpa-exam-rooms">
            <div className="vpa-rooms-header">
                <button className="back-btn" onClick={() => navigate("/vp-academic/exams")}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-info">
                    <h1>Phân phòng & Lịch thi</h1>
                    <span className="exam-name">Thi Giữa Học Kỳ II - Khối 12</span>
                </div>
            </div>

            <div className="vpa-rooms-stats">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: stat.color + '20', color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-details">
                            <span className="label">{stat.label}</span>
                            <span className="value">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="vpa-rooms-tabs">
                <button 
                    className={`tab-item ${activeTab === 'rooms' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rooms')}
                >
                    <FiGrid /> Danh sách phòng thi
                </button>
                <button 
                    className={`tab-item ${activeTab === 'schedule' ? 'active' : ''}`}
                    onClick={() => setActiveTab('schedule')}
                >
                    <FiClock /> Lịch thi chi tiết
                </button>
            </div>

            <div className="vpa-rooms-content">
                {activeTab === 'rooms' ? (
                    <div className="rooms-grid">
                        {rooms.map((room, i) => (
                            <div key={i} className="room-card">
                                <div className="room-header">
                                    <h3>{room.name}</h3>
                                    <span className={`status-pill ${room.status === 'Đã xếp' ? 'ok' : 'warn'}`}>
                                        {room.status}
                                    </span>
                                </div>
                                <div className="room-body">
                                    <div className="body-row">
                                        <FiUsers /> <span>Sĩ số: <strong>{room.students} thí sinh</strong></span>
                                    </div>
                                    <div className="body-row proctors">
                                        <FiEdit3 /> 
                                        <div className="proctor-list">
                                            <span>Giám thị:</span>
                                            {room.supervisors.map((s, idx) => <strong key={idx}>{s}</strong>)}
                                        </div>
                                    </div>
                                </div>
                                <div className="room-footer">
                                    <button className="btn-action-small">Điều chỉnh</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="schedule-table-wrapper">
                        <table className="vpa-schedule-table">
                            <thead>
                                <tr>
                                    <th>Thời gian</th>
                                    <th>Môn thi</th>
                                    <th>Ngày thi</th>
                                    <th>Hình thức</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.map((item, i) => (
                                    <tr key={i}>
                                        <td className="time-cell">{item.time}</td>
                                        <td className="subject-cell">{item.subject}</td>
                                        <td>{item.date}</td>
                                        <td><span className="type-tag">{item.type}</span></td>
                                        <td>
                                            <span className={`status-dot ${item.status === 'Sẵn sàng' ? 'green' : 'amber'}`}></span>
                                            {item.status}
                                        </td>
                                        <td>
                                            <button className="btn-icon-vpa"><FiInfo /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
