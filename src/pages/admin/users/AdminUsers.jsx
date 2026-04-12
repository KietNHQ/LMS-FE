import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./AdminUsers.css";

// Import components and hooks
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";

// Import sub-pages
import AllUsers from "./tabs/all/AllUsers";
import AdminTeachers from "./tabs/teachers/AdminTeachers";
import AdminStudents from "./tabs/students/AdminStudents";
import AdminParents from "./tabs/parents/AdminParents";

const TABS = [
    { id: "all", label: "Tất cả", title: "Quản lý tất cả Người dùng", component: AllUsers },
    { id: "teachers", label: "Giáo viên", title: "Quản lý Giáo viên", component: AdminTeachers },
    { id: "students", label: "Học sinh", title: "Quản lý Học sinh", component: AdminStudents },
    { id: "parents", label: "Phụ huynh", title: "Quản lý Phụ huynh", component: AdminParents },
];

export default function AdminUsers() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTabId = searchParams.get("tab") || "all";
    
    // Lifted state for Header
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [itemCount, setItemCount] = useState(0);

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
                />
            </div>
        </div>
    );
}
