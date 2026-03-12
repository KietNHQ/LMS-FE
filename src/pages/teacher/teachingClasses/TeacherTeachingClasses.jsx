import React from "react";
import ClassListSection from "./components/classListSection/ClassListSection";
import ClassDetailSection from "./components/classDetailSection/ClassDetailSection";
import ClassStudentsSection from "./components/classStudentsSection/ClassStudentsSection";
import "./TeacherTeachingClasses.css";

export default function TeacherTeachingClasses() {
    return (
        <div className="teacher-teaching-classes">
            <h1>Lớp giảng dạy</h1>
            <ClassListSection />
            <ClassDetailSection />
            <ClassStudentsSection />
        </div>
    );
}

