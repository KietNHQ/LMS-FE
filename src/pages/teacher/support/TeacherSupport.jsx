import React from "react";
import SupportFormSection from "./components/supportFormSection/SupportFormSection";
import SupportHistorySection from "./components/supportHistorySection/SupportHistorySection";
import "./TeacherSupport.css";

export default function TeacherSupport() {
    return (
        <div className="teacher-support">
            <h1>Hỗ trợ</h1>
            <SupportFormSection />
            <SupportHistorySection />
        </div>
    );
}

