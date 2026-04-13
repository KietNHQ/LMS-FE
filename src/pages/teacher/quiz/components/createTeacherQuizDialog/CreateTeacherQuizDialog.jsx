import React, { useState } from "react";
import { Modal, Select } from "../../../../../components/ui";
import { DEFAULT_PROFILE_BY_ROLE } from "../../../../../components/common/Dialog/ProfileDialog/profileData";
import {
    DEFAULT_QUIZ_DURATION_LABEL,
    QUIZ_DURATION_OPTIONS,
    formatDurationLabel,
} from "../../../../../services/shared/quiz/quizService";
import "./CreateTeacherQuizDialog.css";

const CURRENT_TEACHER = DEFAULT_PROFILE_BY_ROLE.teacher;
const CURRENT_TEACHER_NAME = CURRENT_TEACHER.name;
// "Toán học" → "Toán" to match subjectOptions
const CURRENT_TEACHER_SUBJECT = CURRENT_TEACHER.subject?.replace(" học", "") || "";

const defaultForm = {
    title: "",
    subject: CURRENT_TEACHER_SUBJECT,
    grade: "",
    className: "",
    duration: DEFAULT_QUIZ_DURATION_LABEL,
    createdByRole: "teacher",
    createdByName: CURRENT_TEACHER_NAME,
};

const TEACHER_CLASSES_BY_GRADE = {
    "Khối 10": ["10A1", "10A2", "10A3", "10A4"],
    "Khối 11": ["11B1", "11B2", "11B3"],
    "Khối 12": ["12A1", "12A2", "12A3"],
};

const gradeOptions = ["Khối 10", "Khối 11", "Khối 12"];
const durationOptions = QUIZ_DURATION_OPTIONS.map((item) => item.label);

export default function CreateTeacherQuizDialog({
    open,
    onClose,
    onSubmit,
    title = "Tạo bài kiểm tra",
    submitLabel = "Tạo",
    initialValues,
}) {
    const [formData, setFormData] = useState(() => ({
        title: initialValues?.title || defaultForm.title,
        subject: initialValues?.subject || defaultForm.subject,
        grade: initialValues?.grade || defaultForm.grade,
        className: initialValues?.className || defaultForm.className,
        duration: formatDurationLabel(initialValues?.duration || defaultForm.duration),
        createdByRole: "teacher",
        createdByName: initialValues?.createdByName || CURRENT_TEACHER_NAME,
    }));

    const handleChange = (key, value) => {
        setFormData((prev) => {
            const next = { ...prev, [key]: value };
            // Auto-clear class if grade changes
            if (key === "grade") {
                next.className = "";
            }
            return next;
        });
    };

    const handleSubmit = () => {
        const payload = {
            title: formData.title.trim(),
            subject: formData.subject.trim(),
            grade: formData.grade.trim(),
            className: formData.className.trim(),
            duration: formData.duration,
            createdByRole: "teacher",
            createdByName: formData.createdByName.trim() || CURRENT_TEACHER_NAME,
        };

        if (!payload.title || !payload.subject || !payload.grade || !payload.className || !payload.duration) {
            alert("Vui lòng điền đầy đủ tên bài kiểm tra, môn học, khối, lớp và thời lượng.");
            return;
        }

        onSubmit?.(payload);
    };

    return (
        <Modal open={open} onClose={onClose} title={title} className="teacher-create-quiz-dialog">
            <div className="teacher-create-quiz-dialog__content">
                <div className="teacher-create-quiz-dialog__field">
                    <label htmlFor="teacher-quiz-title">Tên bài kiểm tra</label>
                    <input
                        id="teacher-quiz-title"
                        type="text"
                        placeholder="Ví dụ: Kiểm tra Toán chương 3"
                        value={formData.title}
                        onChange={(event) => handleChange("title", event.target.value)}
                    />
                </div>

                <div className="teacher-create-quiz-dialog__field">
                    <label htmlFor="teacher-quiz-subject">Môn học</label>
                    <input
                        id="teacher-quiz-subject"
                        type="text"
                        value={formData.subject}
                        readOnly
                    />
                </div>


                <div className="teacher-create-quiz-dialog__field teacher-create-quiz-dialog__field--half">
                    <Select
                        label="Khối"
                        variant="custom"
                        className="teacher-create-quiz-dialog__select"
                        id="teacher-quiz-grade"
                        name="teacher-quiz-grade"
                        options={gradeOptions}
                        placeholder="Chọn khối"
                        value={formData.grade}
                        onChange={(event) => handleChange("grade", event.target.value)}
                    />
                </div>

                <div className="teacher-create-quiz-dialog__field teacher-create-quiz-dialog__field--half">
                    <Select
                        label="Lớp"
                        variant="custom"
                        className="teacher-create-quiz-dialog__select"
                        id="teacher-quiz-class"
                        name="teacher-quiz-class"
                        options={TEACHER_CLASSES_BY_GRADE[formData.grade] || []}
                        placeholder="Chọn lớp"
                        disabled={!formData.grade}
                        value={formData.className}
                        onChange={(event) => handleChange("className", event.target.value)}
                    />
                </div>

                <div className="teacher-create-quiz-dialog__field teacher-create-quiz-dialog__field--half">
                    <Select
                        label="Thời lượng"
                        variant="custom"
                        className="teacher-create-quiz-dialog__select"
                        id="teacher-quiz-duration"
                        name="teacher-quiz-duration"
                        options={durationOptions}
                        value={formData.duration}
                        onChange={(event) => handleChange("duration", event.target.value)}
                    />
                </div>

                <div className="teacher-create-quiz-dialog__actions">
                    <button type="button" className="teacher-create-quiz-dialog__cancel" onClick={onClose}>
                        Hủy
                    </button>
                    <button type="button" className="teacher-create-quiz-dialog__submit" onClick={handleSubmit}>
                        {submitLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}



