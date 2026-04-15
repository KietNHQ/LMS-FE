import React, { useMemo, useState } from "react";
import LessonListSection from "./components/lessonListSection/LessonListSection";
import CreateEditLessonSection from "./components/createEditLessonSection/CreateEditLessonSection";
import LessonFilterSection from "./components/lessonFilterSection/LessonFilterSection";
import Modal from "../../../components/ui/Modal/Modal";
import "./TeacherLessons.css";

const ASSIGNED_SUBJECT = {
    id: "math-10",
    code: "MATH10",
    name: "Toán 10",
    teacherName: "Nguyễn Văn A",
};

const LESSONS_MOCK = [
    {
        id: 1,
        title: "Hàm số bậc nhất",
        className: "10A1",
        chapter: "Chương 1",
        date: "2026-04-18",
        period: "Tiết 2",
        room: "Phòng B203",
        status: "Đã xuất bản",
        objective: "Học sinh nhớ được định nghĩa và nhận dạng đồ thị hàm số bậc nhất.",
    },
    {
        id: 2,
        title: "Bài tập ứng dụng hàm số",
        className: "10A2",
        chapter: "Chương 1",
        date: "2026-04-20",
        period: "Tiết 4",
        room: "Phòng B205",
        status: "Bản nháp",
        objective: "Rèn luyện kỹ năng lập bảng biến thiên và vẽ đồ thị nhanh.",
    },
    {
        id: 3,
        title: "Ôn tập chương 1",
        className: "10A1",
        chapter: "Chương 1",
        date: "2026-04-23",
        period: "Tiết 1",
        room: "Phòng B203",
        status: "Chờ duyệt",
        objective: "Hệ thống hóa kiến thức trọng tâm trước bài kiểm tra ngắn.",
    },
    {
        id: 4,
        title: "Hàm số bậc hai - giới thiệu",
        className: "10A3",
        chapter: "Chương 2",
        date: "2026-04-25",
        period: "Tiết 3",
        room: "Phòng B210",
        status: "Đã xuất bản",
        objective: "Học sinh hiểu dạng tổng quát và nhận dạng hệ số a, b, c.",
    },
];

export default function TeacherLessons() {
    const [filters, setFilters] = useState({
        className: "Tất cả",
        status: "Tất cả",
        keyword: "",
    });

    const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);

    const [formValues, setFormValues] = useState({
        title: "",
        className: "10A1",
        chapter: "Chương 1",
        date: "",
        period: "Tiết 1",
        room: "",
        objective: "",
        content: "",
        materials: "",
        homework: "",
    });

    const classes = useMemo(() => {
        const unique = new Set(LESSONS_MOCK.map((lesson) => lesson.className));
        return ["Tất cả", ...unique];
    }, []);

    const statusOptions = ["Tất cả", "Đã xuất bản", "Bản nháp", "Chờ duyệt"];

    const summary = useMemo(() => {
        const total = LESSONS_MOCK.length;
        const published = LESSONS_MOCK.filter((lesson) => lesson.status === "Đã xuất bản").length;
        const draft = LESSONS_MOCK.filter((lesson) => lesson.status === "Bản nháp").length;
        const pending = LESSONS_MOCK.filter((lesson) => lesson.status === "Chờ duyệt").length;
        return { total, published, draft, pending };
    }, []);

    const filteredLessons = useMemo(() => {
        return LESSONS_MOCK.filter((lesson) => {
            const byClass = filters.className === "Tất cả" || lesson.className === filters.className;
            const byStatus = filters.status === "Tất cả" || lesson.status === filters.status;
            const normalizedKeyword = filters.keyword.trim().toLowerCase();
            const byKeyword =
                normalizedKeyword.length === 0 ||
                lesson.title.toLowerCase().includes(normalizedKeyword) ||
                lesson.chapter.toLowerCase().includes(normalizedKeyword);

            return byClass && byStatus && byKeyword;
        });
    }, [filters]);

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleFormChange = (field, value) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="teacher-lessons">
            <div className="teacher-lessons-header">
                <h1>Quản lý bài học</h1>
                <p>
                    Giáo viên chỉ phụ trách một môn học. Hệ thống đã khóa môn được phân công để
                    tránh nhầm lẫn khi tạo bài học.
                </p>

                <button
                    type="button"
                    className="teacher-create-lesson-btn"
                    onClick={() => setIsCreateLessonOpen(true)}
                >
                    Tạo bài học
                </button>
            </div>

            <LessonFilterSection
                subject={ASSIGNED_SUBJECT}
                filters={filters}
                classes={classes}
                statusOptions={statusOptions}
                onChangeFilter={handleFilterChange}
            />

            <LessonListSection lessons={filteredLessons} summary={summary} />

            <Modal
                open={isCreateLessonOpen}
                title="Tạo và chỉnh sửa bài học"
                onClose={() => setIsCreateLessonOpen(false)}
                className="teacher-create-lesson-modal"
            >
                <CreateEditLessonSection
                    subject={ASSIGNED_SUBJECT}
                    formValues={formValues}
                    classes={classes.filter((item) => item !== "Tất cả")}
                    onChangeForm={handleFormChange}
                    isDialog
                />
            </Modal>
        </div>
    );
}

