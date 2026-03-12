import React from "react";
import LessonListSection from "./components/lessonListSection/LessonListSection";
import CreateEditLessonSection from "./components/createEditLessonSection/CreateEditLessonSection";
import LessonFilterSection from "./components/lessonFilterSection/LessonFilterSection";
import "./TeacherLessons.css";

export default function TeacherLessons() {
    return (
        <div className="teacher-lessons">
            <h1>Bài học</h1>
            <LessonFilterSection />
            <CreateEditLessonSection />
            <LessonListSection />
        </div>
    );
}

