import React from "react"
import "./ChildTabs.css"

const tabs = [
    { key: "overview", label: "Tổng quan" },
    { key: "attendance", label: "Điểm danh" },
    { key: "calendar", label: "Lịch học & Sự kiện" },
    { key: "grades", label: "Điểm số" },
    { key: "leave", label: "Đơn xin phép nghỉ" }
]

export default function ChildTabs({ activeTab, onChange }) {
    return (
        <div className="child-tabs">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    className={`child-tab-btn ${activeTab === tab.key ? "active" : ""}`}
                    onClick={() => onChange(tab.key)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    )
}
