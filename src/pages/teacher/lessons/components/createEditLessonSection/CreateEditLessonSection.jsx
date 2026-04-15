import React from "react";
import "./CreateEditLessonSection.css";

const PERIOD_OPTIONS = [
    "Tiết 1",
    "Tiết 2",
    "Tiết 3",
    "Tiết 4",
    "Tiết 5",
    "Tiết 6",
    "Tiết 7",
    "Tiết 8",
    "Tiết 9",
    "Tiết 10",
];

export default function CreateEditLessonSection({
    subject,
    formValues,
    classes,
    onChangeForm,
    isDialog = false,
}) {
    return (
        <div className={`create-edit-lesson-section ${isDialog ? "is-dialog" : ""}`}>
            <div className="create-lesson-head">
                <h2>Tạo và chỉnh sửa bài học</h2>
                <p>Thông tin cần thiết để lên kế hoạch giảng dạy cho môn {subject.name}.</p>
            </div>

            <div className="create-lesson-grid">
                <label>
                    Môn học
                    <input type="text" value={subject.name} disabled />
                </label>

                <label>
                    Lớp học
                    <select
                        value={formValues.className}
                        onChange={(event) => onChangeForm("className", event.target.value)}
                    >
                        {classes.map((className) => (
                            <option key={className} value={className}>
                                {className}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="lesson-title-field">
                    Tên bài học
                    <input
                        type="text"
                        placeholder="Ví dụ: Hàm số bậc nhất"
                        value={formValues.title}
                        onChange={(event) => onChangeForm("title", event.target.value)}
                    />
                </label>

                <label>
                    Chương / chủ đề
                    <input
                        type="text"
                        placeholder="Ví dụ: Chương 1"
                        value={formValues.chapter}
                        onChange={(event) => onChangeForm("chapter", event.target.value)}
                    />
                </label>

                <label>
                    Ngày dạy
                    <input
                        type="date"
                        value={formValues.date}
                        onChange={(event) => onChangeForm("date", event.target.value)}
                    />
                </label>

                <label>
                    Tiết học
                    <select
                        value={formValues.period}
                        onChange={(event) => onChangeForm("period", event.target.value)}
                    >
                        {PERIOD_OPTIONS.map((period) => (
                            <option key={period} value={period}>
                                {period}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Phòng học
                    <input
                        type="text"
                        placeholder="Ví dụ: B203"
                        value={formValues.room}
                        onChange={(event) => onChangeForm("room", event.target.value)}
                    />
                </label>
            </div>

            <div className="create-lesson-textareas">
                <label>
                    Mục tiêu bài học
                    <textarea
                        rows="3"
                        placeholder="Học sinh đạt được những kiến thức, kỹ năng gì sau tiết học"
                        value={formValues.objective}
                        onChange={(event) => onChangeForm("objective", event.target.value)}
                    />
                </label>

                <label>
                    Nội dung giảng dạy chính
                    <textarea
                        rows="4"
                        placeholder="Liệt kê nội dung trọng tâm, hoạt động trên lớp"
                        value={formValues.content}
                        onChange={(event) => onChangeForm("content", event.target.value)}
                    />
                </label>

                <label>
                    Học liệu cần chuẩn bị
                    <textarea
                        rows="3"
                        placeholder="Slide, phiếu học tập, tài liệu tham khảo"
                        value={formValues.materials}
                        onChange={(event) => onChangeForm("materials", event.target.value)}
                    />
                </label>

                <label>
                    Bài tập về nhà
                    <textarea
                        rows="3"
                        placeholder="Chi tiết bài tập, hạn nộp và hướng dẫn"
                        value={formValues.homework}
                        onChange={(event) => onChangeForm("homework", event.target.value)}
                    />
                </label>
            </div>

            <div className="create-lesson-actions">
                <button type="button" className="btn btn-secondary">
                    Lưu nháp
                </button>
                <button type="button" className="btn btn-primary">
                    Xuất bản bài học
                </button>
            </div>
        </div>
    );
}

