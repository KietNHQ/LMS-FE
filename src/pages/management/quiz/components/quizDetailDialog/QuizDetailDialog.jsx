import React, { useState } from "react";
import "./QuizDetailDialog.css";

export default function QuizDetailDialog({ quiz, onClose, onSave }) {
    const [formData, setFormData] = useState(quiz);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "questions" || name === "duration" ? parseInt(value) : value,
        }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <div className="quiz-detail-overlay" onClick={onClose}>
            <div className="quiz-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="quiz-detail-header">
                    <h2>Chi tiết Bài Kiểm Tra</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="quiz-detail-content">
                    <div className="form-group">
                        <label htmlFor="title">Tên bài kiểm tra</label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Mô tả</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="subject">Môn học</label>
                            <input
                                id="subject"
                                name="subject"
                                type="text"
                                value={formData.subject}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="grade">Khối</label>
                            <input
                                id="grade"
                                name="grade"
                                type="text"
                                value={formData.grade}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="questions">Số câu hỏi</label>
                            <input
                                id="questions"
                                name="questions"
                                type="number"
                                value={formData.questions}
                                onChange={handleChange}
                                min="1"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="duration">Thời gian (phút)</label>
                            <input
                                id="duration"
                                name="duration"
                                type="number"
                                value={formData.duration}
                                onChange={handleChange}
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">Trạng thái</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="open">Mở</option>
                            <option value="hidden">Ẩn</option>
                        </select>
                    </div>
                </div>

                <div className="quiz-detail-actions">
                    <button type="button" className="btn-secondary" onClick={onClose}>
                        Hủy
                    </button>
                    <button type="button" className="btn-primary" onClick={handleSave}>
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
}


