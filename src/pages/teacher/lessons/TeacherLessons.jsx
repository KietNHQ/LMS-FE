import React, { useMemo, useState } from "react";
import LessonListSection from "./components/lessonListSection/LessonListSection";
import CreateEditLessonSection from "./components/createEditLessonSection/CreateEditLessonSection";
import LessonFilterSection from "./components/lessonFilterSection/LessonFilterSection";
import Modal from "../../../components/ui/Modal/Modal";
import LessonDetailModal from "./components/lessonDetailModal/LessonDetailModal";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
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
        schoolYear: "2025-2026",
        term: "hk2",
        title: "Hàm số bậc nhất",
        className: "10A1",
        chapter: "Chương 1",
        date: "2026-04-18",
        period: "Tiết 2",
        room: "Phòng B203",
        status: "Đã xuất bản",
        objective: "Học sinh nhớ được định nghĩa và nhận dạng đồ thị hàm số bậc nhất.",
        content: "Giới thiệu dạng hàm số, phân tích hệ số a và b, luyện tập vẽ đồ thị qua 4 ví dụ cơ bản.",
        materials: "Slide chương 1, phiếu học tập số 03, bảng phụ nhóm.",
        homework: "Bài 1-4 trang 29, nộp trước 20:00 ngày hôm sau trên LMS.",
        attachments: [
            { name: "giao_an_ham_so_bac_nhat.docx", size: 246000 },
            { name: "slide_ham_so_bac_nhat.pptx", size: 1445000 },
        ],
    },
    {
        id: 2,
        schoolYear: "2025-2026",
        term: "hk2",
        title: "Bài tập ứng dụng hàm số",
        className: "10A2",
        chapter: "Chương 1",
        date: "2026-04-20",
        period: "Tiết 4",
        room: "Phòng B205",
        status: "Bản nháp",
        objective: "Rèn luyện kỹ năng lập bảng biến thiên và vẽ đồ thị nhanh.",
        content: "Tổ chức hoạt động nhóm 2 vòng bài tập từ cơ bản đến nâng cao, chốt đáp án theo rubric.",
        materials: "Bộ bài tập mức A-B-C, máy chiếu, bảng từ mini.",
        homework: "Hoàn thành đề luyện tập số 2, hạn nộp 2 ngày.",
        attachments: [{ name: "de_luyen_tap_so_2.pdf", size: 689000 }],
    },
    {
        id: 3,
        schoolYear: "2025-2026",
        term: "hk1",
        title: "Ôn tập chương 1",
        className: "10A1",
        chapter: "Chương 1",
        date: "2026-04-23",
        period: "Tiết 1",
        room: "Phòng B203",
        status: "Chờ duyệt",
        objective: "Hệ thống hóa kiến thức trọng tâm trước bài kiểm tra ngắn.",
        content: "Ôn theo sơ đồ tư duy, chữa lỗi sai phổ biến, mini quiz 10 phút cuối tiết.",
        materials: "Sơ đồ chương 1, bộ câu hỏi trắc nghiệm nhanh.",
        homework: "Xem lại các bài sai trong quiz, ghi chú nguyên nhân sai.",
        attachments: [],
    },
    {
        id: 4,
        schoolYear: "2025-2026",
        term: "hk2",
        title: "Hàm số bậc hai - giới thiệu",
        className: "10A3",
        chapter: "Chương 2",
        date: "2026-04-25",
        period: "Tiết 3",
        room: "Phòng B210",
        status: "Đã xuất bản",
        objective: "Học sinh hiểu dạng tổng quát và nhận dạng hệ số a, b, c.",
        content: "Khởi động bằng tình huống thực tế, trình bày dạng chuẩn, thực hành nhận diện nhanh.",
        materials: "Slide chương 2, phiếu ôn tập nhanh cuối tiết.",
        homework: "Bài 5-8 trang 42, chuẩn bị phần đồ thị tiết sau.",
        attachments: [{ name: "phieu_on_tap_nhan_dien.pdf", size: 508000 }],
    },
    {
        id: 5,
        schoolYear: "2025-2026",
        term: "hk1",
        title: "Khảo sát hàm số cơ bản",
        className: "10A2",
        chapter: "Chương 1",
        date: "2025-10-21",
        period: "Tiết 5",
        room: "Phòng B205",
        status: "Đã xuất bản",
        objective: "Học sinh thực hiện được các bước khảo sát hàm số ở mức cơ bản.",
        content: "Giáo viên minh họa quy trình khảo sát, học sinh làm theo từng bước với bài mẫu.",
        materials: "Bảng biểu mẫu khảo sát, đề bài mẫu, bút dạ.",
        homework: "Khảo sát 2 hàm số trong phiếu bài tập số 6.",
        attachments: [{ name: "mau_khao_sat_ham_so.docx", size: 176000 }],
    },
];

function createEmptyForm() {
    return {
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
    };
}

function toAttachmentMeta(file) {
    return {
        name: file.name,
        size: file.size,
    };
}

export default function TeacherLessons() {
    const {
        selectedSchoolYear = "2025-2026",
        selectedTerm = "hk1",
        handleYearArrow,
        handleTermChange,
    } = useSchoolYearTerm() || {};

    const [lessons, setLessons] = useState(LESSONS_MOCK);
    const [filters, setFilters] = useState({
        className: "Tất cả",
        status: "Tất cả",
        keyword: "",
    });

    const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [attachedFiles, setAttachedFiles] = useState([]);

    const [formValues, setFormValues] = useState(createEmptyForm());

    const termLessons = useMemo(() => {
        return lessons.filter(
            (lesson) =>
                lesson.schoolYear === selectedSchoolYear &&
                lesson.term === selectedTerm
        );
    }, [lessons, selectedSchoolYear, selectedTerm]);

    const classes = useMemo(() => {
        const unique = new Set(termLessons.map((lesson) => lesson.className));
        return ["Tất cả", ...unique];
    }, [termLessons]);

    const statusOptions = ["Tất cả", "Đã xuất bản", "Bản nháp", "Chờ duyệt"];

    const summary = useMemo(() => {
        const total = termLessons.length;
        const published = termLessons.filter((lesson) => lesson.status === "Đã xuất bản").length;
        const draft = termLessons.filter((lesson) => lesson.status === "Bản nháp").length;
        const pending = termLessons.filter((lesson) => lesson.status === "Chờ duyệt").length;
        return { total, published, draft, pending };
    }, [termLessons]);

    const filteredLessons = useMemo(() => {
        return termLessons.filter((lesson) => {
            const byClass = filters.className === "Tất cả" || lesson.className === filters.className;
            const byStatus = filters.status === "Tất cả" || lesson.status === filters.status;
            const normalizedKeyword = filters.keyword.trim().toLowerCase();
            const byKeyword =
                normalizedKeyword.length === 0 ||
                lesson.title.toLowerCase().includes(normalizedKeyword) ||
                lesson.chapter.toLowerCase().includes(normalizedKeyword);

            return byClass && byStatus && byKeyword;
        });
    }, [filters, termLessons]);

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleFormChange = (field, value) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleOpenCreate = () => {
        setEditingLessonId(null);
        setFormValues(createEmptyForm());
        setAttachedFiles([]);
        setIsCreateLessonOpen(true);
    };

    const handleOpenEdit = (lessonId) => {
        const lesson = lessons.find((item) => item.id === lessonId);
        if (!lesson) return;

        setEditingLessonId(lesson.id);
        setFormValues({
            title: lesson.title,
            className: lesson.className,
            chapter: lesson.chapter,
            date: lesson.date,
            period: lesson.period,
            room: lesson.room,
            objective: lesson.objective || "",
            content: lesson.content || "",
            materials: lesson.materials || "",
            homework: lesson.homework || "",
        });
        setAttachedFiles(lesson.attachments || []);
        setIsCreateLessonOpen(true);
    };

    const handleCloseCreate = () => {
        setIsCreateLessonOpen(false);
        setEditingLessonId(null);
    };

    const handleFileChange = (fileList) => {
        if (!fileList?.length) return;

        const incoming = Array.from(fileList).map(toAttachmentMeta);
        setAttachedFiles((prev) => [...prev, ...incoming].slice(0, 5));
    };

    const handleRemoveFile = (index) => {
        setAttachedFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
    };

    const handleSubmitLesson = (status) => {
        const payload = {
            ...formValues,
            status,
            schoolYear: selectedSchoolYear,
            term: selectedTerm,
            attachments: attachedFiles,
        };

        if (editingLessonId) {
            setLessons((prev) =>
                prev.map((lesson) =>
                    lesson.id === editingLessonId
                        ? {
                              ...lesson,
                              ...payload,
                          }
                        : lesson
                )
            );
        } else {
            setLessons((prev) => [
                {
                    id: Date.now(),
                    ...payload,
                },
                ...prev,
            ]);
        }

        handleCloseCreate();
    };

    return (
        <div className="teacher-lessons-page teacher-lessons">
            <PageHeader
                title="Quản lý bài học"
                eyebrow={`Môn: ${ASSIGNED_SUBJECT.name} | ${summary.total} bài học`}
                actions={
                    <div className="teacher-lessons-header-actions">
                        <SchoolYearTermSelector
                            selectedSchoolYear={selectedSchoolYear}
                            selectedTerm={selectedTerm}
                            onYearChange={handleYearArrow}
                            onTermChange={handleTermChange}
                        />
                    </div>
                }
                actionRight={
                    <button
                        type="button"
                        className="teacher-create-lesson-btn"
                        onClick={handleOpenCreate}
                    >
                        + Tạo bài học
                    </button>
                }
            />

            <LessonFilterSection
                subject={ASSIGNED_SUBJECT}
                filters={filters}
                classes={classes}
                statusOptions={statusOptions}
                onChangeFilter={handleFilterChange}
                selectedSchoolYear={selectedSchoolYear}
                selectedTerm={selectedTerm}
            />

            <LessonListSection
                lessons={filteredLessons}
                summary={summary}
                onViewDetail={setSelectedLesson}
                onEditLesson={handleOpenEdit}
            />

            <Modal
                open={isCreateLessonOpen}
                title={editingLessonId ? "Chỉnh sửa bài học" : "Tạo bài học"}
                onClose={handleCloseCreate}
                className="teacher-create-lesson-modal"
            >
                <CreateEditLessonSection
                    subject={ASSIGNED_SUBJECT}
                    formValues={formValues}
                    classes={classes.filter((item) => item !== "Tất cả")}
                    onChangeForm={handleFormChange}
                    attachedFiles={attachedFiles}
                    onFileChange={handleFileChange}
                    onRemoveFile={handleRemoveFile}
                    onSaveDraft={() => handleSubmitLesson("Bản nháp")}
                    onPublish={() => handleSubmitLesson("Đã xuất bản")}
                    isDialog
                />
            </Modal>

            <LessonDetailModal
                lesson={selectedLesson}
                onClose={() => setSelectedLesson(null)}
                onEdit={(lessonId) => {
                    setSelectedLesson(null);
                    handleOpenEdit(lessonId);
                }}
            />
        </div>
    );
}

