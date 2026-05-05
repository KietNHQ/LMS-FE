import React, { useMemo } from "react";
import { FiSearch } from "react-icons/fi";
import Select from "../../../../../../../components/ui/Select/Select";
import "./UsersSearchFilterSort.css";

const tabs = ["Tất cả", "Quản lý", "Giáo viên", "Học sinh", "Phụ huynh"];

export default function UsersSearchFilterSort({
    searchValue,
    onSearchChange,
    quickRole,
    onQuickRoleChange,
    statusFilter,
    onStatusChange,
    children,
}) {
    const statusOptions = [
        { value: "Tất cả", label: "Tất cả trạng thái" },
        { value: "Hoạt động", label: "Đang hoạt động" },
        { value: "Vô hiệu hóa", label: "Vô hiệu hóa" },
    ];
    const roleOptions = useMemo(() => 
        tabs.map(tab => ({
            value: tab,
            label: tab === "Tất cả" ? "Tất cả vai trò" : tab
        })), []
    );

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
                <Select
                    variant="custom"
                    value={quickRole}
                    onChange={(e) => onQuickRoleChange(e.target.value)}
                    options={roleOptions}
                    className="users-quick-role-select"
                />

                <Select
                    variant="custom"
                    value={statusFilter}
                    onChange={(e) => onStatusChange(e.target.value)}
                    options={statusOptions}
                    className="users-status-select"
                />
                
                {children}
            </div>
        </div>
    );
}