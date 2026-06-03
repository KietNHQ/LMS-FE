import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    FiArrowLeft,
    FiUser,
    FiMail,
    FiCalendar,
    FiClock,
    FiFileText,
    FiExternalLink,
    FiBookOpen,
} from "react-icons/fi";
import "./ClassDetailView.css";
import ClassDetailHeader from "../ClassDetailHeader/ClassDetailHeader";
import { LoadingSpinner } from "../../../../../components/common";
import { studentService } from "../../../../../services/pages/student/studentService";
import Modal from "../../../../../components/ui/Modal/Modal";

function getDownloadUrl(url) {
    if (!url) return "";
    if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
        return url.replace("/upload/", "/upload/fl_attachment/");
    }
    return url;
}

function getPdfLink(resource, classInfo) {
    if (typeof resource === "object" && resource?.url) return resource.url;

    const fileName =
        typeof resource === "string"
            ? resource
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^\w-]+/g, "") + ".pdf"
            : "document.pdf";

    return `/pdf/${classInfo.id}/${fileName}`;
}

function getResourceLabel(resource) {
    if (typeof resource === "object") return resource.title || "Tài liệu PDF";
    return resource;
}

function getStatusClass(status) {
    if (status === "In Progress" || status === "Đang làm") {
        return "status-chip status-chip--progress";
    }

    if (status === "Not Started" || status === "Chưa bắt đầu") {
        return "status-chip status-chip--pending";
    }

    return "status-chip status-chip--done";
}

export default function ClassDetailView() {
    const navigate = useNavigate();
    const { classId } = useParams();
    const [classInfo, setClassInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [isLoadingLesson, setIsLoadingLesson] = useState(false);

    const handleLessonClick = async (lessonId) => {
        setIsLoadingLesson(true);
        try {
            const res = await studentService.getLessonById({
                pathParams: { id: lessonId },
                mock: false
            });
            if (res.success && res.data) {
                setSelectedLesson(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch lesson detail", err);
        } finally {
            setIsLoadingLesson(false);
        }
    };

    useEffect(() => {
        const fetchDetail = async () => {
            setIsLoading(true);
            try {
                const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
                const studentId = storedUser?.profile?.id || storedUser?.id;
                
                const res = await studentService.getClassById({
                    pathParams: { id: studentId, classId },
                    mock: false
                });

                if (res.success && res.data) {
                    setClassInfo(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch class detail", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetail();
    }, [classId]);

    if (isLoading) {
        return (
            <div className="student-class-detail-page">
                <div className="layout-loading-wrapper" style={{ minHeight: "400px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <LoadingSpinner size="lg" label="Đang tải thông tin chi tiết lớp học..." role="student" />
                </div>
            </div>
        );
    }

    if (!classInfo) {
        return (
            <div className="student-class-detail-page">
                <div className="student-class-detail-empty">
                    <h1>Không tìm thấy lớp học</h1>
                    <p>Lớp học này có thể đã được cập nhật hoặc không còn khả dụng.</p>

                    <Link to="/student/classes" className="student-class-detail-back-btn">
                        <FiArrowLeft />
                        <span>Quay lại trang lớp học</span>
                    </Link>
                </div>
            </div>
        );
    }

    const assignments = classInfo.assignments || [];
    const lessons = classInfo.lessons || [];
    const resources = classInfo.resources || [];

    return (
        <div className="student-class-detail-page">
            <Link to="/student/classes" className="student-class-detail-back-btn">
                <FiArrowLeft />
                <span>Quay lại trang lớp học</span>
            </Link>

            <ClassDetailHeader classNameLabel={classInfo.className} title={classInfo.title} />

            <div className="student-class-detail-stats">
                <article>
                    <p>Tiến độ</p>
                    <strong>{classInfo.progress}%</strong>
                </article>

                <article>
                    <p>Số buổi đã học</p>
                    <strong>
                        {classInfo.completedLessons}/{classInfo.totalLessons}
                    </strong>
                </article>

                <article>
                    <p>Bài tập chưa hoàn thành</p>
                    <strong>{classInfo.assignmentsPending}</strong>
                </article>
            </div>

            <div className="student-class-detail-layout">
                <div className="student-class-detail-main">
                    <section className="student-class-detail-card">
                        <h2>Tổng quan lớp học</h2>

                        <p className="student-class-detail-desc">{classInfo.description}</p>

                        <div className="student-class-detail-info-list">
                            <div className="student-class-detail-info-item">
                                <FiUser className="student-class-detail-info-icon" />
                                <span>
                                    Giáo viên: <strong>{classInfo.teacher}</strong>
                                </span>
                            </div>

                            <div className="student-class-detail-info-item">
                                <FiMail className="student-class-detail-info-icon" />
                                <span>
                                    Email:{" "}
                                    <a href={`mailto:${classInfo.teacherEmail}`} className="teacher-mail-link">
                                        {classInfo.teacherEmail}
                                    </a>
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="student-class-detail-card">
                        <h2>Bài tập</h2>

                        <div className="student-class-detail-scroll-list">
                            {assignments.length === 0 ? (
                                <p className="no-data-text" style={{ padding: "16px", color: "var(--text-secondary)", textAlign: "center" }}>Không có bài tập nào.</p>
                            ) : (
                                assignments.map((assignment) => (
                                    <button
                                        key={assignment.id}
                                        type="button"
                                        className="student-class-detail-item student-class-detail-item--clickable"
                                        onClick={() => navigate("/student/quiz")}
                                    >
                                        <div className="student-class-detail-item-left">
                                            <FiFileText className="student-class-detail-item-icon" />

                                            <div className="student-class-detail-item-content">
                                                <h3>{assignment.title}</h3>
                                                <p>Hạn nộp: {assignment.due}</p>
                                            </div>
                                        </div>

                                        <span className={getStatusClass(assignment.status)}>
                                            {assignment.status}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                <div className="student-class-detail-side">
                    <section className="student-class-detail-card">
                        <h2>Lịch học sắp tới</h2>

                        <div className="student-class-detail-side-list">
                            {lessons.length === 0 ? (
                                <p className="no-data-text" style={{ color: "var(--text-secondary)", padding: "8px 0" }}>Chưa cập nhật bài giảng.</p>
                            ) : (
                                lessons.map((lesson) => (
                                    <button
                                        key={lesson.id}
                                        type="button"
                                        className="student-class-detail-side-item student-class-detail-side-item--clickable"
                                        onClick={() => handleLessonClick(lesson.id)}
                                        style={{ width: "100%", textAlign: "left", display: "block" }}
                                    >
                                        <div className="student-class-detail-side-item-title">{lesson.title}</div>

                                        <div className="student-class-detail-side-meta">
                                            <div className="student-class-detail-side-meta-row">
                                                <FiCalendar />
                                                <span>{lesson.time}</span>
                                            </div>

                                            <div className="student-class-detail-side-meta-row">
                                                <FiClock />
                                                <span>Buổi học sắp tới của lớp</span>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </section>

                    <section className="student-class-detail-card">
                        <h2>Tài liệu</h2>

                        <div className="student-class-detail-scroll-list student-class-detail-scroll-list--resource">
                            {resources.length === 0 ? (
                                <p className="no-data-text" style={{ padding: "16px", color: "var(--text-secondary)", textAlign: "center" }}>Không có tài liệu nào.</p>
                            ) : (
                                resources.map((resource, index) => {
                                    const resourceLabel = getResourceLabel(resource);
                                    const pdfUrl = getDownloadUrl(getPdfLink(resource, classInfo));

                                    return (
                                        <a
                                            key={`${resourceLabel}-${index}`}
                                            href={pdfUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="student-class-detail-resource-item"
                                        >
                                            <div className="student-class-detail-resource-left">
                                                <FiBookOpen className="student-class-detail-resource-icon" />

                                                <div className="student-class-detail-resource-content">
                                                    <h3>{resourceLabel}</h3>
                                                    <p>Tải tài liệu</p>
                                                </div>
                                            </div>

                                            <FiExternalLink className="student-class-detail-resource-open" />
                                        </a>
                                    );
                                })
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {isLoadingLesson && (
                <div className="ui-modal-overlay" style={{ zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <LoadingSpinner size="lg" label="Đang tải chi tiết bài học..." role="student" />
                </div>
            )}

            {selectedLesson && (
                <Modal
                    open={!!selectedLesson}
                    onClose={() => setSelectedLesson(null)}
                    title="Chi tiết bài học"
                    className="student-lesson-detail-modal"
                >
                    <div className="student-lesson-detail-modal-content">
                        <header className="student-lesson-modal-hero">
                            <span className="student-lesson-modal-badge">{selectedLesson.chapter || "Bài học"}</span>
                            <h3>{selectedLesson.title}</h3>
                            <p className="student-lesson-modal-objective">
                                {selectedLesson.objective || "Chưa cập nhật mục tiêu bài học."}
                            </p>
                        </header>

                        <div className="student-lesson-modal-section">
                            <h4>Thông tin lớp học</h4>
                            <div className="student-lesson-modal-grid">
                                <div>
                                    <span>Ngày học</span>
                                    <strong>{selectedLesson.date ? new Date(selectedLesson.date).toLocaleDateString('vi-VN') : "—"}</strong>
                                </div>
                                <div>
                                    <span>Tiết & Phòng</span>
                                    <strong>{selectedLesson.period || "—"} - {selectedLesson.room || "—"}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="student-lesson-modal-section">
                            <h4>Nội dung giảng dạy chính</h4>
                            <p className="student-lesson-modal-text">{selectedLesson.content || "Chưa cập nhật nội dung."}</p>
                        </div>

                        <div className="student-lesson-modal-section">
                            <h4>Bài tập về nhà & Nhiệm vụ</h4>
                            <p className="student-lesson-modal-text">{selectedLesson.homework || "Chưa giao bài tập về nhà."}</p>
                        </div>

                        <div className="student-lesson-modal-section">
                            <h4>Học liệu & Tệp đính kèm</h4>
                            {selectedLesson.attachments?.length ? (
                                <ul className="student-lesson-attachments-list">
                                    {selectedLesson.attachments.map((file, idx) => (
                                        <li key={idx}>
                                            <div className="file-info">
                                                <FiBookOpen className="file-icon" />
                                                <div>
                                                    <span className="file-name">{file.name}</span>
                                                    <span className="file-size">({(file.size ? (file.size / 1024).toFixed(1) : 0)} KB)</span>
                                                </div>
                                            </div>
                                            {file.url ? (
                                                <a href={getDownloadUrl(file.url)} target="_blank" rel="noopener noreferrer" className="btn-download-file">Tải về</a>
                                            ) : (
                                                <span className="no-file-url">Không có link</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="student-lesson-modal-text text-muted">Chưa có tệp đính kèm nào cho bài học này.</p>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
