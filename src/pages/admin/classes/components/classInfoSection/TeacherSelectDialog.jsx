import React, { useMemo, useState } from "react";
import "./TeacherSelectDialog.css";

const teacherDatabase = [
    { id: 1, name: "Trần Thị Hương", subjects: ["Toán", "Vật lý"] },
    { id: 2, name: "Lê Văn Minh", subjects: ["Toán", "Hóa học"] },
    { id: 3, name: "Phạm Thị Lan", subjects: ["Sinh học", "Tiếng Anh"] },
    { id: 4, name: "Nguyễn Văn A", subjects: ["Ngữ văn", "Lịch sử"] },
    { id: 5, name: "Võ Thị B", subjects: ["Địa lý", "Vật lý"] },
    { id: 6, name: "Hoàng Văn C", subjects: ["Tiếng Anh", "Toán"] },
];

const allSubjects = ["Tất cả môn", "Toán", "Vật lý", "Hóa học", "Sinh học", "Ngữ văn", "Tiếng Anh", "Lịch sử", "Địa lý"];

export default function TeacherSelectDialog({ onClose, onSelect, currentTeacher }) {
    const [searchText, setSearchText] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("Tất cả môn");
    const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

    const filteredTeachers = useMemo(() => {
        return teacherDatabase.filter((teacher) => {
            // Lọc theo tìm kiếm
            const matchesSearch = teacher.name
                .toLowerCase()
                .includes(searchText.toLowerCase());

            // Lọc theo môn
            const matchesSubject =
                selectedSubject === "Tất cả môn" ||
                teacher.subjects.includes(selectedSubject);

            return matchesSearch && matchesSubject;
        });
    }, [searchText, selectedSubject]);

    return (
        <div className="teacher-select-overlay" onClick={onClose}>
            <div className="teacher-select-modal" onClick={(e) => e.stopPropagation()}>
                <div className="teacher-select-header">
                    <h3>Chọn giáo viên chủ nhiệm</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="teacher-select-filters">
                    <input
                        type="text"
                        placeholder="Tìm kiếm giáo viên..."
                        className="teacher-search"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <div className="subject-dropdown-wrapper">
                        <button
                            type="button"
                            className="subject-dropdown-trigger"
                            onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                        >
                            <span>{selectedSubject}</span>
                            <span className={`dropdown-chevron ${isSubjectDropdownOpen ? "open" : ""}`}>▼</span>
                        </button>
                        {isSubjectDropdownOpen && (
                            <div className="subject-dropdown-menu">
                                {allSubjects.map((subject) => (
                                    <button
                                        key={subject}
                                        type="button"
                                        className={`subject-dropdown-item ${
                                            selectedSubject === subject ? "active" : ""
                                        }`}
                                        onClick={() => {
                                            setSelectedSubject(subject);
                                            setIsSubjectDropdownOpen(false);
                                        }}
                                    >
                                        {subject}
                                        {selectedSubject === subject && <span className="check-icon">✓</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="teacher-list">
                    {filteredTeachers.length > 0 ? (
                        filteredTeachers.map((teacher) => (
                            <button
                                key={teacher.id}
                                className={`teacher-item ${
                                    currentTeacher === teacher.name ? "active" : ""
                                }`}
                                onClick={() => {
                                    onSelect(teacher.name);
                                    onClose();
                                }}
                            >
                                <div className="teacher-info">
                                    <div className="teacher-name">{teacher.name}</div>
                                    <div className="teacher-subjects">
                                        {teacher.subjects.join(", ")}
                                    </div>
                                </div>
                                {currentTeacher === teacher.name && (
                                    <div className="teacher-check">✓</div>
                                )}
                            </button>
                        ))
                    ) : (
                        <div className="teacher-empty">
                            Không tìm thấy giáo viên phù hợp
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


