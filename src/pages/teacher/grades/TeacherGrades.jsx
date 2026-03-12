import React from "react";
import GradeListSection from "./components/gradeListSection/GradeListSection";
import GradeEntrySection from "./components/gradeEntrySection/GradeEntrySection";
import GradeSummarySection from "./components/gradeSummarySection/GradeSummarySection";
import "./TeacherGrades.css";

export default function TeacherGrades() {
    return (
        <div className="teacher-grades">
            <h1>Quản lý điểm</h1>
            <GradeEntrySection />
            <GradeSummarySection />
            <GradeListSection />
        </div>
    );
}

