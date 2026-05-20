import React, { useMemo, useState } from "react";
import "./ConversationList.css";
import { FiSearch, FiUsers, FiChevronDown, FiChevronRight } from "react-icons/fi";

const normalizeText = (value) =>
    value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

export default function ConversationList({
    teacherList = [],
    selectedTeacher,
    onSelect,
    isLoading = false
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedTeachers, setExpandedTeachers] = useState({});

    const toggleExpand = (teacherId) => {
        setExpandedTeachers(prev => ({
            ...prev,
            [teacherId]: !prev[teacherId]
        }));
    };

    const filteredTeachers = useMemo(() => {
        const query = normalizeText(searchQuery.trim());

        if (!query) return teacherList;

        return teacherList.filter((teacher) =>
            normalizeText(teacher.name || "").includes(query) ||
            normalizeText(teacher.className || "").includes(query) ||
            teacher.children.some(c =>
                normalizeText(c.studentName || "").includes(query)
            )
        );
    }, [searchQuery, teacherList]);

    if (isLoading) {
        return (
            <div className="conversation-wrapper">
                <div className="conversation-header">
                    <FiUsers className="icon" />
                    <span>Giáo viên chủ nhiệm</span>
                </div>
                <div className="loading-state">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="conversation-wrapper">

            <div className="conversation-header">
                <FiUsers className="icon" />
                <span>Giáo viên chủ nhiệm</span>
            </div>

            <div className="search-box">
                <FiSearch className="search-icon"/>
                <input
                    placeholder="Tìm giáo viên hoặc lớp..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                />
            </div>

            <div className="conversation-list">
                {filteredTeachers.map((teacher) => {
                    const isExpanded = expandedTeachers[teacher.teacherId] === true;
                    const isSelected = selectedTeacher?.teacherId === teacher.teacherId;

                    // Format children names for subLabel
                    const childNames = teacher.children.map(c => c.studentName || c.student_name || "").slice(0, 3);
                    const extra = teacher.children.length > 3 ? `, +${teacher.children.length - 3}` : "";
                    const subLabel = `PH em: ${childNames.join(", ")}${extra}${teacher.className ? ` (${teacher.className})` : ""}`;

                    return (
                        <div key={teacher.teacherId} className="teacher-group">
                            {/* Teacher Row - click to select */}
                            <div
                                className={`conversation-item ${isSelected ? "active" : ""}`}
                                onClick={() => onSelect(teacher)}
                            >
                                <div className="avatar">
                                    {(teacher.name || "?").charAt(0)}
                                </div>

                                <div className="conversation-info">
                                    <div className="name">{teacher.name}</div>
                                    <div className="child-count">{subLabel}</div>
                                </div>

                                {teacher.children.length > 1 && (
                                    <div
                                        className="expand-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleExpand(teacher.teacherId);
                                        }}
                                    >
                                        {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                                    </div>
                                )}
                            </div>

                            {/* Expanded children list */}
                            {isExpanded && teacher.children.length > 1 && (
                                <div className="children-list">
                                    {teacher.children.map((child) => (
                                        <div
                                            key={child.studentId}
                                            className="child-item"
                                            onClick={() => onSelect(teacher)}
                                        >
                                            <div className="child-avatar">
                                                {(child.studentName || child.student_name || "?").charAt(0)}
                                            </div>
                                            <div className="child-info">
                                                <span className="child-name">{child.studentName || child.student_name}</span>
                                                {child.className || child.class_name ? (
                                                    <span className="child-class">Lớp {child.className || child.class_name}</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredTeachers.length === 0 && (
                    <div className="empty-state">Không tìm thấy giáo viên phù hợp</div>
                )}
            </div>

        </div>
    );
}
