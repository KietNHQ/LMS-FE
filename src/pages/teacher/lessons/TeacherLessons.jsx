import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LessonListSection from "./components/lessonListSection/LessonListSection";
import CreateEditLessonSection from "./components/createEditLessonSection/CreateEditLessonSection";
import Modal from "../../../components/ui/Modal/Modal";
import LessonDetailModal from "./components/lessonDetailModal/LessonDetailModal";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import teacherService from "../../../services/pages/teacher/teacherService";
import { useGetMe } from "../../../hooks/useAuth";
import { toast } from "react-toastify";
import "./TeacherLessons.css";

function toAttachmentMeta(file) {
    return {
        name: file.name,
        size: file.size,
    };
}

export default function TeacherLessons() {
    const { data: user } = useGetMe();
    const queryClient = useQueryClient();
    const {
        selectedSchoolYear = "2025-2026",
        selectedTerm = "hk1",
        handleYearArrow,
        handleTermChange,
    } = useSchoolYearTerm() || {};

    // Derive teaching structures from assignments
    const { teachingBlocks, classesByBlock, assignmentsMap } = useMemo(() => {
        const rawAssignments = user?.profile?.teachingAssignments || [];
        const assignments = rawAssignments.filter(
            a => a.school_year === selectedSchoolYear && a.term === selectedTerm
        );
        const blocks = new Set();
        const map = {};
        const fullMap = {};

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
    }, [user, selectedSchoolYear, selectedTerm]);

    // Fetch lessons using TanStack Query
    const { data: lessonsResponse, isLoading, error } = useQuery({
        queryKey: ["teacher-lessons", selectedSchoolYear, selectedTerm],
        queryFn: () => teacherService.listLessons({
            params: { schoolYear: selectedSchoolYear, term: selectedTerm }
        }),
    });

    const lessons = lessonsResponse?.success ? lessonsResponse.data : [];

    // Fetch timetable for auto-fill period and room lookup
    const { data: timetableResponse } = useQuery({
        queryKey: ["teacher-timetable", selectedSchoolYear, selectedTerm],
        queryFn: () => teacherService.getTimetable({
            mock: false,
            params: { schoolYear: selectedSchoolYear, term: selectedTerm }
        }),
    });

    const timetable = useMemo(() => {
        const responseData = timetableResponse?.data ?? timetableResponse;
        if (Array.isArray(responseData)) {
            return responseData;
        }

        if (Array.isArray(responseData?.lessons)) {
            return responseData.lessons;
        }

        if (Array.isArray(responseData?.data)) {
            return responseData.data;
        }

        return [];
    }, [timetableResponse]);

    // Mutations for CRUD
    const createMutation = useMutation({
        mutationFn: (payload) => teacherService.createLesson({ body: payload }),
        onSuccess: () => {
            queryClient.invalidateQueries(["teacher-lessons"]);
            toast.success("Đã tạo bài học thành công.");
            handleCloseCreate();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }) => teacherService.updateLesson({ pathParams: { id }, body: payload }),
        onSuccess: () => {
            queryClient.invalidateQueries(["teacher-lessons"]);
            toast.success("Đã cập nhật bài học.");
            handleCloseCreate();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => teacherService.deleteLesson({ pathParams: { id } }),
        onSuccess: () => {
            queryClient.invalidateQueries(["teacher-lessons"]);
            toast.success("Đã xóa bài học.");
        }
    });

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
    const [pinnedLessonIds, setPinnedLessonIds] = useState([]);

    const currentSubject = useMemo(() => {
        const assignments = user?.profile?.teachingAssignments || [];
        const firstAssignment = assignments[0];
        return {
            name: firstAssignment?.subject_name || user?.profile?.subject || "Chưa xác định"
        };
    }, [user]);

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

    const statusOptions = ["Tất cả", "Đã xuất bản", "Bản nháp", "Chờ duyệt"];
    const blockOptions = ["Tất cả khối", ...teachingBlocks];

    const summary = useMemo(() => {
        const total = lessons.length;
        const published = lessons.filter((lesson) => lesson.status === "Đã xuất bản").length;
        const draft = lessons.filter((lesson) => lesson.status === "Bản nháp").length;
        const pending = lessons.filter((lesson) => lesson.status === "Chờ duyệt").length;
        return { total, published, draft, pending };
    }, [lessons]);

    const filteredLessons = useMemo(() => {
        return lessons.filter((lesson) => {
            const byBlock = filters.gradeBlock === "Tất cả khối" || lesson.gradeBlock === filters.gradeBlock;
            const byStatus = filters.status === "Tất cả" || lesson.status === filters.status;
            const normalizedKeyword = filters.keyword.trim().toLowerCase();
            const byKeyword = normalizedKeyword.length === 0 || 
                lesson.title.toLowerCase().includes(normalizedKeyword) || 
                lesson.chapter.toLowerCase().includes(normalizedKeyword);

            return byBlock && byStatus && byKeyword;
        });
    }, [filters, lessons]);

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleFormChange = (field, value) => {
        setFormValues((prev) => {
            let nextValues = { ...prev, [field]: value };
            if (field === "gradeBlock") {
                const nextClasses = classesByBlock[value] || [];
                const keepCurrentClass = nextClasses.includes(prev.className);
                nextValues.className = keepCurrentClass ? prev.className : nextClasses[0] || "";
            }

            // Auto-fill period and room based on class and date matching the timetable
            if (field === "date" || field === "className" || field === "gradeBlock") {
                if (nextValues.date && nextValues.className) {
                    const dateObj = new Date(nextValues.date);
                    if (!isNaN(dateObj.getTime())) {
                        const dayOfWeek = dateObj.getDay() + 1; // 1 = Sunday, 2 = Monday, ...
                        const matchedSlot = timetable.find((slot) => {
                            const slotClassName = slot.class_name ?? slot.className;
                            const slotDayOfWeek = slot.day_of_week ?? slot.dayOfWeek;
                            return slotClassName === nextValues.className && slotDayOfWeek === dayOfWeek;
                        });
                        if (matchedSlot) {
                            nextValues.period = `Tiết ${matchedSlot.period_number ?? matchedSlot.period ?? ""}`;
                            nextValues.room = matchedSlot.room ?? matchedSlot.roomName ?? "";
                        }
                    }
                }
            }
            return nextValues;
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
        
        // Format the date to YYYY-MM-DD for HTML input[type="date"]
        let formattedDate = "";
        if (lesson.date) {
            formattedDate = typeof lesson.date === "string" ? lesson.date.substring(0, 10) : new Date(lesson.date).toISOString().substring(0, 10);
        }

        setFormValues({ 
            ...lesson,
            date: formattedDate
        });
        setAttachedFiles(lesson.attachments || []);
        setIsCreateLessonOpen(true);
    };

    const handleDeleteLesson = (lessonId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài học này?")) return;
        deleteMutation.mutate(lessonId);
    };

    const handleCloseCreate = () => {
        setIsCreateLessonOpen(false);
        setEditingLessonId(null);
    };

    const handleFileChange = async (fileList) => {
        if (!fileList?.length) return;
        const uploadToastId = toast.loading("Đang tải tệp lên Cloudinary...");
        try {
            const filesArray = Array.from(fileList);
            const uploadedMeta = [];
            for (const file of filesArray) {
                const formData = new FormData();
                formData.append("file", file);
                const response = await teacherService.uploadLessonAttachment({
                    mock: false,
                    body: formData,
                    config: {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        }
                    }
                });
                if (response.success && response.data) {
                    uploadedMeta.push({
                        name: response.data.name,
                        size: response.data.size,
                        url: response.data.url
                    });
                } else {
                    throw new Error("Upload failed");
                }
            }
            setAttachedFiles((prev) => [...prev, ...uploadedMeta].slice(0, 5));
            toast.update(uploadToastId, { 
                render: "Tải tệp đính kèm thành công!", 
                type: "success", 
                isLoading: false,
                autoClose: 3000 
            });
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            toast.update(uploadToastId, { 
                render: "Lỗi khi tải tệp lên Cloudinary. Vui lòng thử lại.", 
                type: "error", 
                isLoading: false,
                autoClose: 4000 
            });
        }
    };

    const handleSubmitLesson = (status) => {
        const assignment = assignmentsMap[formValues.className];
        const payload = {
            ...formValues,
            status,
            isPublished: status === "Đã xuất bản",
            schoolYear: selectedSchoolYear,
            term: selectedTerm,
            attachments: attachedFiles,
            classTeacherSubjectId: assignment?.class_teacher_subject_id ?? null,
        };

        if (editingLessonId) {
            updateMutation.mutate({ id: editingLessonId, payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    return (
        <div className="teacher-lessons-page teacher-lessons">
            <PageHeader
                title="Quản lý bài học"
                eyebrow={`Tổng cộng ${summary.total} bài học trong học kỳ`}
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
                actionRight={
                    <button type="button" className="teacher-create-lesson-btn" onClick={handleOpenCreate}>
                        + Tạo bài học
                    </button>
                }
            />

            <section className="teacher-lessons-unified-panel">
                {isLoading ? (
                    <div className="teacher-lessons-loading">Đang tải danh sách bài học...</div>
                ) : error ? (
                    <div className="teacher-lessons-error">Đã có lỗi xảy ra.</div>
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
                        onDeleteLesson={handleDeleteLesson}
                        isLessonPinned={(id) => pinnedLessonSet.has(id)}
                    />
                )}
            </section>

            <Modal open={isCreateLessonOpen} title={editingLessonId ? "Chỉnh sửa bài học" : "Tạo bài học"} onClose={handleCloseCreate}>
                <CreateEditLessonSection
                    subject={currentSubject}
                    blockOptions={teachingBlocks}
                    classesByBlock={classesByBlock}
                    formValues={formValues}
                    onChangeForm={handleFormChange}
                    attachedFiles={attachedFiles}
                    onFileChange={handleFileChange}
                    onRemoveFile={(idx) => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                    onSaveDraft={() => handleSubmitLesson("Bản nháp")}
                    onPublish={() => handleSubmitLesson("Đã xuất bản")}
                    timetable={timetable}
                    isDialog
                />
            </Modal>

            <LessonDetailModal
                lesson={selectedLesson}
                onClose={() => setSelectedLesson(null)}
                onEdit={(id) => { setSelectedLesson(null); handleOpenEdit(id); }}
            />
        </div>
    );
}


