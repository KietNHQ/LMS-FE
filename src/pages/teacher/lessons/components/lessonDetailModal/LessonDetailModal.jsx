import React from "react";
import Modal from "../../../../../components/ui/Modal/Modal";
import "./LessonDetailModal.css";

function statusClassName(status = "") {
    if (status === "Đã xuất bản") return "status-published";
    if (status === "Bản nháp") return "status-draft";
    return "status-pending";
}

function formatSize(size = 0) {
    if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    return `${(size / 1024).toFixed(1)} KB`;
}

export default function LessonDetailModal({ lesson, onClose, onEdit, onOpenReview }) {
    if (!lesson) return null;

    return (
        <Modal
            open={!!lesson}
            onClose={onClose}
            title="Chi tiết bài học"
            className="lesson-detail-modal"
        >
            <div className="lesson-detail-content">
                <section className="lesson-detail-hero">
                    <div>
                        <p className="lesson-detail-kicker">Tóm tắt nhanh</p>
                        <h3>{lesson.title}</h3>
                        <p className="lesson-detail-summary">
                            {lesson.objective || "Chưa cập nhật mục tiêu bài học."}
                        </p>
                    </div>

                    <div className="lesson-detail-hero-status">
                        <span className={`detail-status ${statusClassName(lesson.status)}`}>
                            {lesson.status}
                        </span>
                    </div>
                </section>

                <section className="lesson-detail-section lesson-info-strip">
                    <h4>Thông tin chính</h4>
                    <div className="lesson-detail-mini-grid">
                        <div>
                            <span>Khối</span>
                            <strong>{lesson.gradeBlock || "-"}</strong>
                        </div>
                        <div>
                            <span>Lớp</span>
                            <strong>{lesson.className || "-"}</strong>
                        </div>
                        <div>
                            <span>Ngày dạy</span>
                            <strong>{lesson.date || "-"}</strong>
                        </div>
                        <div>
                            <span>Tiết / Phòng</span>
                            <strong>{lesson.period} - {lesson.room}</strong>
                        </div>
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
                    <div className="lesson-detail-footer-actions">
                        <button type="button" className="detail-review-btn" onClick={() => onOpenReview?.(lesson)}>
                            Xem lại cho học sinh
                        </button>
                        <button type="button" className="detail-edit-btn" onClick={() => onEdit?.(lesson.id)}>
                            Chỉnh sửa bài học
                        </button>
                    </div>
                </section>
            </div>
        </Modal>
    );
}
