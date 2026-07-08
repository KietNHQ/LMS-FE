import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import "./ManagementTimetable.css";
import TimetableFiltersSection from "./components/timetableFiltersSection/timetableFiltersSection";
import ScheduleSlotSection from "./components/scheduleSlotSection/scheduleSlotSection";
import ConflictCheckSection from "./components/conflictCheckSection/conflictCheckSection";
import Modal from "../../../components/ui/Modal/Modal";
import { Select } from "../../../components/ui";
import { SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiUsers, FiCalendar, FiClock, FiBook, FiUser, FiMapPin, FiActivity, FiX, FiCheckCircle, FiSave, FiPlus } from "react-icons/fi";
import { WEEK_DAYS, STATUS_META, MODE_META, getPeriodRangeLabel, SUBJECT_COLOR_MAP, GDPT_2018_CONFIG } from "../../../utils/timetableShared";
import timetableService, { API_DAY_TO_LABEL } from "../../../services/pages/management/timetable/timetableService";
import { classesService } from "../../../services/pages/management/classes";
import {
    resolveSchoolYearId,
    resolveSemesterId,
    dayLabelToApiDayOfWeek,
} from "../../../services/shared/schoolYearLookup";
import { loadTimetableStaticCatalog } from "../../../services/pages/management/timetable/timetableCatalogCache";
import { toast } from "react-toastify";

const getErrorMessage = (error, fallback) => {
    const apiError = error?.response?.data?.error;
    const apiMessage = error?.response?.data?.message;
    return apiMessage || apiError || fallback;
};

const dayOptions = WEEK_DAYS.map((item) => item.label);
const periodOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function mapApiLessonToSession(p, { selectedClass, selectedSchoolYear, selectedTerm }) {
    const cts = p.class_teacher_subject;
    const subjectName =
        cts?.subject_assignments?.display_name ||
        p.subjectName ||
        p.subject_name ||
        "Môn học";
    const teacherName =
        cts?.teachers?.fullName ||
        cts?.teachers?.name ||
        p.teacherName ||
        "Chưa phân công";
    const subjectCode =
        cts?.subject_assignments?.subject_code ||
        p.subjectCode ||
        p.subject_code ||
        "TOAN";
    const dayNum = p.day_of_week ?? p.dayOfWeek ?? 2;
    const period = Number(p.period_number ?? p.period ?? 1);
    const periodEnd = Number(p.period_end ?? p.periodEnd ?? period);
    const room = p.room || p.roomName || p.room_name || "—";
    const range = getPeriodRangeLabel(period, periodEnd);

    return {
        id: p.id,
        year: selectedSchoolYear,
        term: selectedTerm,
        className: selectedClass,
        day: API_DAY_TO_LABEL[dayNum] || "Thứ 2",
        period,
        periodEnd,
        subject: subjectName,
        subjectKey: subjectCode,
        teacher: teacherName,
        room,
        status: STATUS_META.normal.label,
        note: p.note || "",
        mode: MODE_META.offline,
        color: SUBJECT_COLOR_MAP[subjectCode] || "teal",
        start: range.split(" - ")[0],
        end: range.split(" - ")[1],
    };
}

function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
}

function LessonModal({ mode, formData, onChange, onClose, onSubmit, allSessions, activeSessionId, realTeachers, realRooms, realSubjects, realClasses, subjectDisplayToCode, periodIds, selectedClassRecord }) {
    const allTeacherNames = (realTeachers || []).map(t => t.label || t.value).filter(Boolean);
    const classOptions = (realClasses || []).map(c => c.value || c).filter(Boolean);
    const subjectOptions = (realSubjects || []).map(s => s.value || s).filter(Boolean);
    const roomOptions = (realRooms || []).map(r => r.value || r).filter(Boolean);

    const isConsecutiveSubject = (displayName) => {
        const code = (subjectDisplayToCode || {})[displayName] || displayName;
        return GDPT_2018_CONFIG.CONSECUTIVE_SUBJECTS.includes(code);
    };

    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
    const emit = useCallback(
        (name, value) => onChange({ target: { name, value } }),
        [onChange],
    );

    // Teacher list to display: use filtered by subject, fallback to all ONLY if no subject is selected
    const displayedTeacherNames = useMemo(() => {
        if (!formData.subject) return allTeacherNames;
        if (isLoadingTeachers) return [];
        return filteredTeachers.map((t) => t.label || t.value);
    }, [filteredTeachers, isLoadingTeachers, allTeacherNames, formData.subject]);

    // Fetch teachers filtered by selected subject
    useEffect(() => {
        if (!formData.subject) {
            return;
        }

        let cancelled = false;
        const timer = setTimeout(() => {
            if (cancelled) return;
            setIsLoadingTeachers(true);

            const subjectCode = subjectDisplayToCode[formData.subject] || formData.subject;

            timetableService.getTeachersBySubject({
                subjectCode,
                classId: selectedClassRecord?.id || undefined,
                semesterId: periodIds?.semesterId || undefined,
                schoolYearId: periodIds?.schoolYearId || undefined,
            }).then((teachers) => {
                if (cancelled) return;
                const mapped = (teachers || []).map((t) => ({
                    value: t.teacher_name,
                    label: t.teacher_name,
                    id: t.teacher_id,
                }));
                setFilteredTeachers(mapped);
            }).catch(() => {
                if (!cancelled) setFilteredTeachers([]);
            }).finally(() => {
                if (!cancelled) setIsLoadingTeachers(false);
            });
        }, 0);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [formData.subject, selectedClassRecord?.id, periodIds?.semesterId, periodIds?.schoolYearId, subjectDisplayToCode]);

    // Reset selected teacher if they do not teach the newly selected subject
    useEffect(() => {
        if (isLoadingTeachers) return;
        
        if (formData.subject) {
            const exists = filteredTeachers.some(t => t.value === formData.teacher);
            if (!exists && filteredTeachers.length > 0) {
                emit("teacher", filteredTeachers[0]?.value);
            } else if (filteredTeachers.length === 0 && formData.teacher) {
                emit("teacher", "");
            }
        }
    }, [emit, filteredTeachers, isLoadingTeachers, formData.subject, formData.teacher]);

    // [NEW] Kiểm tra xem giáo viên có bận ở lớp khác không
    const getTeacherStatus = (teacherName) => {
        if (!teacherName) return null;
        const conflict = allSessions.find(s => 
            s.id !== activeSessionId &&
            s.day === formData.day &&
            s.teacher === teacherName &&
            ((s.period <= formData.periodEnd && (s.periodEnd || s.period) >= formData.period))
        );
        return conflict ? { busy: true, class: conflict.className } : { busy: false };
    };

    // [NEW] Kiểm tra xem phòng học có bận không
    const getRoomStatus = (roomName) => {
        if (!roomName || roomName === "—") return null;
        const conflict = allSessions.find(s => 
            s.id !== activeSessionId &&
            s.day === formData.day &&
            s.room === roomName &&
            ((s.period <= formData.periodEnd && (s.periodEnd || s.period) >= formData.period))
        );
        return conflict ? { busy: true, class: conflict.className } : { busy: false };
    };

    const currentTeacherStatus = getTeacherStatus(formData.teacher);
    const currentRoomStatus = getRoomStatus(formData.room);

    // [NEW] Kiểm tra định mức môn học của lớp hiện tại
    const classSessions = allSessions.filter(s => s.className === formData.className);
    const currentSubjectCode = subjectDisplayToCode[formData.subject] || formData.subject;
    const currentSubjectPeriods = classSessions
        .filter(s => s.subjectKey === currentSubjectCode && s.id !== activeSessionId)
        .reduce((sum, s) => sum + ((s.periodEnd || s.period) - s.period + 1), 0);
    
    const newPeriodsToAdd = (formData.periodEnd || formData.period) - formData.period + 1;
    const totalSubjectPeriods = currentSubjectPeriods + newPeriodsToAdd;
    
    const quota = GDPT_2018_CONFIG.QUOTAS[currentSubjectCode] || 3;
    const isOverQuota = totalSubjectPeriods > quota;

    if (!formData) {
        return <div className="admin-timetable-modal-overlay"><div className="admin-timetable-modal exp-modal-card lesson-modal-wide"><div className="modal-body">Đang tải...</div></div></div>;
    }

    return (
        <div className="admin-timetable-modal-overlay">
            <div className="admin-timetable-modal exp-modal-card lesson-modal-wide">
                <div className="modal-header exp-header">
                    <h3>{mode === "edit" ? "Cập nhật tiết học" : "Thêm tiết học mới"}</h3>
                    <button className="modal-close-btn" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className="modal-body exp-body">
                    <div className="exp-form-grid">
                        {/* Row 1: Lớp + Thứ */}
                        <div className="exp-form-item">
                            <label className="exp-label"><FiUsers /> Lớp</label>
                            <Select
                                variant="custom"
                                value={formData.className}
                                options={classOptions.map((item) => ({ value: item, label: item }))}
                                onChange={(e) => emit("className", e.target.value)}
                            />
                        </div>

                        <div className="exp-form-item">
                            <label className="exp-label"><FiCalendar /> Thứ</label>
                            <Select
                                variant="custom"
                                value={formData.day}
                                options={dayOptions.map((item) => ({ value: item, label: item }))}
                                onChange={(e) => emit("day", e.target.value)}
                            />
                        </div>

                        {/* Row 2: Tiết + Đến tiết */}
                        <div className="exp-form-item">
                            <label className="exp-label"><FiClock /> Tiết bắt đầu</label>
                            <Select
                                variant="custom"
                                value={String(formData.period)}
                                options={periodOptions.map((item) => ({ value: String(item), label: `Tiết ${item}` }))}
                                onChange={(e) => emit("period", Number(e.target.value))}
                            />
                        </div>

                        <div className="exp-form-item">
                            <label className="exp-label"><FiClock /> Tiết kết thúc</label>
                            <Select
                                variant="custom"
                                value={String(formData.periodEnd)}
                                options={periodOptions
                                    .filter((item) => item >= formData.period)
                                    .map((item) => ({ value: String(item), label: `Tiết ${item}` }))}
                                disabled={isConsecutiveSubject(formData.subject)}
                                onChange={(e) => emit("periodEnd", Number(e.target.value))}
                            />
                            {isConsecutiveSubject(formData.subject) && (
                                <span className="field-hint-msg">Môn học này mặc định là tiết đôi.</span>
                            )}
                        </div>

                        {/* Row 3: Môn học + Phòng học */}
                        <div className="exp-form-item">
                            <label className="exp-label">
                                <FiBook /> Môn học 
                                <span className={`quota-tag ${totalSubjectPeriods > quota ? 'danger' : 'success'}`}>
                                    ({totalSubjectPeriods}/{quota} tiết/tuần)
                                </span>
                            </label>
                            <Select
                                variant="custom"
                                value={formData.subject}
                                options={subjectOptions.map((key) => ({ value: key, label: key }))}
                                onChange={(e) => emit("subject", e.target.value)}
                            />
                        </div>

                        <div className="exp-form-item">
                            <label className="exp-label"><FiMapPin /> Phòng học</label>
                            <Select
                                variant="custom"
                                searchable={true}
                                className={currentRoomStatus?.busy ? 'select-error' : ''}
                                value={formData.room}
                                options={roomOptions.map((r) => ({ value: r, label: r }))}
                                onChange={(e) => emit("room", e.target.value)}
                            />
                            {currentRoomStatus?.busy && (
                                <span className="field-error-msg">❌ Đang bận tại lớp {currentRoomStatus.class}</span>
                            )}
                        </div>

                        {/* Row 4: Giáo viên - full width */}
                        <div className="exp-form-item full-width">
                            <label className="exp-label"><FiUser /> Giáo viên giảng dạy</label>
                            <Select
                                variant="custom"
                                searchable={true}
                                className={currentTeacherStatus?.busy ? 'select-error' : ''}
                                value={formData.teacher}
                                options={
                                    isLoadingTeachers
                                        ? [{ value: "", label: "Đang tải giáo viên..." }]
                                        : displayedTeacherNames.length === 0
                                            ? [{ value: "", label: "Không có giáo viên" }]
                                            : displayedTeacherNames.map((name) => {
                                                  const status = getTeacherStatus(name);
                                                  return {
                                                      value: name,
                                                      label: status?.busy ? `${name} (Đang bận - Lớp ${status.class})` : `${name}`,
                                                  };
                                              })
                                }
                                disabled={displayedTeacherNames.length === 0 && !isLoadingTeachers}
                                onChange={(e) => emit("teacher", e.target.value)}
                            />
                            {currentTeacherStatus?.busy && (
                                <span className="field-error-msg">❌ Giáo viên này đang có tiết tại lớp {currentTeacherStatus.class}</span>
                            )}
                        </div>

                        {/* Row 5: Trạng thái + Hình thức */}
                        <div className="exp-form-item">
                            <label className="exp-label"><FiActivity /> Trạng thái</label>
                            <Select
                                variant="custom"
                                value={formData.status}
                                options={Object.values(STATUS_META).map((s) => ({ value: s.label, label: s.label }))}
                                onChange={(e) => emit("status", e.target.value)}
                            />
                        </div>

                        <div className="exp-form-item">
                            <label className="exp-label"><FiActivity /> Hình thức</label>
                            <Select
                                variant="custom"
                                value={formData.mode}
                                options={Object.values(MODE_META).map((m) => ({ value: m, label: m }))}
                                onChange={(e) => emit("mode", e.target.value)}
                            />
                        </div>

                        {/* Row 6: Ghi chú - full width */}
                        <div className="exp-form-item full-width">
                            <label className="exp-label"><FiActivity /> Ghi chú</label>
                            <div className="exp-input-wrapper">
                                <input
                                    className="exp-input"
                                    name="note"
                                    value={formData.note}
                                    onChange={onChange}
                                    placeholder="Nội dung tiết học"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer exp-footer">
                    <button type="button" className="exp-btn-cancel" onClick={onClose}>Hủy bỏ</button>
                    <button 
                        type="button" 
                        className="exp-btn-submit" 
                        disabled={currentTeacherStatus?.busy || currentRoomStatus?.busy || isOverQuota}
                        onClick={onSubmit}
                    >
                        {mode === "edit" ? <FiSave /> : <FiPlus />}
                        {mode === "edit" ? "Lưu thay đổi" : "Thêm tiết học"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ManagementTimetable() {
    const queryClient = useQueryClient();
    const {
        selectedSchoolYear,
        selectedTerm,
        handleYearArrow,
        handleTermChange,
    } = useSchoolYearTerm();
    const [sessions, setSessions] = useState([]);
    const [gradeBlockOptions, setGradeBlockOptions] = useState([{ value: "all", label: "Tất cả" }]);
    const [selectedBlock, setSelectedBlock] = useState("all");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState("Tất cả giáo viên");
    const [selectedDay, setSelectedDay] = useState("Tất cả thứ");
    const [searchTerm, setSearchTerm] = useState("");
    const [sessionView, setSessionView] = useState("morning");

    const [activeModalMode, setActiveModalMode] = useState(null);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [formData, setFormData] = useState(null);
    const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState("");

    // Real data for dropdowns
    const [realSubjects, setRealSubjects] = useState([]);
    const [realRooms, setRealRooms] = useState([]);
    const [realTeachers, setRealTeachers] = useState([]);
    const [realClasses, setRealClasses] = useState([]);
    const [periodIds, setPeriodIds] = useState({ schoolYearId: null, semesterId: null });

    const catalogGenRef = useRef(0);

    useEffect(() => {
        const gen = ++catalogGenRef.current;

        (async () => {
            try {
                const [{ subjects, rooms, teachers, gradeOptions }, classRows] = await Promise.all([
                    loadTimetableStaticCatalog(),
                    classesService.listClasses({ schoolYearName: selectedSchoolYear }),
                ]);

                if (gen !== catalogGenRef.current) return;

                const classes = classRows.map((c) => ({
                    id: c.id,
                    value: c.name,
                    label: c.name,
                    gradeNumber: `${c.grade || ""}`.replace(/^khối\s*/i, "").trim(),
                }));

                setRealSubjects(subjects);
                setRealRooms(rooms);
                setRealTeachers(teachers);
                setRealClasses(classes);

                const blocks = gradeOptions
                    .filter((g) => g.value !== "all")
                    .map((g) => ({ value: g.value, label: g.label }));
                setGradeBlockOptions([{ value: "all", label: "Tất cả" }, ...blocks]);

                setSelectedClass((prev) => {
                    if (prev && classes.some((c) => c.value === prev)) return prev;
                    return classes[0]?.value || "";
                });
            } catch (e) {
                if (gen === catalogGenRef.current) {
                    console.warn("Failed to fetch catalog data:", e);
                }
            }
        })();

        return () => {
            catalogGenRef.current += 1;
        };
    }, [selectedSchoolYear]);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const [schoolYearId, semesterId] = await Promise.all([
                resolveSchoolYearId(selectedSchoolYear),
                resolveSemesterId(selectedSchoolYear, selectedTerm),
            ]);
            if (!cancelled) {
                setPeriodIds({ schoolYearId: schoolYearId ?? null, semesterId: semesterId ?? null });
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [selectedSchoolYear, selectedTerm]);

    // Helper: get teacher ID from name
    const getTeacherIdByName = (teacherName) => {
        const teacher = realTeachers.find(t => t.label === teacherName || t.value === teacherName || t.name === teacherName);
        return teacher?.id || null;
    };

    // Helper: get room ID from name
    const getRoomIdByName = (roomName) => {
        const room = realRooms.find(r => r.value === roomName || r.name === roomName);
        return room?.id || null;
    };

    // Helper: get class ID from name
    const getClassIdByName = (className) => {
        const cls = realClasses.find(c => c.value === className || c.label === className || c.name === className);
        return cls?.id || null;
    };

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (lessonData) => timetableService.createLesson(lessonData),
        onSuccess: () => {
            toast.success("Thêm tiết học thành công!");
            queryClient.invalidateQueries({ queryKey: ["timetable"] });
        },
        onError: (error) => {
            const msg = error?.response?.data?.message || error?.response?.data?.error || "Không thể thêm tiết học.";
            toast.error(msg);
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => timetableService.updateLesson(id, data),
        onSuccess: () => {
            toast.success("Cập nhật tiết học thành công!");
            queryClient.invalidateQueries({ queryKey: ["timetable"] });
        },
        onError: (error) => {
            const msg = error?.response?.data?.message || error?.response?.data?.error || "Không thể cập nhật tiết học.";
            toast.error(msg);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => timetableService.deleteLesson(id),
        onSuccess: () => {
            toast.success("Xóa tiết học thành công!");
            queryClient.invalidateQueries({ queryKey: ["timetable"] });
        },
        onError: (error) => {
            const msg = error?.response?.data?.message || error?.response?.data?.error || "Không thể xóa tiết học.";
            toast.error(msg);
        },
    });

    const classOptions = realClasses.map((c) => c.value);
    const blockOptions = gradeBlockOptions;
    const filteredClassOptions = useMemo(() => {
        if (selectedBlock === "all") return classOptions;
        return realClasses
            .filter((c) => c.gradeNumber === selectedBlock)
            .map((c) => c.value);
    }, [classOptions, realClasses, selectedBlock]);

    const selectedClassRecord = useMemo(
        () => realClasses.find((c) => c.value === selectedClass),
        [realClasses, selectedClass],
    );

    // Build display-name -> code and code -> display-name maps from realSubjects
    const subjectDisplayToCode = useMemo(() => {
        const m = {};
        (realSubjects || []).forEach(s => { if (s.code) m[s.label] = s.code; });
        return m;
    }, [realSubjects]);

    const isConsecutiveSubject = (displayName) => {
        const code = subjectDisplayToCode[displayName] || displayName;
        return GDPT_2018_CONFIG.CONSECUTIVE_SUBJECTS.includes(code);
    };

    // Default emptyForm derived from real data
    const emptyForm = useMemo(() => ({
        className: realClasses[0]?.value || "",
        day: "Thứ 2",
        period: 1,
        periodEnd: 1,
        subject: realSubjects[0]?.label || "",
        teacher: realTeachers[0]?.label || "",
        room: realRooms[0]?.value || "",
        status: STATUS_META.normal.label,
        note: "",
        mode: MODE_META.offline,
    }), [realSubjects, realRooms, realTeachers, realClasses]);

    useEffect(() => {
        const classId = selectedClassRecord?.id;
        if (!classId || !selectedClass) {
            setSessions([]);
            return;
        }

        if (!periodIds.schoolYearId || !periodIds.semesterId) {
            setSessions([]);
            setLoadError("Chưa có dữ liệu năm học/học kỳ này trong hệ thống.");
            return;
        }

        let cancelled = false;

        const timer = setTimeout(async () => {
            setIsLoading(true);
            setLoadError("");
            try {
                const params = {
                    schoolYearId: periodIds.schoolYearId,
                    semesterId: periodIds.semesterId,
                    classId,
                };

                if (selectedDay !== "Tất cả thứ") {
                    const dayOfWeek = dayLabelToApiDayOfWeek(selectedDay);
                    if (dayOfWeek) params.dayOfWeek = dayOfWeek;
                }

                const data = await timetableService.listTimetable(params);
                if (cancelled) return;

                const mapped = data.map((p) =>
                    mapApiLessonToSession(p, { selectedClass, selectedSchoolYear, selectedTerm }),
                );
                setSessions(mapped);

                const hasMorning = mapped.some((s) => s.period <= 5);
                const hasAfternoon = mapped.some((s) => s.period >= 6);
                if (mapped.length > 0 && !hasMorning && hasAfternoon) {
                    setSessionView("afternoon");
                }
            } catch (error) {
                if (!cancelled) {
                    console.warn("Failed to fetch real timetable:", error);
                    setSessions([]);
                    if (error?.response?.status === 429) {
                        setLoadError("Quá nhiều yêu cầu. Vui lòng đợi vài giây rồi tải lại trang.");
                    } else {
                        setLoadError(getErrorMessage(error, "Không thể tải thời khóa biểu."));
                    }
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }, 350);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [
        periodIds.schoolYearId,
        periodIds.semesterId,
        selectedClassRecord?.id,
        selectedClass,
        selectedDay,
        selectedSchoolYear,
        selectedTerm,
    ]);


    useEffect(() => {
        if (filteredClassOptions.length === 0) {
            if (selectedClass) setSelectedClass("");
            return;
        }
        if (!filteredClassOptions.includes(selectedClass)) {
            setSelectedClass(filteredClassOptions[0]);
        }
    }, [selectedBlock, filteredClassOptions, selectedClass]);

    // Tính lại danh sách giáo viên filter dựa trên tuần, lớp, ngày
    const teacherOptions = useMemo(() => {
        let filtered = sessions;
        if (selectedDay !== "Tất cả thứ") {
            filtered = filtered.filter((item) => item.day === selectedDay);
        }
        const names = Array.from(new Set(filtered.map((item) => item.teacher).filter(Boolean)));
        return ["Tất cả giáo viên", ...names];
    }, [sessions, selectedDay]);

    // Nếu selectedTeacher không còn hợp lệ thì reset về "Tất cả giáo viên"
    React.useEffect(() => {
        if (!teacherOptions.includes(selectedTeacher)) {
            setSelectedTeacher("Tất cả giáo viên");
        }
    }, [teacherOptions, selectedTeacher]);

    const dayFilterOptions = ["Tất cả thứ", ...dayOptions];

    const visiblePeriods = useMemo(() => (
        sessionView === "morning" ? periodOptions.slice(0, 5) : periodOptions.slice(5, 10)
    ), [sessionView]);

    const sessionsInTerm = sessions;

    const progressLabel = useMemo(() => {
        const classesWithSessions = sessions.length > 0 ? 1 : 0;
        return `${classesWithSessions}/${classOptions.length} lớp`;
    }, [sessions, classOptions]);

    const sessionsInTermByClass = sessions;

    const timetableSessions = useMemo(() => {
        return sessions.filter((item) => {
            const matchesTeacher = selectedTeacher === "Tất cả giáo viên" || item.teacher === selectedTeacher;
            const matchesDay = selectedDay === "Tất cả thứ" || item.day === selectedDay;
            const keyword = normalizeText(searchTerm);
            const matchesKeyword =
                !keyword ||
                normalizeText(item.subject).includes(keyword) ||
                normalizeText(item.teacher).includes(keyword) ||
                normalizeText(item.room).includes(keyword);

            return matchesTeacher && matchesDay && matchesKeyword;
        });
    }, [sessions, selectedTeacher, selectedDay, searchTerm]);

    const conflicts = useMemo(() => {
        const scoped = sessionsInTerm.filter((item) => {
            const matchDay = selectedDay === "Tất cả thứ" || item.day === selectedDay;
            const matchTeacher = selectedTeacher === "Tất cả giáo viên" || item.teacher === selectedTeacher;
            return matchDay && matchTeacher;
        });

        const map = new Map();
        scoped.forEach((item) => {
            const key = `${item.day}-${item.period}`;
            const prev = map.get(key) || [];
            map.set(key, [...prev, item]);
        });

        const found = [];
        map.forEach((group, key) => {
            if (group.length < 2) return;

            for (let i = 0; i < group.length; i += 1) {
                for (let j = i + 1; j < group.length; j += 1) {
                    const a = group[i];
                    const b = group[j];
                    if (a.teacher === b.teacher) {
                        found.push({
                            id: `teacher-${a.id}-${b.id}`,
                            type: "Giáo viên",
                            dayPeriod: key,
                            detail: `${a.teacher} bị trùng giữa lớp ${a.className} và ${b.className}.`,
                        });
                    }
                    if (a.room === b.room) {
                        found.push({
                            id: `room-${a.id}-${b.id}`,
                            type: "Phòng",
                            dayPeriod: key,
                            detail: `${a.room} bị trùng giữa lớp ${a.className} và ${b.className}.`,
                        });
                    }
                }
            }
        });

        return found;
    }, [sessionsInTerm, selectedDay, selectedTeacher]);

    const slotsMap = useMemo(() => {
        const map = new Map();
        timetableSessions.forEach((item) => {
            const periodEnd = item.periodEnd || item.period;
            for (let period = item.period; period <= periodEnd; period += 1) {
                map.set(`${item.day}-${period}`, item);
            }
        });
        return map;
    }, [timetableSessions]);

    const getInitialPeriodEnd = (subject, period) => {
        const code = subjectDisplayToCode[subject] || subject;
        if (GDPT_2018_CONFIG.CONSECUTIVE_SUBJECTS.includes(code)) {
            if (period < 5 || (period >= 6 && period < 10)) {
                return period + 1;
            }
        }
        return period;
    };

    const openCreateModal = () => {
        const period = visiblePeriods[0] || 1;
        setFormData({
            ...emptyForm,
            className: selectedClass,
            day: "Thứ 2",
            period: period,
            periodEnd: getInitialPeriodEnd(emptyForm.subject, period),
        });
        setActiveSessionId(null);
        setActiveModalMode("create");
    };

    const openCreateFromSlot = (day, period) => {
        setFormData({ 
            ...emptyForm, 
            className: selectedClass, 
            day, 
            period, 
            periodEnd: getInitialPeriodEnd(emptyForm.subject, period) 
        });
        setActiveSessionId(null);
        setActiveModalMode("create");
    };

    const openEditModal = (session) => {
        setFormData({
            className: session.className,
            day: session.day,
            period: session.period,
            periodEnd: session.periodEnd || session.period,
            subject: session.subjectKey || "",
            teacher: session.teacher || "",
            room: session.room,
            status: session.status,
            note: session.note || "",
            mode: session.mode || MODE_META.offline,
        });
        setActiveSessionId(session.id);
        setActiveModalMode("edit");
    };

    const closeModal = () => {
        setActiveModalMode(null);
        setActiveSessionId(null);
        setFormData(emptyForm);
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => {
            const nextData = { ...prev };
            
            if (name === "subject") {
                nextData.subject = value;

                if (isConsecutiveSubject(value)) {
                    if (prev.period < 5 || (prev.period >= 6 && prev.period < 10)) {
                        nextData.periodEnd = prev.period + 1;
                    }
                } else {
                    nextData.periodEnd = prev.period;
                }

                // Reset teacher when subject changes, it will be re-filtered by the useEffect
                nextData.teacher = "";
            } else if (name === "period") {
                const p = Number(value);
                nextData.period = p;
                if (isConsecutiveSubject(prev.subject)) {
                    if (p < 5 || (p >= 6 && p < 10)) {
                        nextData.periodEnd = p + 1;
                    } else {
                        nextData.periodEnd = p;
                    }
                } else {
                    nextData.periodEnd = p;
                }
            } else {
                nextData[name] = name === "periodEnd" ? Number(value) : value;
            }

            return nextData;
        });
    };

    const handleResetTimetable = () => {
        if (timetableSessions.length === 0) return;
        
        const isFiltered = selectedTeacher !== "Tất cả giáo viên" || selectedDay !== "Tất cả thứ" || searchTerm.trim() !== "";
        const confirmMsg = isFiltered
            ? `Bạn có chắc chắn muốn xóa ${timetableSessions.length} tiết học đang hiển thị theo bộ lọc hiện tại không?`
            : "Bạn có chắc chắn muốn xóa TOÀN BỘ thời khóa biểu của lớp này không?";

        if (window.confirm(confirmMsg)) {
            const visibleIds = new Set(timetableSessions.map(s => s.id));
            setSessions(prev => prev.filter(s => !visibleIds.has(s.id)));
        }
    };

    const handleDeleteSession = (id) => {
        const confirmed = window.confirm("Bạn có chắc muốn xóa tiết học này không?");
        if (!confirmed) return;
        deleteMutation.mutate(id);
        setSessions((prev) => prev.filter((item) => item.id !== id));
    };

    const handleSubmitModal = () => {
        if (!formData.subject.trim()) {
            window.alert("Vui lòng chọn môn học.");
            return;
        }

        if (formData.periodEnd < formData.period) {
            window.alert("Tiết kết thúc phải lớn hơn hoặc bằng tiết bắt đầu.");
            return;
        }

        const classSessions = sessions.filter(s => s.className === formData.className && s.year === selectedSchoolYear && s.term === selectedTerm);

        const currentSubjectPeriods = classSessions
            .filter(s => s.subjectKey === formData.subject && s.id !== activeSessionId)
            .reduce((sum, s) => sum + ((s.periodEnd || s.period) - s.period + 1), 0);

        const newPeriodsToAdd = (formData.periodEnd || formData.period) - formData.period + 1;
        const totalSubjectPeriods = currentSubjectPeriods + newPeriodsToAdd;

        const quota = GDPT_2018_CONFIG.QUOTAS[formData.subject] || 3;

        if (totalSubjectPeriods > quota) {
            window.alert(`Môn ${formData.subject} đã vượt quá định mức ${quota} tiết/tuần (Hiện tại: ${totalSubjectPeriods} tiết).`);
            return;
        }

        const totalClassPeriods = classSessions.reduce((sum, s) => sum + ((s.periodEnd || s.period) - s.period + 1), 0) + newPeriodsToAdd;

        if (totalClassPeriods > GDPT_2018_CONFIG.MAX_WEEKLY_PERIODS) {
            window.alert(`Lớp đã vượt quá tối đa ${GDPT_2018_CONFIG.MAX_WEEKLY_PERIODS} tiết/tuần.`);
            return;
        }

        const duplicatedClassSlot = sessions.find((item) => (
            item.year === selectedSchoolYear &&
            item.term === selectedTerm &&
            item.className === formData.className &&
            item.day === formData.day &&
            ((item.period <= formData.periodEnd && (item.periodEnd || item.period) >= formData.period)) &&
            item.id !== activeSessionId
        ));

        if (duplicatedClassSlot) {
            window.alert("Lớp đã có tiết học ở khung giờ này. Vui lòng chọn khung khác.");
            return;
        }

        // Prepare API payload
        const subjectCode = subjectDisplayToCode[formData.subject] || formData.subject;
        const apiPayload = {
            classId: getClassIdByName(formData.className),
            subjectCode: subjectCode,
            teacherId: getTeacherIdByName(formData.teacher),
            roomId: getRoomIdByName(formData.room),
            dayOfWeek: dayLabelToApiDayOfWeek(formData.day),
            periodNumber: formData.period,
            periodEnd: formData.periodEnd,
            semesterId: periodIds.semesterId,
            schoolYearId: periodIds.schoolYearId,
            note: formData.note || "",
            mode: formData.mode || MODE_META.offline,
        };

        if (activeModalMode === "edit" && activeSessionId) {
            updateMutation.mutate(
                { id: activeSessionId, data: apiPayload },
                {
                    onSuccess: () => {
                        setSessions((prev) => prev.map((item) => (
                            item.id === activeSessionId
                                ? {
                                    ...item,
                                    ...formData,
                                    subject: formData.subject,
                                    subjectKey: subjectCode,
                                    year: selectedSchoolYear,
                                    term: selectedTerm,
                                    start: getPeriodRangeLabel(formData.period, formData.period).split(" - ")[0],
                                    end: getPeriodRangeLabel(formData.period, formData.periodEnd).split(" - ")[1],
                                    color: SUBJECT_COLOR_MAP[subjectCode] || "teal",
                                }
                                : item
                        )));
                        closeModal();
                    },
                }
            );
        } else {
            createMutation.mutate(apiPayload, {
                onSuccess: () => {
                    setSessions((prev) => [
                        {
                            id: Date.now(),
                            year: selectedSchoolYear,
                            term: selectedTerm,
                            ...formData,
                            subject: formData.subject,
                            subjectKey: subjectCode,
                            start: getPeriodRangeLabel(formData.period, formData.period).split(" - ")[0],
                            end: getPeriodRangeLabel(formData.period, formData.periodEnd).split(" - ")[1],
                            color: SUBJECT_COLOR_MAP[subjectCode] || "teal",
                        },
                        ...prev,
                    ]);
                    closeModal();
                },
            });
        }
    };

    return (
        <div className="admin-timetable-page">
            <TimetableFiltersSection
                totalSessions={sessionsInTermByClass.length}
                progressLabel={progressLabel}
                blockOptions={blockOptions}
                selectedBlock={selectedBlock}
                onBlockChange={setSelectedBlock}
                classOptions={filteredClassOptions}
                teacherOptions={teacherOptions}
                dayOptions={dayFilterOptions}
                selectedClass={selectedClass}
                selectedTeacher={selectedTeacher}
                selectedDay={selectedDay}
                searchTerm={searchTerm}
                onClassChange={setSelectedClass}
                onTeacherChange={setSelectedTeacher}
                onDayChange={setSelectedDay}
                onSearchChange={setSearchTerm}
                onCreateSession={openCreateModal}
                onReset={handleResetTimetable}
            >
                <SchoolYearTermSelector
                    selectedSchoolYear={selectedSchoolYear}
                    selectedTerm={selectedTerm}
                    onYearChange={handleYearArrow}
                    onTermChange={handleTermChange}
                />
            </TimetableFiltersSection>

            <div className="admin-timetable-content-grid">
                {isLoading ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>Đang tải dữ liệu...</div>
                ) : loadError ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#c0392b" }}>{loadError}</div>
                ) : timetableSessions.length === 0 && sessions.length > 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                        Có {sessions.length} tiết nhưng không khớp bộ lọc (thử đổi thứ / giáo viên / buổi Chiều).
                    </div>
                ) : (
                    <ScheduleSlotSection
                        selectedClass={selectedClass}
                        sessionView={sessionView}
                        days={selectedDay === "Tất cả thứ" ? dayOptions : [selectedDay]}
                        periods={visiblePeriods}
                        slotsMap={slotsMap}
                        onCreateFromSlot={openCreateFromSlot}
                        onEditSlot={openEditModal}
                        onDeleteSlot={handleDeleteSession}
                        onSessionViewChange={setSessionView}
                        onCreateSession={openCreateModal}
                        onReset={handleResetTimetable}
                        currentPeriods={sessionsInTermByClass.reduce((sum, s) => sum + ((s.periodEnd || s.period) - s.period + 1), 0)}
                        maxPeriods={GDPT_2018_CONFIG.MAX_WEEKLY_PERIODS}
                        canManage
                    />
                )}
            </div>

            {activeModalMode && formData && (
                <LessonModal
                    mode={activeModalMode}
                    formData={formData}
                    allSessions={sessions}
                    activeSessionId={activeSessionId}
                    onChange={handleFormChange}
                    onClose={closeModal}
                    onSubmit={handleSubmitModal}
                    realTeachers={realTeachers}
                    realRooms={realRooms}
                    realSubjects={realSubjects}
                    realClasses={realClasses}
                    subjectDisplayToCode={subjectDisplayToCode}
                    periodIds={periodIds}
                    selectedClassRecord={selectedClassRecord}
                />
            )}

            <Modal
                open={isConflictModalOpen}
                title="Kiểm tra xung đột"
                onClose={() => setIsConflictModalOpen(false)}
                className="tt-conflict-modal"
            >
                <ConflictCheckSection conflicts={conflicts} inDialog />
            </Modal>
        </div>
    );
}
