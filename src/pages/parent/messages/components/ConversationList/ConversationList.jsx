import React, { useMemo, useState } from "react";
import "./ConversationList.css";
import { FiSearch, FiUsers } from "react-icons/fi";

const normalizeText = (value) =>
    value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

export default function ConversationList({ onSelect, conversationList = [], isLoading = false }) {
    const [searchQuery, setSearchQuery] = useState("");

    // [CẢI TIẾN] Lấy danh sách giáo viên thực tế từ các con đã liên kết
    const teachersFromProfile = useMemo(() => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const localChildren = storedUser?.profile?.linkedStudents || 
                             storedUser?.linkedStudentIds || [];
        
        return localChildren
            .filter(c => c.id !== "child1" && c.name !== "Nguyễn Minh Tuấn")
            .map(c => ({
                id: c.teacherId || `teacher-${c.id || c.studentId}`,
                name: c.teacherName || "Giáo viên chủ nhiệm",
                className: c.className || c.class_name || "---"
            }))
            .filter((v, i, a) => a.findIndex(t => t.name === v.name) === i); // Lọc trùng giáo viên
    }, []);

    // Ưu tiên dữ liệu từ API tin nhắn, nếu không có thì lấy từ Profile con
    const teachers = conversationList.length > 0 ? conversationList : teachersFromProfile;

    const filteredTeachers = useMemo(() => {
        const query = normalizeText(searchQuery.trim());

        if (!query) {
            return teachers;
        }

        return teachers.filter((teacher) =>
            normalizeText(teacher.name || "").includes(query) ||
            normalizeText(teacher.className || "").includes(query)
        );
    }, [searchQuery, teachers]);

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
                {filteredTeachers.map((teacher) => (
                    <div
                        key={teacher.id}
                        className="conversation-item"
                        onClick={() => onSelect(teacher)}
                    >

                        <div className="avatar">
                            {teacher.name.charAt(0)}
                        </div>

                        <div className="conversation-info">
                            <div className="name">{teacher.name}</div>
                            <div className="child-count">Lớp chủ nhiệm: {teacher.className}</div>
                        </div>

                    </div>
                ))}

                {filteredTeachers.length === 0 && (
                    <div className="child-count">Không tìm thấy giáo viên phù hợp</div>
                )}
            </div>

        </div>
    );
}