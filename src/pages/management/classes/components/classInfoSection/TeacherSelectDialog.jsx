import React, { useMemo, useState, useEffect } from "react";
import "./TeacherSelectDialog.css";
import { teachersService } from "../../../../../services/pages/management/users/teachersService";

export default function TeacherSelectDialog({ onClose, onSelect, currentTeacher }) {
    const [searchText, setSearchText] = useState("");
    const [teachers, setTeachers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState("Tất cả môn");
    const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

    useEffect(() => {
        const loadTeachers = async () => {
            setIsLoading(true);
            try {
                const data = await teachersService.listTeachers();
                setTeachers(data);
            } catch (error) {
                console.error("Error loading teachers:", error);
                setTeachers([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadTeachers();
    }, []);

    const allSubjects = useMemo(() => {
        const subjects = new Set();
        teachers.forEach((teacher) => {
            if (teacher.subject) {
                teacher.subject.split(",").forEach((s) => subjects.add(s.trim()));
            }
        });
        return ["Tất cả môn", ...Array.from(subjects).sort()];
    }, [teachers]);

    const filteredTeachers = useMemo(() => {
        return teachers.filter((teacher) => {
            const matchesSearch = teacher.name
                .toLowerCase()
                .includes(searchText.toLowerCase());

            const matchesSubject =
                selectedSubject === "Tất cả môn" ||
                (teacher.subject && teacher.subject.includes(selectedSubject));

            return matchesSearch && matchesSubject;
        });
    }, [teachers, searchText, selectedSubject]);

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
                    {isLoading ? (
                        <div className="teacher-empty">Đang tải...</div>
                    ) : filteredTeachers.length > 0 ? (
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
                                        {teacher.subject || "—"}
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


