import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import "./ManagementUsers.css";

// Import components and hooks
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { useCheckPermission } from "../../../hooks/useAuth";

// Import sub-pages
import AllUsers from "./tabs/all/AllUsers";
import ManagementTeachers from "./tabs/teachers/ManagementTeachers";
import ManagementStudents from "./tabs/students/ManagementStudents";
import ManagementParents from "./tabs/parents/ManagementParents";
import ManagementManagers from "./tabs/managers/ManagementManagers";

const TABS = [
    { id: "all",      label: "Tất cả",          title: "Quản lý tất cả Người dùng",           component: AllUsers      },
    { id: "managers", label: "Cán bộ Quản lý", title: "Danh sách Cán bộ Quản lý & Nhân sự", component: ManagementManagers },
    { id: "teachers", label: "Giáo viên",       title: "Quản lý Giáo viên",                  component: ManagementTeachers },
    { id: "students", label: "Học sinh",        title: "Quản lý Học sinh",                   component: ManagementStudents },
    { id: "parents",  label: "Phụ huynh",       title: "Quản lý Phụ huynh",                  component: ManagementParents  },
];

export default function ManagementUsers() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTabId = searchParams.get("tab") || "all";
    
    // Lifted state for Header
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [itemCount, setItemCount] = useState(0);

    const { hasPermission, user: currentUser } = useCheckPermission();

    const activeTab = TABS.find((tab) => tab.id === activeTabId) || TABS[0];
    const ActiveComponent = activeTab.component;

    const handleTabChange = (tabId) => {
        setSearchParams({ tab: tabId });
    };

    return (
        <div className="admin-users-hub">
            <PageHeader
                title={activeTab.title}
                eyebrow={`Tổng cộng: ${itemCount} tài khoản`}
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="admin-users-hub__tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        className={`admin-users-hub__tab ${activeTabId === tab.id ? "active" : ""}`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="admin-users-hub__content">
                <ActiveComponent 
                    onCountChange={setItemCount}
                    schoolYear={selectedSchoolYear}
                    term={selectedTerm}
                    hasPermission={hasPermission}
                    currentUser={currentUser}
                />
            </div>
        </div>
    );
}

