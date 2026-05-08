import React, { useState, useRef, useEffect } from "react";
import { FiSearch, FiChevronDown, FiPlus } from "react-icons/fi";
import "./QuizToolbar.css";

export default function QuizToolbar({
    searchTerm,
    selectedSubject,
    selectedGrade,
    subjectOptions,
    gradeOptions,
    onSearchChange,
    onSubjectChange,
    onGradeChange,
    onCreateClick,
    children
}) {
    const [isSubjectOpen, setIsSubjectOpen] = useState(false);
    const [subjectSearchTerm, setSubjectSearchTerm] = useState("");
    const [isGradeOpen, setIsGradeOpen] = useState(false);
    const subjectRef = useRef(null);
    const gradeRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (subjectRef.current && !subjectRef.current.contains(event.target)) {
                setIsSubjectOpen(false);
                setSubjectSearchTerm("");
            }
            if (gradeRef.current && !gradeRef.current.contains(event.target)) {
                setIsGradeOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="admin-quiz-toolbar-card">
            <div className="admin-quiz-search-box">
                <FiSearch className="admin-quiz-search-icon" />
                <input
                    type="text"
                    placeholder="Tìm theo tên bài kiểm tra, mô tả..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="admin-quiz-filter-wrap">
                <div className="admin-quiz-custom-select" ref={subjectRef}>
                    <div
                        className="admin-quiz-custom-select-trigger"
                        onClick={() => {
                            setIsSubjectOpen(!isSubjectOpen);
                            setIsGradeOpen(false);
                        }}
                    >
                        <span>{selectedSubject}</span>
                        <FiChevronDown className={`admin-quiz-select-icon ${isSubjectOpen ? 'open' : ''}`} />
                    </div>
                    {isSubjectOpen && (
                        <div className="admin-quiz-custom-select-options">
                            <div className="admin-quiz-dropdown-search">
                                <FiSearch />
                                <input
                                    type="text"
                                    placeholder="Tìm môn..."
                                    value={subjectSearchTerm}
                                    onChange={(e) => setSubjectSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            {subjectOptions
                                .filter((item) => item.toLowerCase().includes(subjectSearchTerm.toLowerCase()))
                                .map((item) => (
                                    <div
                                        key={item}
                                        className={`admin-quiz-custom-select-option ${selectedSubject === item ? 'active' : ''}`}
                                        onClick={() => {
                                            onSubjectChange(item);
                                            setIsSubjectOpen(false);
                                            setSubjectSearchTerm("");
                                        }}
                                    >
                                        {item}
                                    </div>
                            ))}
                            {subjectOptions.filter((item) => item.toLowerCase().includes(subjectSearchTerm.toLowerCase())).length === 0 && (
                                <div className="admin-quiz-custom-select-option" style={{ pointerEvents: 'none', color: '#94a3b8' }}>
                                    Không tìm thấy
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="admin-quiz-custom-select" ref={gradeRef}>
                    <div
                        className="admin-quiz-custom-select-trigger"
                        onClick={() => {
                            setIsGradeOpen(!isGradeOpen);
                            setIsSubjectOpen(false);
                        }}
                    >
                        <span>{selectedGrade}</span>
                        <FiChevronDown className={`admin-quiz-select-icon ${isGradeOpen ? 'open' : ''}`} />
                    </div>
                    {isGradeOpen && (
                        <div className="admin-quiz-custom-select-options">
                            {gradeOptions.map((item) => (
                                <div
                                    key={item}
                                    className={`admin-quiz-custom-select-option ${selectedGrade === item ? 'active' : ''}`}
                                    onClick={() => {
                                        onGradeChange(item);
                                        setIsGradeOpen(false);
                                    }}
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            <button className="admin-quiz-create-account-btn" onClick={onCreateClick} style={{ height: '3.4rem', borderRadius: '1rem', padding: '0 1.5rem', marginLeft: '0.7rem' }}>
                <FiPlus style={{ marginRight: '0.5rem', fontSize: '1.2rem' }} />
                Tạo bài kiểm tra
            </button>
        </div>
    );
}

