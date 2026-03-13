import React, { useMemo, useState } from "react";
import "./ConversationList.css";
import { FiSearch, FiUsers } from "react-icons/fi";

const parents = [
    {
        id: 1,
        name: "Nguyễn Văn Phụ Huynh",
        children: 2
    },
    {
        id: 2,
        name: "Trần Thị Lan Anh",
        children: 2
    }
];

const normalizeText = (value) =>
    value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

export default function ConversationList({ onSelect }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredParents = useMemo(() => {
        const query = normalizeText(searchQuery.trim());

        if (!query) {
            return parents;
        }

        return parents.filter((parent) =>
            normalizeText(parent.name).includes(query)
        );
    }, [searchQuery]);

    return (
        <div className="conversation-wrapper">

            <div className="conversation-header">
                <FiUsers className="icon" />
                <span>Danh sách phụ huynh</span>
            </div>

            <div className="search-box">
                <FiSearch className="search-icon"/>
                <input
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                />
            </div>

            <div className="conversation-list">
                {filteredParents.map((p) => (
                    <div
                        key={p.id}
                        className="conversation-item"
                        onClick={() => onSelect(p)}
                    >

                        <div className="avatar">
                            {p.name.charAt(0)}
                        </div>

                        <div className="conversation-info">
                            <div className="name">{p.name}</div>
                            <div className="child-count">{p.children} con</div>
                        </div>

                    </div>
                ))}

                {filteredParents.length === 0 && (
                    <div className="child-count">Không tìm thấy phụ huynh phù hợp</div>
                )}
            </div>

        </div>
    );
}