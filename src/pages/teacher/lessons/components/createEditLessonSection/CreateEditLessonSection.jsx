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
    blockOptions,
    classesByBlock,
    formValues,
    onChangeForm,
    attachedFiles = [],
    onFileChange,
    onRemoveFile,
    onSaveDraft,
    onPublish,
    isDialog = false,
    timetable = [],
}) {
    const classOptions = classesByBlock?.[formValues.gradeBlock] || [];

    const matchedSlot = React.useMemo(() => {
        if (!formValues.date || !formValues.className || !timetable?.length) return null;
        const dateObj = new Date(formValues.date);
        if (isNaN(dateObj.getTime())) return null;
        const dayOfWeek = dateObj.getDay() + 1; // 1 = Sunday, 2 = Monday, ...
        return timetable.find(
            (slot) =>
                slot.class_name === formValues.className &&
                slot.day_of_week === dayOfWeek
        );
    }, [formValues.date, formValues.className, timetable]);

    const handleAttachmentInput = (event) => {
        if (typeof onFileChange === "function") {
            onFileChange(event.target.files);
        }
        event.target.value = "";
    };

    const formatFileSize = (size = 0) => {
        if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
        return `${(size / 1024).toFixed(1)} KB`;
    };

    return (
        <div className={`create-edit-lesson-section ${isDialog ? "is-dialog" : ""}`}>
            <div className="create-lesson-head">
                <div>
                    <h2>Tạo và chỉnh sửa bài học</h2>
                    <p>Giáo viên có thể tạo bài học cho nhiều khối 10, 11, 12 từ cùng một form.</p>
                </div>

                <span className="lesson-form-block-tag">{formValues.gradeBlock}</span>
            </div>

            <section className="lesson-form-block">
                <div className="lesson-form-block-head">
                    <h3>Thông tin tiết học</h3>
                    <p>Thông tin cơ bản để xác định lịch dạy và lớp học.</p>
                </div>

                <div className="create-lesson-grid">
                    <label>
                        Môn học
                        <input type="text" value={subject.name} disabled />
                    </label>

                    <label>
                        Khối phụ trách
                        <select
                            value={formValues.gradeBlock}
                            onChange={(event) => onChangeForm("gradeBlock", event.target.value)}
                        >
                            {blockOptions.map((block) => (
                                <option key={block} value={block}>
                                    {block}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Lớp
                        <select
                            value={formValues.className}
                            onChange={(event) => onChangeForm("className", event.target.value)}
                        >
                            {classOptions.map((className) => (
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
                            placeholder="Ví dụ: Unit 1 - Tenses / Hàm số bậc nhất"
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

                    {matchedSlot ? (
                        <div className="timetable-match-success">
                            ✓ Đã khớp lịch dạy (Thời khóa biểu): Tiết {matchedSlot.period_number} - Phòng {matchedSlot.room || "Chưa xác định"} (Tự động điền)
                        </div>
                    ) : formValues.date ? (
                        <div className="timetable-match-warning">
                            ⚠ Không tìm thấy lịch dạy chính thức cho lớp {formValues.className} vào ngày này trong thời khóa biểu.
                        </div>
                    ) : null}
                </div>
            </section>

            <section className="lesson-form-block">
                <div className="lesson-form-block-head">
                    <h3>Nội dung và tài liệu</h3>
                    <p>Điền mục tiêu, nội dung giảng dạy và tài liệu đính kèm.</p>
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

                <div className="create-lesson-attachments">
                    <div className="attachment-header">
                        <h3>Tệp đính kèm</h3>
                        <p>Hỗ trợ: PDF, DOCX, PPTX, PNG, JPG. Tối đa 5 tệp, mỗi tệp ≤ 10MB.</p>
                    </div>

                    <label className="attachment-drop-zone">
                        <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                            onChange={handleAttachmentInput}
                        />
                        <span>Kéo thả hoặc bấm để chọn tệp</span>
                    </label>

                    {attachedFiles.length > 0 ? (
                        <ul className="attachment-file-list">
                            {attachedFiles.map((file, index) => (
                                <li key={`${file.name}-${index}`}>
                                    <div>
                                        <strong>{file.name}</strong>
                                        <p>{formatFileSize(file.size)}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveFile?.(index)}
                                        aria-label="Xóa tệp"
                                    >
                                        Xóa
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            </section>

            <div className="create-lesson-actions">
                <button type="button" className="btn btn-secondary" onClick={onSaveDraft}>
                    Lưu nháp
                </button>
                <button type="button" className="btn btn-primary" onClick={onPublish}>
                    Xuất bản bài học
                </button>
            </div>
        </div>
    );
}


