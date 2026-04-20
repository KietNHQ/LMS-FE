import React, { useState, useMemo } from "react";
import {
    FiChevronDown,
    FiChevronUp,
    FiUsers,
    FiEye,
} from "react-icons/fi";
import ProfileDialog from "../../../../components/common/Dialog/ProfileDialog/ProfileDialog";
import "./TeacherStructure.css";

function getAvatarLetter(name) {
    if (!name) return "G";
    return name.trim().charAt(0).toUpperCase();
}

export default function TeacherStructure({
    teacherData = {},
    onViewTeacher,
}) {
    const [expandedSubject, setExpandedSubject] = useState(null);
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
    const [selectedTeacherProfile, setSelectedTeacherProfile] = useState(null);

    // Mock expanded data - ngoài thực tế bạn sẽ fetch từ API
    const teachersBySubject = {
        "Toán - Tin": [
            { id: 1, name: "Thầy Nguyễn Văn A", email: "a.nguyen@school.edu", phone: "0912345678", homeroomClass: "10A1", status: "Hoạt động" },
            { id: 2, name: "Cô Trần Thị B", email: "b.tran@school.edu", phone: "0923456789", homeroomClass: "—", status: "Hoạt động" },
            { id: 3, name: "Thầy Lê Văn C", email: "c.le@school.edu", phone: "0934567890", homeroomClass: "11A2", status: "Hoạt động" },
            { id: 4, name: "Cô Phạm Thị D", email: "d.pham@school.edu", phone: "0945678901", homeroomClass: "—", status: "Hoạt động" },
            { id: 5, name: "Thầy Hoàng Văn E", email: "e.hoang@school.edu", phone: "0956789012", homeroomClass: "12A1", status: "Tạm khóa" },
        ],
        "Ngôn Ngữ": [
            { id: 6, name: "Cô Võ Thị F", email: "f.vo@school.edu", phone: "0967890123", homeroomClass: "10A2", status: "Hoạt động" },
            { id: 7, name: "Thầy Dương Văn G", email: "g.duong@school.edu", phone: "0978901234", homeroomClass: "—", status: "Hoạt động" },
            { id: 8, name: "Cô Bùi Thị H", email: "h.bui@school.edu", phone: "0989012345", homeroomClass: "11A1", status: "Hoạt động" },
            { id: 9, name: "Thầy Cao Văn I", email: "i.cao@school.edu", phone: "0990123456", homeroomClass: "—", status: "Hoạt động" },
        ],
        "Tự Nhiên": [
            { id: 10, name: "Thầy Đặng Văn J", email: "j.dang@school.edu", phone: "0901234567", homeroomClass: "10A3", status: "Hoạt động" },
            { id: 11, name: "Cô Nông Thị K", email: "k.nong@school.edu", phone: "0912345679", homeroomClass: "—", status: "Hoạt động" },
            { id: 12, name: "Thầy Lương Văn L", email: "l.luong@school.edu", phone: "0923456780", homeroomClass: "11A3", status: "Hoạt động" },
            { id: 13, name: "Cô Từ Thị M", email: "m.tu@school.edu", phone: "0934567891", homeroomClass: "—", status: "Hoạt động" },
            { id: 14, name: "Thầy Hứa Văn N", email: "n.hua@school.edu", phone: "0945678902", homeroomClass: "12A2", status: "Hoạt động" },
        ],
    };

    const subjects = useMemo(() => {
        return Object.entries(teachersBySubject).map(([subject, teachers]) => ({
            subject,
            count: teachers.length,
        }));
    }, []);

    const toggleSubject = (subject) => {
        setExpandedSubject(expandedSubject === subject ? null : subject);
    };

    const handleViewTeacher = (teacher, subjectName) => {
        if (onViewTeacher) {
            onViewTeacher(teacher);
        }

        setSelectedTeacherProfile({
            name: teacher.name,
            phone: teacher.phone || "—",
            subject: subjectName,
            homeroomClass: teacher.homeroomClass || "—",
            email: teacher.email || "—",
            achievements: teacher.achievements,
        });
        setIsProfileDialogOpen(true);
    };

    return (
        <div className="teacher-structure-section">
            <h3 className="ts-section-title">
                <FiUsers /> Cơ cấu Nhân sự (Tổng {teacherData.total || 85} GV)
            </h3>

            <div className="ts-subjects-list">
                {subjects.map((item) => {
                    const isExpanded = expandedSubject === item.subject;
                    const subjectPanelId = `ts-panel-${item.subject.replace(/\s+/g, "-").toLowerCase()}`;

                    return (
                    <div
                        key={item.subject}
                        className={`ts-subject-block ${isExpanded ? "is-expanded" : ""}`}
                    >
                        <div
                            className="ts-subject-header"
                            onClick={() => toggleSubject(item.subject)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    toggleSubject(item.subject);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-expanded={isExpanded}
                            aria-controls={subjectPanelId}
                        >
                            <div className="ts-subject-info">
                                <span className="ts-subject-name">{item.subject}</span>
                                <span className="ts-subject-count">{item.count} GV</span>
                            </div>
                            <button type="button" className="ts-toggle-btn" aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}>
                                {isExpanded ? (
                                    <FiChevronUp />
                                ) : (
                                    <FiChevronDown />
                                )}
                            </button>
                        </div>

                        {isExpanded && (
                            <div className="ts-teachers-dropdown" id={subjectPanelId}>
                                <div className="ts-teachers-table-wrap">
                                    <table className="ts-teachers-table">
                                        <thead>
                                            <tr>
                                                <th>GIÁO VIÊN</th>
                                                <th>EMAIL</th>
                                                <th>SĐT</th>
                                                <th>LỚP CHỦ NHIỆM</th>
                                                <th>TRẠNG THÁI</th>
                                                <th className="ts-actions-col">THAO TÁC</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {teachersBySubject[item.subject]?.map((teacher) => (
                                                <tr key={teacher.id}>
                                                    <td>
                                                        <div className="ts-teacher-info">
                                                            <div className="ts-teacher-avatar">
                                                                {getAvatarLetter(teacher.name)}
                                                            </div>
                                                            <div className="ts-teacher-name">
                                                                {teacher.name}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="ts-email">{teacher.email}</td>
                                                    <td>{teacher.phone || "—"}</td>
                                                    <td>
                                                        <span
                                                            className={`ts-homeroom-badge ${
                                                                teacher.homeroomClass === "—"
                                                                    ? "inactive"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {teacher.homeroomClass}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`ts-status-badge ${
                                                                teacher.status === "Hoạt động"
                                                                    ? "active"
                                                                    : "inactive"
                                                            }`}
                                                        >
                                                            {teacher.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="ts-row-actions">
                                                            <button
                                                                type="button"
                                                                className="ts-icon-btn view"
                                                                aria-label={`Xem hồ sơ ${teacher.name}`}
                                                                title="Xem hồ sơ"
                                                                aria-haspopup="dialog"
                                                                onClick={() => handleViewTeacher(teacher, item.subject)}
                                                            >
                                                                <FiEye />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                    );
                })}
            </div>

            <ProfileDialog
                open={isProfileDialogOpen}
                role="teacher"
                themeRole="admin"
                profile={selectedTeacherProfile}
                onClose={() => setIsProfileDialogOpen(false)}
            />
        </div>
    );
}

