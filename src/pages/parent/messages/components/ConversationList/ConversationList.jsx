import React, { useMemo, useState } from "react";
import "./ConversationList.css";
import { FiSearch, FiUsers } from "react-icons/fi";

const teachers = [
    {
        id: 1,
        name: "Cô Trần Thị Lan Anh",
        className: "10A1"
    },
    {
        id: 2,
        name: "Thầy Lê Minh Hoàng",
        className: "11A2"
    }
];

const normalizeText = (value) =>
    value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

export default function ConversationList({ onSelect }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTeachers = useMemo(() => {
        const query = normalizeText(searchQuery.trim());

        if (!query) {
            return teachers;
        }

        return teachers.filter((teacher) =>
            normalizeText(teacher.name).includes(query) ||
            normalizeText(teacher.className).includes(query)
        );
    }, [searchQuery]);

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