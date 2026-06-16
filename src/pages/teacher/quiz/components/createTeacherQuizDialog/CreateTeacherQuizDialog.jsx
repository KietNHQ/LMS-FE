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

const normalizeId = (value) => {
    if (value === undefined || value === null || value === "") return "";
    return String(value);
};

const getSubjectName = (assignment = {}) =>
    assignment.subject_display_name || assignment.subject_name || "";

const getClassName = (assignment = {}) => assignment.class_name || "";

const getAssignmentSemesterId = (assignment = {}) =>
    normalizeId(
        assignment.class_teacher_subject_semester_id ??
        assignment.classTeacherSubjectSemesterId ??
        assignment.semester_id ??
        assignment.semesterId
    );

const getAssignmentSemesterName = (assignment = {}) =>
    assignment.semester_name || assignment.semesterName || "";

const getAssignmentSchoolYearId = (assignment = {}) =>
    normalizeId(
        assignment.class_teacher_subject_school_year_id ??
        assignment.classTeacherSubjectSchoolYearId ??
        assignment.school_year_id ??
        assignment.schoolYearId
    );

const getAssignmentSchoolYearName = (assignment = {}) =>
    assignment.school_year_name || assignment.school_year || assignment.schoolYearName || assignment.schoolYear || "";

const getSemesterId = (semester = {}) => normalizeId(semester.id ?? semester.semester_id ?? semester.semesterId);

const getSemesterName = (semester = {}) => semester.name || semester.semester_name || semester.semesterName || "";

const getSemesterSchoolYearId = (semester = {}) =>
    normalizeId(semester.school_year_id ?? semester.schoolYearId);

const getSchoolYearId = (schoolYear = {}) =>
    normalizeId(schoolYear.id ?? schoolYear.school_year_id ?? schoolYear.schoolYearId);

const getSchoolYearName = (schoolYear = {}) =>
    schoolYear.name || schoolYear.school_year_name || schoolYear.schoolYearName || schoolYear.year || "";

const assignmentMatchesScope = (assignment = {}, schoolYearId, semesterId) => {
    const assignmentSchoolYearId = getAssignmentSchoolYearId(assignment);
    const assignmentSemesterId = getAssignmentSemesterId(assignment);

    if (schoolYearId && assignmentSchoolYearId && assignmentSchoolYearId !== schoolYearId) {
        return false;
    }

    if (semesterId && assignmentSemesterId && assignmentSemesterId !== semesterId) {
        return false;
    }

    return true;
};

const defaultForm = {
    title: "",
    schoolYearId: "",
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
    const [schoolYears, setSchoolYears] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState(() => ({
        title: initialValues?.title || defaultForm.title,
        schoolYearId: initialValues?.schoolYearId || defaultForm.schoolYearId,
        subject: initialValues?.subject || defaultForm.subject,
        grade: initialValues?.grade || defaultForm.grade,
        className: initialValues?.className || defaultForm.className,
        semesterId: normalizeId(initialValues?.semesterId || defaultForm.semesterId),
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
                    const [classRes, semesterRes, schoolYearRes] = await Promise.all([
                        teacherService.getTeacherSubjects({
                            mock: false,
                            pathParams: { id: teacherId },
                        }),
                        teacherService.listSemesters(),
                        teacherService.listSchoolYears()
                    ]);

                    let mappedList = [];
                    if (classRes && classRes.success && Array.isArray(classRes.data)) {
                        mappedList = classRes.data.map(item => {
                            const subjectName = item.subjects && item.subjects.length > 0
                                ? item.subjects[0].name
                                : (item.subject_name || "N/A");
                            const className = item.class_name || item.name || "";
                            return {
                                subject_name: subjectName,
                                subject_display_name: subjectName,
                                class_name: className,
                                semester_id: item.class_teacher_subject_semester_id ?? item.classTeacherSubjectSemesterId ?? item.semester_id ?? item.semesterId ?? item.subject_semester_id ?? "",
                                semester_name: item.semester_name ?? item.semesterName ?? "",
                                school_year_id: item.class_teacher_subject_school_year_id ?? item.classTeacherSubjectSchoolYearId ?? item.school_year_id ?? item.schoolYearId ?? "",
                                school_year_name: item.school_year_name ?? item.school_year ?? item.schoolYearName ?? item.schoolYear ?? "",
                                class_teacher_subject_id: item.class_teacher_subject_id || item.id,
                            };
                        });
                        setAssignments(mappedList);
                    }
                    const semesterList = semesterRes && semesterRes.success && Array.isArray(semesterRes.data)
                        ? semesterRes.data
                        : [];
                    const schoolYearList = schoolYearRes && schoolYearRes.success && Array.isArray(schoolYearRes.data)
                        ? schoolYearRes.data
                        : [];

                    if (semesterList.length > 0) {
                        setSemesters(semesterList);
                    }
                    if (schoolYearList.length > 0) {
                        setSchoolYears(schoolYearList);
                    }

                    if (!initialValues) {
                        const currentSemesterId = getSemesterId(
                            semesterList.find((semester) => semester.is_current || semester.isCurrent)
                        );
                        const currentSchoolYearId = getSchoolYearId(
                            schoolYearList.find((schoolYear) => schoolYear.is_current || schoolYear.isCurrent)
                        );
                        const defaultAssignment = mappedList.find(
                            (item) => currentSemesterId && getAssignmentSemesterId(item) === currentSemesterId
                        ) || mappedList.find(
                            (item) => currentSchoolYearId && getAssignmentSchoolYearId(item) === currentSchoolYearId
                        ) || mappedList.find(
                            (item) => item.semester_id && item.school_year_id
                        ) || mappedList[0];

                        if (defaultAssignment) {
                            setFormData(prev => ({
                                ...prev,
                                schoolYearId: prev.schoolYearId || getAssignmentSchoolYearId(defaultAssignment),
                                semesterId: prev.semesterId || getAssignmentSemesterId(defaultAssignment),
                                subject: prev.subject || getSubjectName(defaultAssignment),
                                grade: prev.grade || extractGradeFromClassName(getClassName(defaultAssignment)),
                                className: prev.className || getClassName(defaultAssignment),
                            }));
                        } else if (semesterList.length > 0) {
                            const defaultSemester = semesterList.find((semester) => semester.is_current || semester.isCurrent) || semesterList[0];
                            setFormData(prev => ({
                                ...prev,
                                schoolYearId: prev.schoolYearId || getSemesterSchoolYearId(defaultSemester),
                                semesterId: prev.semesterId || getSemesterId(defaultSemester),
                            }));
                        }
                    } else {
                        const initialSemesterId = normalizeId(initialValues.semesterId);
                        const matchedAssignment = mappedList.find((item) =>
                            normalizeId(item.class_teacher_subject_id) === normalizeId(initialValues.classTeacherSubjectId) ||
                            (
                                getSubjectName(item) === initialValues.subject &&
                                getClassName(item) === initialValues.className &&
                                (!initialSemesterId || getAssignmentSemesterId(item) === initialSemesterId)
                            )
                        );
                        const matchedSemester = semesterList.find((semester) =>
                            getSemesterId(semester) === (initialSemesterId || getAssignmentSemesterId(matchedAssignment))
                        );

                        setFormData(prev => ({
                            ...prev,
                            schoolYearId:
                                prev.schoolYearId ||
                                getAssignmentSchoolYearId(matchedAssignment) ||
                                getSemesterSchoolYearId(matchedSemester),
                            semesterId: prev.semesterId || initialSemesterId || getAssignmentSemesterId(matchedAssignment),
                        }));
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
                schoolYearId: normalizeId(initialValues.schoolYearId || ""),
                subject: initialValues.subject || "",
                grade: initialValues.grade || "",
                className: initialValues.className || "",
                semesterId: normalizeId(initialValues.semesterId || ""),
                gradingMode: initialValues.gradingMode || "auto",
                assessmentType: initialValues.assessmentType || "regular",
                isSynchronous: initialValues.isSynchronous ?? false,
                duration: formatDurationLabel(initialValues.duration || DEFAULT_QUIZ_DURATION_LABEL),
                createdByRole: "teacher",
                createdByName: initialValues.createdByName || CURRENT_TEACHER_NAME,
            });
        }
    }, [initialValues]);

    const schoolYearOptions = useMemo(() => {
        const byId = new Map();
        const assignmentSchoolYearIds = new Set(
            assignments
                .map((assignment) => getAssignmentSchoolYearId(assignment))
                .filter(Boolean)
        );

        schoolYears.forEach((schoolYear) => {
            const id = getSchoolYearId(schoolYear);
            if (!id) return;
            if (assignmentSchoolYearIds.size > 0 && !assignmentSchoolYearIds.has(id)) return;
            byId.set(id, {
                value: id,
                label: getSchoolYearName(schoolYear) || id,
            });
        });

        assignments.forEach((assignment) => {
            const id = getAssignmentSchoolYearId(assignment);
            if (!id || byId.has(id)) return;
            byId.set(id, {
                value: id,
                label: getAssignmentSchoolYearName(assignment) || id,
            });
        });

        return [...byId.values()];
    }, [assignments, schoolYears]);

    const semesterOptions = useMemo(() => {
        const selectedSchoolYearId = normalizeId(formData.schoolYearId);
        const schoolYearLabelById = new Map(
            schoolYearOptions.map((option) => [normalizeId(option.value), option.label])
        );
        const assignmentSemesterIds = new Set(
            assignments
                .filter((assignment) => {
                    const schoolYearId = getAssignmentSchoolYearId(assignment);
                    return !selectedSchoolYearId || !schoolYearId || schoolYearId === selectedSchoolYearId;
                })
                .map((assignment) => getAssignmentSemesterId(assignment))
                .filter(Boolean)
        );
        const byId = new Map();

        semesters.forEach((semester) => {
            const id = getSemesterId(semester);
            if (!id) return;
            if (assignmentSemesterIds.size > 0 && !assignmentSemesterIds.has(id)) return;

            const schoolYearId = getSemesterSchoolYearId(semester);
            if (selectedSchoolYearId && schoolYearId && schoolYearId !== selectedSchoolYearId) {
                return;
            }

            byId.set(id, {
                value: id,
                label: selectedSchoolYearId
                    ? getSemesterName(semester) || id
                    : `${getSemesterName(semester) || id}${schoolYearLabelById.get(schoolYearId) ? ` - ${schoolYearLabelById.get(schoolYearId)}` : ""}`,
            });
        });

        assignments.forEach((assignment) => {
            const id = getAssignmentSemesterId(assignment);
            if (!id || byId.has(id)) return;

            const schoolYearId = getAssignmentSchoolYearId(assignment);
            if (selectedSchoolYearId && schoolYearId && schoolYearId !== selectedSchoolYearId) {
                return;
            }

            byId.set(id, {
                value: id,
                label: selectedSchoolYearId
                    ? getAssignmentSemesterName(assignment) || id
                    : `${getAssignmentSemesterName(assignment) || id}${getAssignmentSchoolYearName(assignment) ? ` - ${getAssignmentSchoolYearName(assignment)}` : ""}`,
            });
        });

        return [...byId.values()];
    }, [assignments, formData.schoolYearId, schoolYearOptions, semesters]);

    const scopedAssignments = useMemo(() => {
        const selectedSchoolYearId = normalizeId(formData.schoolYearId);
        const selectedSemesterId = normalizeId(formData.semesterId);

        return assignments.filter((assignment) => {
            return assignmentMatchesScope(assignment, selectedSchoolYearId, selectedSemesterId);
        });
    }, [assignments, formData.schoolYearId, formData.semesterId]);

    useEffect(() => {
        if (initialValues) return;
        if (!open || !formData.schoolYearId) return;

        const selectedSemesterStillValid = semesterOptions.some(
            (option) => normalizeId(option.value) === normalizeId(formData.semesterId)
        );

        if (!selectedSemesterStillValid) {
            const nextSemesterId = normalizeId(semesterOptions[0]?.value);
            setFormData((prev) => ({
                ...prev,
                semesterId: nextSemesterId,
                subject: "",
                grade: "",
                className: "",
            }));
        }
    }, [formData.schoolYearId, formData.semesterId, initialValues, open, semesterOptions]);

    useEffect(() => {
        if (initialValues) return;
        if (!open || !assignments.length) return;

        const selectionStillValid = scopedAssignments.some(
            (assignment) =>
                getSubjectName(assignment) === formData.subject &&
                extractGradeFromClassName(getClassName(assignment)) === formData.grade &&
                getClassName(assignment) === formData.className
        );

        if (selectionStillValid) return;

        const nextAssignment = scopedAssignments[0];
        setFormData((prev) => ({
            ...prev,
            subject: nextAssignment ? getSubjectName(nextAssignment) : "",
            grade: nextAssignment ? extractGradeFromClassName(getClassName(nextAssignment)) : "",
            className: nextAssignment ? getClassName(nextAssignment) : "",
        }));
    }, [
        assignments.length,
        formData.className,
        formData.grade,
        formData.subject,
        initialValues,
        open,
        scopedAssignments,
    ]);

    // Unique subjects list based on assignments
    const uniqueSubjects = useMemo(() => {
        const subjects = scopedAssignments
            .map(a => getSubjectName(a))
            .filter(Boolean);
        return [...new Set(subjects)];
    }, [scopedAssignments]);

    // Unique grades based on the selected subject
    const uniqueGrades = useMemo(() => {
        if (!formData.subject) return [];
        const filtered = scopedAssignments.filter(
            a => getSubjectName(a) === formData.subject
        );
        const grades = filtered.map(a => extractGradeFromClassName(getClassName(a)));
        return [...new Set(grades)].filter(Boolean);
    }, [formData.subject, scopedAssignments]);

    // Unique classes based on the selected subject and grade
    const uniqueClasses = useMemo(() => {
        if (!formData.subject || !formData.grade) return [];
        const filtered = scopedAssignments.filter(
            a => getSubjectName(a) === formData.subject &&
                 extractGradeFromClassName(getClassName(a)) === formData.grade
        );
        return [...new Set(filtered.map(a => getClassName(a)))].filter(Boolean);
    }, [formData.grade, formData.subject, scopedAssignments]);

    const handleChange = (key, value) => {
        setFormData((prev) => {
            const next = { ...prev, [key]: value };
            // Clear subsequent selections to prevent mismatch
            if (key === "schoolYearId") {
                next.semesterId = "";
                next.subject = "";
                next.grade = "";
                next.className = "";
            } else if (key === "semesterId") {
                next.subject = "";
                next.grade = "";
                next.className = "";
            } else if (key === "subject") {
                next.grade = "";
                next.className = "";
            } else if (key === "grade") {
                next.className = "";
            }
            return next;
        });
    };

    const handleSubmit = () => {
        const selectedSchoolYearId = normalizeId(formData.schoolYearId);
        const selectedSemesterId = normalizeId(formData.semesterId);
        const matched = assignments.find(
            a => getSubjectName(a) === formData.subject &&
                 getClassName(a) === formData.className &&
                 assignmentMatchesScope(a, selectedSchoolYearId, selectedSemesterId)
        );

        const payload = {
            title: formData.title.trim(),
            schoolYearId: formData.schoolYearId,
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

        if (!payload.title || (!initialValues && !payload.schoolYearId) || !payload.subject || !payload.grade || !payload.className || !payload.duration || !payload.semesterId) {
            alert("Vui lòng điền đầy đủ tên bài kiểm tra, năm học, môn học, khối, lớp, học kỳ và thời lượng.");
            return;
        }

        if (!payload.classTeacherSubjectId) {
            alert("Không tìm thấy phân công giảng dạy phù hợp với năm học và học kỳ đã chọn.");
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
                    <Select
                        label="Năm học"
                        variant="custom"
                        className="teacher-create-quiz-dialog__select"
                        id="teacher-quiz-school-year"
                        name="teacher-quiz-school-year"
                        options={schoolYearOptions}
                        placeholder="Chọn năm học"
                        disabled={Boolean(initialValues) || schoolYearOptions.length === 0}
                        value={formData.schoolYearId}
                        onChange={(event) => handleChange("schoolYearId", normalizeId(event.target.value))}
                    />
                </div>

                <div className="teacher-create-quiz-dialog__field teacher-create-quiz-dialog__field--half">
                    <Select
                        label="Học kỳ"
                        variant="custom"
                        className="teacher-create-quiz-dialog__select"
                        id="teacher-quiz-semester"
                        name="teacher-quiz-semester"
                        options={semesterOptions}
                        placeholder="Chọn học kỳ"
                        disabled={Boolean(initialValues) || semesterOptions.length === 0}
                        value={formData.semesterId}
                        onChange={(event) => handleChange("semesterId", normalizeId(event.target.value))}
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
