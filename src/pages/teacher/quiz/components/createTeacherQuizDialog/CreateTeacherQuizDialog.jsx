import React, { useState, useEffect, useMemo } from "react";
import { Modal, Select } from "../../../../../components/ui";
import { DEFAULT_PROFILE_BY_ROLE } from "../../../../../components/common/Dialog/ProfileDialog/profileData";
import {
    DEFAULT_QUIZ_DURATION_LABEL,
    QUIZ_DURATION_OPTIONS,
    formatDurationLabel,
} from "../../../../../services/shared/quiz/quizService";
import teacherService from "../../../../../services/pages/teacher/teacherService";
import "./CreateTeacherQuizDialog.css";

const CURRENT_TEACHER = DEFAULT_PROFILE_BY_ROLE.teacher;
const CURRENT_TEACHER_NAME = CURRENT_TEACHER.name;

const extractGradeFromClassName = (className = "") => {
    const match = String(className).match(/\d+/);
    return match ? `Khối ${match[0]}` : "";
};

const defaultForm = {
    title: "",
    subject: "",
    grade: "",
    className: "",
    semesterId: "",
    gradingMode: "auto",
    assessmentType: "regular",
    isSynchronous: false,
    duration: DEFAULT_QUIZ_DURATION_LABEL,
    createdByRole: "teacher",
    createdByName: CURRENT_TEACHER_NAME,
};

const durationOptions = QUIZ_DURATION_OPTIONS.map((item) => item.label);

export default function CreateTeacherQuizDialog({
    open,
    onClose,
    onSubmit,
    title = "Tạo bài kiểm tra",
    submitLabel = "Tạo",
    initialValues,
}) {
    const [assignments, setAssignments] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState(() => ({
        title: initialValues?.title || defaultForm.title,
        subject: initialValues?.subject || defaultForm.subject,
        grade: initialValues?.grade || defaultForm.grade,
        className: initialValues?.className || defaultForm.className,
        semesterId: initialValues?.semesterId || defaultForm.semesterId,
        gradingMode: initialValues?.gradingMode || defaultForm.gradingMode,
        assessmentType: initialValues?.assessmentType || defaultForm.assessmentType,
        isSynchronous: initialValues?.isSynchronous ?? defaultForm.isSynchronous,
        duration: formatDurationLabel(initialValues?.duration || defaultForm.duration),
        createdByRole: "teacher",
        createdByName: initialValues?.createdByName || CURRENT_TEACHER_NAME,
    }));

    // Fetch live assignments on mount
    useEffect(() => {
        if (!open) return;

        const loadAssignments = async () => {
            setIsLoading(true);
            try {
                const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
                const teacherId = storedUser.profile?.id || storedUser.teacherId || (storedUser.role === 'teacher' ? storedUser.id : null);
                
                if (teacherId) {
                    const [classRes, semesterRes] = await Promise.all([
                        teacherService.getTeacherSubjects({
                            mock: false,
                            pathParams: { id: teacherId },
                        }),
                        teacherService.listSemesters()
                    ]);

                    if (classRes && classRes.success && Array.isArray(classRes.data)) {
                        const mappedList = classRes.data.map(item => {
                            const subjectName = item.subjects && item.subjects.length > 0
                                ? item.subjects[0].name
                                : (item.subject_name || "N/A");
                            const className = item.class_name || item.name || "";
                            return {
                                subject_name: subjectName,
                                subject_display_name: subjectName,
                                class_name: className,
                                class_teacher_subject_id: item.class_teacher_subject_id || item.id,
                            };
                        });
                        setAssignments(mappedList);

                        // If creating, pre-populate if possible
                        if (!initialValues) {
                            const subjects = mappedList
                                .map(a => a.subject_display_name || a.subject_name || "")
                                .filter(Boolean);
                            const uniqueSubs = [...new Set(subjects)];
                            if (uniqueSubs.length > 0) {
                                setFormData(prev => ({
                                    ...prev,
                                    subject: prev.subject || uniqueSubs[0],
                                }));
                            }
                        }
                    }
                    if (semesterRes && semesterRes.success && Array.isArray(semesterRes.data)) {
                        setSemesters(semesterRes.data);
                        if (!initialValues && semesterRes.data.length > 0) {
                            setFormData(prev => ({ ...prev, semesterId: semesterRes.data[0].id }));
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load teacher class subjects or semesters:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadAssignments();
    }, [open, initialValues]);

    // Keep state in sync with initialValues changes
    useEffect(() => {
        if (initialValues) {
            setFormData({
                title: initialValues.title || "",
                subject: initialValues.subject || "",
                grade: initialValues.grade || "",
                className: initialValues.className || "",
                semesterId: initialValues.semesterId || "",
                gradingMode: initialValues.gradingMode || "auto",
                assessmentType: initialValues.assessmentType || "regular",
                isSynchronous: initialValues.isSynchronous ?? false,
                duration: formatDurationLabel(initialValues.duration || DEFAULT_QUIZ_DURATION_LABEL),
                createdByRole: "teacher",
                createdByName: initialValues.createdByName || CURRENT_TEACHER_NAME,
            });
        }
    }, [initialValues]);

    // Unique subjects list based on assignments
    const uniqueSubjects = useMemo(() => {
        const subjects = assignments
            .map(a => a.subject_display_name || a.subject_name || "")
            .filter(Boolean);
        return [...new Set(subjects)];
    }, [assignments]);

    // Unique grades based on the selected subject
    const uniqueGrades = useMemo(() => {
        if (!formData.subject) return [];
        const filtered = assignments.filter(
            a => (a.subject_display_name || a.subject_name || "") === formData.subject
        );
        const grades = filtered.map(a => extractGradeFromClassName(a.class_name || ""));
        return [...new Set(grades)].filter(Boolean);
    }, [assignments, formData.subject]);

    // Unique classes based on the selected subject and grade
    const uniqueClasses = useMemo(() => {
        if (!formData.subject || !formData.grade) return [];
        const filtered = assignments.filter(
            a => (a.subject_display_name || a.subject_name || "") === formData.subject &&
                 extractGradeFromClassName(a.class_name || "") === formData.grade
        );
        return [...new Set(filtered.map(a => a.class_name || ""))].filter(Boolean);
    }, [assignments, formData.subject, formData.grade]);

    const handleChange = (key, value) => {
        setFormData((prev) => {
            const next = { ...prev, [key]: value };
            // Clear subsequent selections to prevent mismatch
            if (key === "subject") {
                next.grade = "";
                next.className = "";
            } else if (key === "grade") {
                next.className = "";
            }
            return next;
        });
    };

    const handleSubmit = () => {
        const matched = assignments.find(
            a => (a.subject_display_name || a.subject_name || "") === formData.subject &&
                 a.class_name === formData.className
        );

        const payload = {
            title: formData.title.trim(),
            subject: formData.subject.trim(),
            grade: formData.grade.trim(),
            className: formData.className.trim(),
            semesterId: formData.semesterId,
            gradingMode: formData.gradingMode,
            assessmentType: formData.assessmentType,
            isSynchronous: formData.isSynchronous,
            duration: formData.duration,
            classTeacherSubjectId: matched ? matched.class_teacher_subject_id : (initialValues?.classTeacherSubjectId || null),
            createdByRole: "teacher",
            createdByName: formData.createdByName.trim() || CURRENT_TEACHER_NAME,
        };

        if (!payload.title || !payload.subject || !payload.grade || !payload.className || !payload.duration || !payload.semesterId) {
            alert("Vui lòng điền đầy đủ tên bài kiểm tra, môn học, khối, lớp, học kỳ và thời lượng.");
            return;
        }

        onSubmit?.(payload);
    };

    return (
        <Modal open={open} onClose={onClose} title={title} className="teacher-create-quiz-dialog">
            <div className="teacher-create-quiz-dialog__content">
                <div className="teacher-create-quiz-dialog__field">
                    <label htmlFor="teacher-quiz-title">Tên bài kiểm tra</label>
                    <input
                        id="teacher-quiz-title"
                        type="text"
                        placeholder="Ví dụ: Kiểm tra Tiếng Anh 15 phút"
                        value={formData.title}
                        onChange={(event) => handleChange("title", event.target.value)}
                    />
                </div>

                <div className="teacher-create-quiz-dialog__field">
                    {initialValues ? (
                        <>
                            <label htmlFor="teacher-quiz-subject">Môn học</label>
                            <input
                                id="teacher-quiz-subject"
                                type="text"
                                value={formData.subject}
                                readOnly
                            />
                        </>
                    ) : uniqueSubjects.length > 0 ? (
                        <Select
                            label="Môn học"
                            variant="custom"
                            className="teacher-create-quiz-dialog__select"
                            id="teacher-quiz-subject"
                            name="teacher-quiz-subject"
                            options={uniqueSubjects}
                            placeholder="Chọn môn học"
                            value={formData.subject}
                            onChange={(event) => handleChange("subject", event.target.value)}
                        />
                    ) : (
                        <>
                            <label htmlFor="teacher-quiz-subject">Môn học</label>
                            <input
                                id="teacher-quiz-subject"
                                type="text"
                                value={isLoading ? "Đang tải môn học..." : (formData.subject || "Chưa có môn học")}
                                readOnly
                            />
                        </>
                    )}
                </div>

                <div className="teacher-create-quiz-dialog__field teacher-create-quiz-dialog__field--half">
                    {initialValues ? (
                        <>
                            <label htmlFor="teacher-quiz-grade">Khối</label>
                            <input
                                id="teacher-quiz-grade"
                                type="text"
                                value={formData.grade}
                                readOnly
                            />
                        </>
                    ) : (
                        <Select
                            label="Khối"
                            variant="custom"
                            className="teacher-create-quiz-dialog__select"
                            id="teacher-quiz-grade"
                            name="teacher-quiz-grade"
                            options={uniqueGrades.length > 0 ? uniqueGrades : ["Khối 10", "Khối 11", "Khối 12"]}
                            placeholder="Chọn khối"
                            disabled={!formData.subject}
                            value={formData.grade}
                            onChange={(event) => handleChange("grade", event.target.value)}
                        />
                    )}
                </div>

                <div className="teacher-create-quiz-dialog__field teacher-create-quiz-dialog__field--half">
                    {initialValues ? (
                        <>
                            <label htmlFor="teacher-quiz-class">Lớp</label>
                            <input
                                id="teacher-quiz-class"
                                type="text"
                                value={formData.className}
                                readOnly
                            />
                        </>
                    ) : (
                        <Select
                            label="Lớp"
                            variant="custom"
                            className="teacher-create-quiz-dialog__select"
                            id="teacher-quiz-class"
                            name="teacher-quiz-class"
                            options={uniqueClasses}
                            placeholder="Chọn lớp"
                            disabled={!formData.grade || uniqueClasses.length === 0}
                            value={formData.className}
                            onChange={(event) => handleChange("className", event.target.value)}
                        />
                    )}
                </div>

                <div className="teacher-create-quiz-dialog__field teacher-create-quiz-dialog__field--half">
                    <Select
                        label="Học kỳ"
                        variant="custom"
                        className="teacher-create-quiz-dialog__select"
                        id="teacher-quiz-semester"
                        name="teacher-quiz-semester"
                        options={semesters.map(s => s.name)}
                        placeholder="Chọn học kỳ"
                        value={semesters.find(s => s.id === formData.semesterId)?.name || ""}
                        onChange={(event) => {
                            const selected = semesters.find(s => s.name === event.target.value);
                            handleChange("semesterId", selected ? selected.id : "");
                        }}
                    />
                </div>

                <div className="teacher-create-quiz-dialog__field teacher-create-quiz-dialog__field--half">
                    <Select
                        label="Thời lượng"
                        variant="custom"
                        className="teacher-create-quiz-dialog__select"
                        id="teacher-quiz-duration"
                        name="teacher-quiz-duration"
                        options={durationOptions}
                        value={formData.duration}
                        onChange={(event) => handleChange("duration", event.target.value)}
                    />
                </div>

                <div className="teacher-create-quiz-dialog__field teacher-create-quiz-dialog__field--half">
                    <Select
                        label="Chế độ chấm điểm"
                        variant="custom"
                        className="teacher-create-quiz-dialog__select"
                        id="teacher-quiz-grading-mode"
                        name="teacher-quiz-grading-mode"
                        options={["Tự động chấm", "Chấm thủ công", "Hỗn hợp"]}
                        value={formData.gradingMode === "auto" ? "Tự động chấm" : formData.gradingMode === "manual" ? "Chấm thủ công" : "Hỗn hợp"}
                        onChange={(event) => {
                            const val = event.target.value;
                            handleChange("gradingMode", val === "Tự động chấm" ? "auto" : val === "Chấm thủ công" ? "manual" : "mixed");
                        }}
                    />
                </div>

                <div className="teacher-create-quiz-dialog__field teacher-create-quiz-dialog__field--half">
                    <Select
                        label="Mục đích đánh giá"
                        variant="custom"
                        className="teacher-create-quiz-dialog__select"
                        id="teacher-quiz-assessment-type"
                        name="teacher-quiz-assessment-type"
                        options={["Không lấy điểm", "Thường xuyên", "Giữa kỳ", "Cuối kỳ"]}
                        value={
                            formData.assessmentType === "none" ? "Không lấy điểm" :
                            formData.assessmentType === "regular" ? "Thường xuyên" :
                            formData.assessmentType === "midterm" ? "Giữa kỳ" : "Cuối kỳ"
                        }
                        onChange={(event) => {
                            const val = event.target.value;
                            let type = "regular";
                            if (val === "Không lấy điểm") type = "none";
                            if (val === "Giữa kỳ") type = "midterm";
                            if (val === "Cuối kỳ") type = "final";
                            handleChange("assessmentType", type);
                        }}
                    />
                </div>

                <div className="teacher-create-quiz-dialog__field">
                    <Select
                        label="Chế độ đếm giờ"
                        name="teacher-quiz-timer-mode"
                        options={["Tính giờ từ lúc bấm bắt đầu (Tự học)", "Tính giờ từ lúc phát đề (Thi tập trung)"]}
                        value={formData.isSynchronous ? "Tính giờ từ lúc phát đề (Thi tập trung)" : "Tính giờ từ lúc bấm bắt đầu (Tự học)"}
                        onChange={(event) => {
                            const val = event.target.value;
                            handleChange("isSynchronous", val === "Tính giờ từ lúc phát đề (Thi tập trung)");
                        }}
                    />
                </div>

                <div className="teacher-create-quiz-dialog__actions">
                    <button type="button" className="teacher-create-quiz-dialog__cancel" onClick={onClose}>
                        Hủy
                    </button>
                    <button type="button" className="teacher-create-quiz-dialog__submit" onClick={handleSubmit}>
                        {submitLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
