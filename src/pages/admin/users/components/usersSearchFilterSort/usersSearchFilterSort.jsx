import React from "react";
import { FiSearch } from "react-icons/fi";
import "./UsersSearchFilterSort.css";

const tabs = ["Tất cả", "Admin", "Giáo viên", "Học sinh", "Phụ huynh"];

export default function UsersSearchFilterSort({
                                                  searchValue,
                                                  onSearchChange,
                                                  quickRole,
                                                  onQuickRoleChange,
                                                  children,
                                              }) {
    return (
        <div className="users-search-filter-sort">
            <div className="users-search-box">
                <FiSearch />
                <input
                    type="text"
                    placeholder="Tìm kiếm tên, email..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="users-role-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`users-role-tab ${quickRole === tab ? "active" : ""}`}
                        onClick={() => onQuickRoleChange(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div style={{ marginLeft: 'auto' }}>
                {children}
            </div>
        </div>
    );
}