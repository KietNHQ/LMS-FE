import React, { useMemo, useState } from "react";
import LessonListSection from "./components/lessonListSection/LessonListSection";
import CreateEditLessonSection from "./components/createEditLessonSection/CreateEditLessonSection";
import Modal from "../../../components/ui/Modal/Modal";
import LessonDetailModal from "./components/lessonDetailModal/LessonDetailModal";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import teacherService from "../../../services/pages/teacher/teacherService";
import { useGetMe } from "../../../hooks/useAuth";
import "./TeacherLessons.css";
import { useEffect } from "react";

function toAttachmentMeta(file) {
    return {
        name: file.name,
        size: file.size,
    };
}

export default function TeacherLessons() {
    const { data: user } = useGetMe();
    
    // Derive teaching structures from assignments
    const { teachingBlocks, classesByBlock, assignmentsMap } = useMemo(() => {
        const assignments = user?.profile?.teachingAssignments || [];
        const blocks = new Set();
        const map = {};
        const fullMap = {}; // key: className, value: assignment object

        assignments.forEach(a => {
            const blockName = `Khối ${a.grade_level}`;
            blocks.add(blockName);
            if (!map[blockName]) map[blockName] = [];
            if (!map[blockName].includes(a.class_name)) {
                map[blockName].push(a.class_name);
            }
            fullMap[a.class_name] = a;
        });

        return {
            teachingBlocks: Array.from(blocks).sort(),
            classesByBlock: map,
            assignmentsMap: fullMap
        };
    }, [user]);

    // Initial form state factory
    const createEmptyForm = () => {
        const firstBlock = teachingBlocks[0] || "";
        const firstClass = classesByBlock[firstBlock]?.[0] || "";
        return {
            title: "",
            gradeBlock: firstBlock,
            className: firstClass,
            chapter: "Chương 1",
            date: "",
            period: "Tiết 1",
            room: "",
            objective: "",
            content: "",
            materials: "",
            homework: "",
        };
    };

    const [formValues, setFormValues] = useState(createEmptyForm);

    // [NEW] Sync form defaults when data arrives
    useEffect(() => {
        if (user && teachingBlocks.length > 0 && !formValues.gradeBlock) {
            setFormValues(createEmptyForm());
        }
    }, [user, teachingBlocks, classesByBlock]);

    // Derive subject from current form selection or profile
    const assignedSubject = useMemo(() => {
        const currentClass = assignmentsMap[formValues?.className];
        if (currentClass) {
            return {
                name: currentClass.subject_name,
                code: currentClass.subject_name.includes("Toán") ? "MATH" : "ENG",
            };
        }
        
        if (!user || !user.profile) return { name: "Đang tải...", code: "" };
        const subjectStr = user.profile.subject || "Chưa phân công";
        return {
            name: subjectStr.split(",")[0].trim(),
            code: subjectStr.includes("Toán") ? "MATH" : "ENG",
            fullName: subjectStr
        };
    }, [user, assignmentsMap, formValues?.className]);

    const {
        selectedSchoolYear = "2025-2026",
        selectedTerm = "hk1",
        handleYearArrow,
        handleTermChange,
    } = useSchoolYearTerm() || {};

    const [lessons, setLessons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [pinnedLessonIds, setPinnedLessonIds] = useState([]);
    const [filters, setFilters] = useState({
        gradeBlock: "Tất cả khối",
        status: "Tất cả",
        keyword: "",
    });

    const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [reviewLesson, setReviewLesson] = useState(null);
    const [attachedFiles, setAttachedFiles] = useState([]);

    const pinnedLessonSet = useMemo(() => new Set(pinnedLessonIds), [pinnedLessonIds]);

    const termLessons = useMemo(() => {
        return lessons.filter(
            (lesson) =>
                lesson.schoolYear === selectedSchoolYear &&
                lesson.term === selectedTerm
        );
    }, [lessons, selectedSchoolYear, selectedTerm]);

    const statusOptions = ["Tất cả", "Đã xuất bản", "Bản nháp", "Chờ duyệt"];
    const blockOptions = ["Tất cả khối", ...teachingBlocks];

    const fetchLessons = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await teacherService.listLessons({
                params: {
                    schoolYear: selectedSchoolYear,
                    term: selectedTerm,
                },
            });

            if (response.success) {
                const fetchedLessons = response.data || [];
                setLessons(fetchedLessons);
                setPinnedLessonIds(
                    fetchedLessons.filter((l) => l.isPinned).map((l) => l.id)
                );
            } else {
                setError("Không thể tải danh sách bài học.");
            }
        } catch (err) {
            console.error("Fetch lessons error:", err);
            setError("Đã xảy ra lỗi khi kết nối máy chủ.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLessons();
    }, [selectedSchoolYear, selectedTerm]);

    const summary = useMemo(() => {
        const total = termLessons.length;
        const published = termLessons.filter((lesson) => lesson.status === "Đã xuất bản").length;
        const draft = termLessons.filter((lesson) => lesson.status === "Bản nháp").length;
        const pending = termLessons.filter((lesson) => lesson.status === "Chờ duyệt").length;
        return { total, published, draft, pending };
    }, [termLessons]);

    const filteredLessons = useMemo(() => {
        return termLessons.filter((lesson) => {
            const byBlock =
                filters.gradeBlock === "Tất cả khối" || lesson.gradeBlock === filters.gradeBlock;
            const byStatus = filters.status === "Tất cả" || lesson.status === filters.status;
            const normalizedKeyword = filters.keyword.trim().toLowerCase();
            const byKeyword =
                normalizedKeyword.length === 0 ||
                lesson.title.toLowerCase().includes(normalizedKeyword) ||
                lesson.chapter.toLowerCase().includes(normalizedKeyword);

            return byBlock && byStatus && byKeyword;
        });
    }, [filters, termLessons]);

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleFormChange = (field, value) => {
        setFormValues((prev) => {
            if (field === "gradeBlock") {
                const nextClasses = classesByBlock[value] || [];
                const keepCurrentClass = nextClasses.includes(prev.className);
                return {
                    ...prev,
                    gradeBlock: value,
                    className: keepCurrentClass ? prev.className : nextClasses[0] || "",
                };
            }

            return { ...prev, [field]: value };
        });
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
            gradeBlock: lesson.gradeBlock || teachingBlocks[0],
            className:
                lesson.className || classesByBlock[lesson.gradeBlock || teachingBlocks[0]]?.[0] || "",
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

    const handleDuplicateLesson = async (lessonId) => {
        const lesson = lessons.find((item) => item.id === lessonId);
        if (!lesson) return;

        try {
            const payload = {
                ...lesson,
                title: `Bản sao - ${lesson.title}`,
                status: "Bản nháp",
                isPinned: false,
            };
            delete payload.id;

            const response = await teacherService.createLesson({
                body: payload,
            });

            if (response.success) {
                await fetchLessons();
            }
        } catch (err) {
            console.error("Duplicate lesson error:", err);
        }
    };

    const handleTogglePin = async (lessonId) => {
        const isCurrentlyPinned = pinnedLessonSet.has(lessonId);
        try {
            // Optimistic UI update could go here, but let's keep it simple for now
            const response = await teacherService.updateLesson({
                pathParams: { id: lessonId },
                body: { isPinned: !isCurrentlyPinned },
            });

            if (response.success) {
                setPinnedLessonIds((prev) =>
                    isCurrentlyPinned
                        ? prev.filter((id) => id !== lessonId)
                        : [lessonId, ...prev]
                );
            }
        } catch (err) {
            console.error("Toggle pin error:", err);
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài học này?")) return;

        try {
            const response = await teacherService.deleteLesson({
                pathParams: { id: lessonId },
            });

            if (response.success) {
                await fetchLessons();
            }
        } catch (err) {
            console.error("Delete lesson error:", err);
        }
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

    const handleSubmitLesson = async (status) => {
        const payload = {
            ...formValues,
            status,
            schoolYear: selectedSchoolYear,
            term: selectedTerm,
            attachments: attachedFiles,
        };

        try {
            let response;
            if (editingLessonId) {
                response = await teacherService.updateLesson({
                    pathParams: { id: editingLessonId },
                    body: payload,
                });
            } else {
                response = await teacherService.createLesson({
                    body: payload,
                });
            }

            if (response.success) {
                await fetchLessons();
                handleCloseCreate();
            }
        } catch (err) {
            console.error("Submit lesson error:", err);
        }
    };

    return (
        <div className="teacher-lessons-page teacher-lessons">
            <PageHeader
                title="Quản lý bài học"
                eyebrow={`Môn ${assignedSubject.name} • ${summary.total} bài trong học kỳ hiện tại`}
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

            <section className="teacher-lessons-unified-panel" aria-label="Bộ lọc và danh sách bài học">
                {isLoading ? (
                    <div className="teacher-lessons-loading">
                        <div className="spinner"></div>
                        <p>Đang tải danh sách bài học...</p>
                    </div>
                ) : error ? (
                    <div className="teacher-lessons-error">
                        <p>{error}</p>
                        <button onClick={fetchLessons}>Thử lại</button>
                    </div>
                ) : (
                    <LessonListSection
                        lessons={filteredLessons}
                        summary={summary}
                        filters={filters}
                        blockOptions={blockOptions}
                        statusOptions={statusOptions}
                        onChangeFilter={handleFilterChange}
                        onViewDetail={setSelectedLesson}
                        onEditLesson={handleOpenEdit}
                        onDuplicateLesson={handleDuplicateLesson}
                        onTogglePin={handleTogglePin}
                        onDeleteLesson={handleDeleteLesson}
                        isLessonPinned={(lessonId) => pinnedLessonSet.has(lessonId)}
                    />
                )}
            </section>

            <Modal
                open={isCreateLessonOpen}
                title={editingLessonId ? "Chỉnh sửa bài học" : "Tạo bài học"}
                onClose={handleCloseCreate}
                className="teacher-create-lesson-modal"
            >
                <CreateEditLessonSection
                    subject={assignedSubject}
                    blockOptions={teachingBlocks}
                    classesByBlock={classesByBlock}
                    formValues={formValues}
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
                onOpenReview={(lesson) => setReviewLesson(lesson)}
            />

            <Modal
                open={!!reviewLesson}
                title="Nhắc lại cho học sinh"
                onClose={() => setReviewLesson(null)}
                className="teacher-lesson-review-modal"
            >
                {reviewLesson ? (
                    <div className="teacher-lesson-review-content">
                        <p className="teacher-lesson-review-lead">
                            Đây là phần tóm tắt ngắn để học sinh xem lại nhanh trước khi học tiếp.
                        </p>
                        <ul className="teacher-lesson-review-list">
                            <li><strong>Bài học:</strong> {reviewLesson.title}</li>
                            <li><strong>Ý chính:</strong> {reviewLesson.objective || "Đang cập nhật."}</li>
                            <li><strong>Cần nhớ:</strong> {reviewLesson.homework || "Xem lại nội dung đã ghi chú trên lớp."}</li>
                        </ul>
                        <p className="teacher-lesson-review-note">
                            Chỉ cần 3 ý ngắn như vậy là đủ để học sinh hiểu lại bài, không cần viết dài.
                        </p>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}


