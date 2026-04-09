import React, { useState } from "react";
import { Modal, Select } from "../../../../../components/ui";
import { parseDurationMinutes } from "../../../../../services/shared/quiz/quizService";
import "./CreateQuizDialog.css";

const defaultForm = {
    title: "",
    subject: "",
    grade: "",
    duration: "45",
    examFormat: "Trắc nghiệm",
    examType: "Thường xuyên",
    createdByRole: "admin",
    createdByName: "",
};

const gradeOptions = ["Khối 10", "Khối 11", "Khối 12"];
const subjectOptions = [
    "Ngữ văn",
    "Toán",
    "Ngoại ngữ",
    "Vật lý",
    "Hóa học",
    "Sinh học",
    "Lịch sử",
    "Địa lý",
    "GD Kinh tế & Pháp luật",
    "Tin học",
    "Công nghệ",
];

const formatOptions = ["Trắc nghiệm", "Tự luận", "Trắc nghiệm và tự luận"];
const examTypeOptions = ["Thường xuyên", "Giữa kỳ", "Cuối kỳ"];

export default function CreateQuizDialog({
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
        duration: String(parseDurationMinutes(initialValues?.duration || defaultForm.duration)),
        examFormat: initialValues?.examFormat || defaultForm.examFormat,
        examType: initialValues?.examType || defaultForm.examType,
        createdByRole: initialValues?.createdByRole || defaultForm.createdByRole,
        createdByName:
            initialValues?.createdByRole === "teacher"
                ? initialValues?.createdByName || ""
                : "",
    }));

    const handleChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        const payload = {
            title: formData.title.trim(),
            subject: formData.subject.trim(),
            grade: formData.grade.trim(),
            duration: formData.duration ? `${formData.duration} phút` : "",
            examFormat: formData.examFormat,
            examType: formData.examType,
            createdByRole: formData.createdByRole,
            createdByName: "Quản trị viên",
        };

        if (!payload.title || !payload.subject || !payload.grade || !formData.duration || !payload.examType) {
            alert("Vui lòng điền đầy đủ tên bài kiểm tra, môn học, thời gian, khối và loại bài kiểm tra.");
            return;
        }

        if (payload.createdByRole === "teacher" && !payload.createdByName) {
            alert("Vui lòng nhập tên giáo viên tạo bộ câu hỏi.");
            return;
        }

        onSubmit?.(payload);
    };

    return (
        <Modal open={open} onClose={onClose} title={title} className="create-quiz-dialog">
            <div className="create-quiz-dialog__content">
                <div className="create-quiz-dialog__field">
                    <label htmlFor="admin-quiz-title">Tên bài kiểm tra</label>
                    <input
                        id="admin-quiz-title"
                        type="text"
                        placeholder="Ví dụ: Kiểm tra Toán chương 3"
                        value={formData.title}
                        onChange={(event) => handleChange("title", event.target.value)}
                    />
                </div>

                <div className="create-quiz-dialog__row">
                    <div className="create-quiz-dialog__field">
                        <Select
                            label="Môn học"
                            variant="custom"
                            className="create-quiz-dialog__select"
                            id="admin-quiz-subject"
                            name="admin-quiz-subject"
                            options={subjectOptions}
                            placeholder="Chọn môn học"
                            searchable
                            searchPlaceholder="Tìm môn học..."
                            value={formData.subject}
                            onChange={(event) => handleChange("subject", event.target.value)}
                        />
                    </div>

                    <div className="create-quiz-dialog__field">
                        <label htmlFor="admin-quiz-duration">Thời gian (phút)</label>
                        <input
                            id="admin-quiz-duration"
                            type="number"
                            min="1"
                            placeholder="60"
                            value={formData.duration}
                            onChange={(event) => handleChange("duration", event.target.value)}
                        />
                    </div>
                </div>

                <div className="create-quiz-dialog__field">
                    <Select
                        label="Hình thức làm bài"
                        variant="custom"
                        className="create-quiz-dialog__select"
                        id="admin-quiz-format"
                        name="admin-quiz-format"
                        options={formatOptions}
                        value={formData.examFormat}
                        onChange={(event) => handleChange("examFormat", event.target.value)}
                    />
                </div>

                <div className="create-quiz-dialog__field">
                    <Select
                        label="Khối"
                        variant="custom"
                        className="create-quiz-dialog__select"
                        id="admin-quiz-grade"
                        name="admin-quiz-grade"
                        options={gradeOptions}
                        placeholder="Chọn khối"
                        value={formData.grade}
                        onChange={(event) => handleChange("grade", event.target.value)}
                    />
                </div>

                <div className="create-quiz-dialog__field">
                    <Select
                        label="Loại bài kiểm tra"
                        variant="custom"
                        className="create-quiz-dialog__select"
                        id="admin-quiz-exam-type"
                        name="admin-quiz-exam-type"
                        options={examTypeOptions}
                        value={formData.examType}
                        onChange={(event) => handleChange("examType", event.target.value)}
                    />
                </div>

                <div className="create-quiz-dialog__actions">
                    <button type="button" className="create-quiz-dialog__cancel" onClick={onClose}>
                        Hủy
                    </button>
                    <button type="button" className="create-quiz-dialog__submit" onClick={handleSubmit}>
                        {submitLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

