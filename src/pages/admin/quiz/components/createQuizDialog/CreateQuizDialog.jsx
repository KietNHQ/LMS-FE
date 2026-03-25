import React, { useState } from "react";
import { Modal, Select } from "../../../../../components/ui";
import "./CreateQuizDialog.css";

const defaultForm = {
    title: "",
    subject: "",
    grade: "",
    createdByRole: "admin",
    createdByName: "",
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

const creatorOptions = [
    { value: "admin", label: "Admin" },
    { value: "teacher", label: "Giáo viên" },
];

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
        createdByRole: initialValues?.createdByRole || defaultForm.createdByRole,
        createdByName:
            initialValues?.createdByRole === "teacher"
                ? initialValues?.createdByName || ""
                : "",
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
            createdByRole: formData.createdByRole,
            createdByName:
                formData.createdByRole === "teacher"
                    ? formData.createdByName.trim()
                    : "Quản trị viên",
        };

        if (!payload.title || !payload.subject || !payload.grade) {
            alert("Vui lòng điền đầy đủ tên bài kiểm tra, môn học và khối.");
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
                    <Select
                        label="Người tạo bộ câu hỏi"
                        variant="custom"
                        className="create-quiz-dialog__select"
                        id="admin-quiz-creator-role"
                        name="admin-quiz-creator-role"
                        options={creatorOptions}
                        value={formData.createdByRole}
                        onChange={(event) => handleChange("createdByRole", event.target.value)}
                    />
                </div>

                {formData.createdByRole === "teacher" ? (
                    <div className="create-quiz-dialog__field">
                        <label htmlFor="admin-quiz-creator-name">Tên giáo viên</label>
                        <input
                            id="admin-quiz-creator-name"
                            type="text"
                            placeholder="Ví dụ: Lê Minh Hoàng"
                            value={formData.createdByName}
                            onChange={(event) => handleChange("createdByName", event.target.value)}
                        />
                    </div>
                ) : null}

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


