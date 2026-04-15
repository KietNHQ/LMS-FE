import React from "react";
import Modal from "../../../../../components/ui/Modal/Modal";
import "./LessonDetailModal.css";

function formatSize(size = 0) {
    if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    return `${(size / 1024).toFixed(1)} KB`;
}

export default function LessonDetailModal({ lesson, onClose, onEdit }) {
    if (!lesson) return null;

    return (
        <Modal
            open={!!lesson}
            onClose={onClose}
            title="Chi tiết bài học"
            className="lesson-detail-modal"
        >
            <div className="lesson-detail-content">
                <section className="lesson-detail-quick-meta">
                    <span className="meta-chip">Lớp {lesson.className}</span>
                    <span className="meta-chip">Ngày {lesson.date}</span>
                    <span className="meta-chip">{lesson.period}</span>
                    <span className="meta-chip">{lesson.room}</span>
                    <span className="meta-chip status-chip">{lesson.status}</span>
                </section>

                <section className="lesson-detail-section lesson-basic-grid">
                    <h4>Thông tin cơ bản</h4>
                    <div>
                        <p><strong>Tên bài học:</strong> {lesson.title}</p>
                        <p><strong>Môn học:</strong> Toán 10</p>
                        <p><strong>Lớp:</strong> {lesson.className}</p>
                    </div>
                    <div>
                        <p><strong>Chương / Chủ đề:</strong> {lesson.chapter}</p>
                        <p><strong>Ngày dạy:</strong> {lesson.date}</p>
                        <p><strong>Tiết / Phòng:</strong> {lesson.period} - {lesson.room}</p>
                    </div>
                </section>

                <section className="lesson-detail-section">
                    <h4>Mục tiêu bài học</h4>
                    <p>{lesson.objective || "Chưa cập nhật mục tiêu."}</p>
                </section>

                <section className="lesson-detail-section">
                    <h4>Nội dung giảng dạy</h4>
                    <p>{lesson.content || "Chưa cập nhật nội dung giảng dạy."}</p>
                </section>

                <section className="lesson-detail-section">
                    <h4>Học liệu cần chuẩn bị</h4>
                    <p>{lesson.materials || "Chưa có học liệu đính kèm."}</p>
                </section>

                <section className="lesson-detail-section">
                    <h4>Bài tập về nhà</h4>
                    <p>{lesson.homework || "Chưa giao bài tập về nhà."}</p>
                </section>

                <section className="lesson-detail-section">
                    <h4>Tệp đính kèm</h4>
                    {lesson.attachments?.length ? (
                        <ul className="detail-attachment-list">
                            {lesson.attachments.map((file, index) => (
                                <li key={`${file.name}-${index}`}>
                                    <div>
                                        <strong>{file.name}</strong>
                                        <p>{formatSize(file.size)}</p>
                                    </div>
                                    <div className="detail-attachment-actions">
                                        <button type="button">Tải về</button>
                                        <button type="button" className="is-danger">Xóa</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Chưa có tệp đính kèm.</p>
                    )}
                </section>

                <section className="lesson-detail-footer">
                    <span className="detail-status">Trạng thái: {lesson.status}</span>
                    <button type="button" className="detail-edit-btn" onClick={() => onEdit?.(lesson.id)}>
                        Chỉnh sửa bài học
                    </button>
                </section>
            </div>
        </Modal>
    );
}
