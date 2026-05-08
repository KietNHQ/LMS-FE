import React, { useState } from "react";
import TeacherStructure from "./components/TeacherStructure";

/**
 * Component này để test TeacherStructure locally
 * Copy vào browser hoặc dùng Storybook
 *
 * Usage: npm run dev -> http://localhost:5173/test-teacher-structure
 */

const mockTeacherData = {
    total: 85,
    distribution: [
        { subject: "Toán - Tin", count: 18 },
        { subject: "Ngôn Ngữ", count: 20 },
        { subject: "Tự Nhiên", count: 15 }
    ]
};

export default function TeacherStructureTest() {
    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <h1>🧪 Test: Teacher Structure Component</h1>

            <div style={{
                background: "#f5f5f5",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "2rem",
                border: "1px solid #ddd"
            }}>
                <h2 style={{ margin: "0 0 1rem 0", fontSize: "16px", color: "#666" }}>
                    📝 Instructions
                </h2>
                <ul style={{ margin: "0", paddingLeft: "20px", color: "#666", fontSize: "14px", lineHeight: "1.8" }}>
                    <li>Click on each <strong>subject block</strong> to expand/collapse</li>
                    <li>View the <strong>teacher table</strong> with all details</li>
                    <li>Test <strong>Edit (✏️)</strong> and <strong>Delete (🗑️)</strong> buttons</li>
                    <li>Check <strong>responsive design</strong> by resizing window</li>
                    <li>Verify <strong>status badges</strong> (Active=Green, Inactive=Red)</li>
                </ul>
            </div>

            {/* Component to test */}
            <TeacherStructure teacherData={mockTeacherData} />

            {/* Debug info */}
            <div style={{
                marginTop: "2rem",
                padding: "1rem",
                background: "#f0f7ff",
                borderRadius: "8px",
                border: "1px solid #b3d9ff",
                fontSize: "12px",
                fontFamily: "monospace"
            }}>
                <h3 style={{ margin: "0 0 0.5rem 0", color: "#0066cc" }}>🔍 Debug Info</h3>
                <pre style={{ margin: "0", whiteSpace: "pre-wrap", wordBreak: "break-all", color: "#333" }}>
{JSON.stringify({
    componentPath: "src/pages/principal/overview/components/TeacherStructure.jsx",
    cssPath: "src/pages/principal/overview/components/TeacherStructure.css",
    mockDataTeachers: "14 teachers across 3 subjects",
    totalTeachers: mockTeacherData.total,
    subjects: mockTeacherData.distribution,
    features: [
        "Expandable/Collapsible subjects",
        "Table with teacher details",
        "Edit & Delete buttons",
        "Status badges",
        "Avatar with gradient",
        "Responsive design",
        "Smooth animations"
    ]
}, null, 2)}
                </pre>
            </div>

            {/* Features checklist */}
            <div style={{
                marginTop: "2rem",
                padding: "1rem",
                background: "#f0fff4",
                borderRadius: "8px",
                border: "1px solid #9ae6b4"
            }}>
                <h3 style={{ margin: "0 0 1rem 0", color: "#22543d" }}>✅ Features Implemented</h3>
                <ul style={{
                    margin: "0",
                    paddingLeft: "20px",
                    color: "#22543d",
                    lineHeight: "2"
                }}>
                    <li>✅ Full list of subjects (not just 3)</li>
                    <li>✅ Dropdown arrows (ChevronUp/Down icons)</li>
                    <li>✅ Table with teacher details</li>
                    <li>✅ Teacher info: Name, Email, Phone, Homeroom Class, Status</li>
                    <li>✅ Edit & Delete action buttons</li>
                    <li>✅ Avatar with gradient background</li>
                    <li>✅ Status badges (Active/Inactive)</li>
                    <li>✅ Responsive design (Desktop/Tablet/Mobile)</li>
                    <li>✅ Smooth animations & transitions</li>
                    <li>✅ Mock data with 14 real teachers</li>
                </ul>
            </div>

            {/* Next steps */}
            <div style={{
                marginTop: "2rem",
                padding: "1rem",
                background: "#fff5e6",
                borderRadius: "8px",
                border: "1px solid #ffc069"
            }}>
                <h3 style={{ margin: "0 0 1rem 0", color: "#7c4400" }}>🚀 Next Steps</h3>
                <ol style={{
                    margin: "0",
                    paddingLeft: "20px",
                    color: "#7c4400",
                    lineHeight: "2"
                }}>
                    <li>Create API service to fetch teacher data</li>
                    <li>Replace mock data with real API calls</li>
                    <li>Add handleEdit & handleDelete callbacks</li>
                    <li>Connect to teacher modal/form</li>
                    <li>Test with actual database</li>
                    <li>Add loading/error states</li>
                    <li>Implement search & filter</li>
                </ol>
            </div>
        </div>
    );
}


