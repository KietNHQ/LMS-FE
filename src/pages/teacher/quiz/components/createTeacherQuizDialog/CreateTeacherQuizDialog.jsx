import React, { useState } from "react";
import { Modal, Select } from "../../../../../components/ui";
import { DEFAULT_PROFILE_BY_ROLE } from "../../../../../components/common/Dialog/ProfileDialog/profileData";
import "./CreateTeacherQuizDialog.css";

const CURRENT_TEACHER = DEFAULT_PROFILE_BY_ROLE.teacher;
const CURRENT_TEACHER_NAME = CURRENT_TEACHER.name;
// "Toán học" → "Toán" to match subjectOptions
const CURRENT_TEACHER_SUBJECT = CURRENT_TEACHER.subject?.replace(" học", "") || "";

const defaultForm = {
    title: "",
    subject: CURRENT_TEACHER_SUBJECT,
    grade: "",
    createdByRole: "teacher",
    createdByName: CURRENT_TEACHER_NAME,
};

const gradeOptions = ["Khối 10", "Khối 11", "Khối 12"];
const subjectOptions = [
    "Toán",
    "Ngữ Văn",
    "Tiếng Anh",
    "Vật Lý",
    "Hóa Học",
    "Sinh Học",
    "Lịch Sử",
    "Địa Lý",
    "Tin Học",
];

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
        createdByRole: "teacher",
        createdByName: initialValues?.createdByName || CURRENT_TEACHER_NAME,
    }));

    const handleChange = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSubmit = () => {
        const payload = {
            title: formData.title.trim(),
            subject: formData.subject.trim(),
            grade: formData.grade.trim(),
            createdByRole: "teacher",
            createdByName: formData.createdByName.trim() || CURRENT_TEACHER_NAME,
        };

        if (!payload.title || !payload.subject || !payload.grade) {
            alert("Vui lòng điền đầy đủ tên bài kiểm tra, môn học và khối.");
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

                <div className="teacher-create-quiz-dialog__field">
                    <label htmlFor="teacher-quiz-creator-name">Giáo viên</label>
                    <input
                        id="teacher-quiz-creator-name"
                        type="text"
                        value={formData.createdByName}
                        readOnly
                    />
                </div>

                <div className="teacher-create-quiz-dialog__field">
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
