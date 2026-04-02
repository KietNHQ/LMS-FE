import React from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
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
        <div className="users-toolbar-card">
            <div className="users-search-box">
                <FiSearch className="users-search-icon" />
                <input
                    type="text"
                    placeholder="Tìm kiếm tên, email..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="users-filter-group">
                <div className="users-custom-select">
                    <select 
                        value={quickRole} 
                        onChange={(e) => onQuickRoleChange(e.target.value)}
                    >
                        {tabs.map((tab) => (
                            <option key={tab} value={tab}>
                                {tab === "Tất cả" ? "Tất cả vai trò" : tab}
                            </option>
                        ))}
                    </select>
                    <FiChevronDown className="users-select-arrow" />
                </div>
                
                {children}
            </div>
        </div>
    );
}