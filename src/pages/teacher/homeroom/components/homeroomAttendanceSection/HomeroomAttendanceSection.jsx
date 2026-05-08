import React, { useState } from "react";
import { FiCheckCircle, FiXCircle, FiClock, FiCalendar } from "react-icons/fi";
import { Select } from "../../../../../components/ui";
import "./HomeroomAttendanceSection.css";

const STATUS_LABELS = {
    present: "Có mặt",
    absent: "Vắng mặt",
    late: "Đi trễ",
};

const ATTENDANCE_STATUS_OPTIONS = [
    { value: "present", label: "Có mặt" },
    { value: "absent", label: "Vắng mặt" },
    { value: "late", label: "Đi trễ" },
];

const DEFAULT_NOTES = {
    present: "",
    absent: "Ốm",
    late: "Kẹt xe",
};

export default function HomeroomAttendanceSection({ data }) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [attendanceOverrides, setAttendanceOverrides] = useState({});
    const [editingStudentId, setEditingStudentId] = useState(null);
    const [editDraft, setEditDraft] = useState({ status: "present", note: "" });

    if (!data || !data.students) return null;

    // Mock attendance data generator based on date
    const getAttendanceMock = (students, date) => {
        // Just deterministic pseudo-random based on string length to keep it consistent
        return students.map((student) => {
            const seed = student.id + date.charCodeAt(date.length - 1);
            let status = "present";
            if (seed % 10 === 0) status = "absent";
            else if (seed % 15 === 0) status = "late";

            return {
                ...student,
                attendanceStatus: status,
                note: DEFAULT_NOTES[status],
            };
        });
    };

    const getMergedAttendanceData = () => {
        const baseData = getAttendanceMock(data.students, selectedDate);
        const dateOverrides = attendanceOverrides[selectedDate] || {};

        return baseData.map((student) => {
            const override = dateOverrides[student.id];
            if (!override) return student;

            return {
                ...student,
                attendanceStatus: override.attendanceStatus,
                note: override.note,
            };
        });
    };

    const attendanceData = getMergedAttendanceData();
    const presentCount = attendanceData.filter((s) => s.attendanceStatus === "present").length;
    const absentCount = attendanceData.filter((s) => s.attendanceStatus === "absent").length;
    const lateCount = attendanceData.filter((s) => s.attendanceStatus === "late").length;

    const startEdit = (student) => {
        setEditingStudentId(student.id);
        setEditDraft({
            status: student.attendanceStatus,
            note: student.note || "",
        });
    };

    const cancelEdit = () => {
        setEditingStudentId(null);
        setEditDraft({ status: "present", note: "" });
    };

    const saveEdit = (studentId) => {
        const nextStatus = editDraft.status;
        const nextNote = editDraft.note.trim() || DEFAULT_NOTES[nextStatus];

        setAttendanceOverrides((prev) => {
            const prevDateOverrides = prev[selectedDate] || {};
            return {
                ...prev,
                [selectedDate]: {
                    ...prevDateOverrides,
                    [studentId]: {
                        attendanceStatus: nextStatus,
                        note: nextNote,
                    },
                },
            };
        });

        cancelEdit();
    };

    return (
        <div className="homeroom-attendance-section">
            <div className="attendance-header">
                <h2>Theo dõi chuyên cần</h2>
                <div className="date-picker-wrapper">
                    <FiCalendar className="date-icon" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            cancelEdit();
                        }}
                        className="attendance-date-picker"
                    />
                </div>
            </div>

            <div className="attendance-stats">
                <div className="attendance-stat-card present">
                    <div className="stat-icon"><FiCheckCircle /></div>
                    <div className="stat-info">
                        <span className="stat-label">Có mặt</span>
                        <span className="stat-value">{presentCount}</span>
                    </div>
                </div>
                <div className="attendance-stat-card absent">
                    <div className="stat-icon"><FiXCircle /></div>
                    <div className="stat-info">
                        <span className="stat-label">Vắng mặt</span>
                        <span className="stat-value">{absentCount}</span>
                    </div>
                </div>
                <div className="attendance-stat-card late">
                    <div className="stat-icon"><FiClock /></div>
                    <div className="stat-info">
                        <span className="stat-label">Đi trễ</span>
                        <span className="stat-value">{lateCount}</span>
                    </div>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="attendance-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>HỌC SINH</th>
                            <th>TRẠNG THÁI</th>
                            <th>GHI CHÚ</th>
                            <th>THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceData.map((student, index) => {
                            const isEditing = editingStudentId === student.id;

                            return (
                                <tr key={student.id}>
                                    <td className="student-index-cell">{index + 1}</td>
                                    <td>
                                        <div className="student-main-info">
                                            <span className="student-avatar">
                                                {student.name.charAt(0).toUpperCase()}
                                            </span>
                                            <span className="student-name">{student.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {isEditing ? (
                                            <Select
                                                variant="custom"
                                                className="attendance-status-select"
                                                value={editDraft.status}
                                                options={ATTENDANCE_STATUS_OPTIONS}
                                                onChange={(e) => {
                                                    const nextStatus = e.target.value;
                                                    setEditDraft((prev) => ({
                                                        ...prev,
                                                        status: nextStatus,
                                                        note: prev.note || DEFAULT_NOTES[nextStatus],
                                                    }));
                                                }}
                                            />
                                        ) : (
                                            <span className={`status-pill ${student.attendanceStatus}`}>
                                                {STATUS_LABELS[student.attendanceStatus]}
                                            </span>
                                        )}
                                    </td>
                                    <td className="note-cell">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="attendance-note-input"
                                                value={editDraft.note}
                                                onChange={(e) => setEditDraft((prev) => ({ ...prev, note: e.target.value }))}
                                                placeholder="Nhập ghi chú..."
                                            />
                                        ) : (
                                            student.note || "-"
                                        )}
                                    </td>
                                    <td>
                                        {isEditing ? (
                                            <div className="attendance-row-actions">
                                                <button type="button" className="edit-btn save-btn" onClick={() => saveEdit(student.id)}>
                                                    Lưu
                                                </button>
                                                <button type="button" className="edit-btn cancel-btn" onClick={cancelEdit}>
                                                    Hủy
                                                </button>
                                            </div>
                                        ) : (
                                            <button type="button" className="edit-btn" onClick={() => startEdit(student)}>
                                                Cập nhật
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}




