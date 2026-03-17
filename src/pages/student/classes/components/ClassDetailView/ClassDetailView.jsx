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
import { classList } from "../../classesData";
import ClassDetailHeader from "../ClassDetailHeader/ClassDetailHeader";

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
    const classInfo = classList.find((item) => String(item.id) === String(classId));

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
                            {classInfo.assignments.map((assignment) => (
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
                            ))}
                        </div>
                    </section>
                </div>

                <div className="student-class-detail-side">
                    <section className="student-class-detail-card">
                        <h2>Lịch học sắp tới</h2>

                        <div className="student-class-detail-side-list">
                            {classInfo.lessons.map((lesson) => (
                                <div key={lesson.id} className="student-class-detail-side-item">
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
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="student-class-detail-card">
                        <h2>Tài liệu</h2>

                        <div className="student-class-detail-scroll-list student-class-detail-scroll-list--resource">
                            {classInfo.resources.map((resource, index) => {
                                const resourceLabel = getResourceLabel(resource);
                                const pdfUrl = getPdfLink(resource, classInfo);

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
                                                <p>Mở tài liệu PDF</p>
                                            </div>
                                        </div>

                                        <FiExternalLink className="student-class-detail-resource-open" />
                                    </a>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
