import React, { useMemo, useState, useCallback } from "react";
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
import timetableService from "../../../services/pages/management/timetable/timetableService";
import { adminApiService } from "../../../services/pages/admin/generated";
import axiosClient from "../../../services/shared/http/axiosClient";

const getErrorMessage = (error, fallback) => {
    const apiError = error?.response?.data?.error;
    const apiMessage = error?.response?.data?.message;
    return apiMessage || apiError || fallback;
};

const dayOptions = WEEK_DAYS.map((item) => item.label);
const periodOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
}

function LessonModal({ mode, formData, onChange, onClose, onSubmit, allSessions, activeSessionId, realTeachers, realRooms, realSubjects, realClasses, subjectDisplayToCode }) {
    const allTeacherNames = (realTeachers || []).map(t => t.label || t.value).filter(Boolean);
    const classOptions = (realClasses || []).map(c => c.value || c).filter(Boolean);
    const subjectOptions = (realSubjects || []).map(s => s.value || s).filter(Boolean);
    const roomOptions = (realRooms || []).map(r => r.value || r).filter(Boolean);

    const isConsecutiveSubject = (displayName) => {
        const code = (subjectDisplayToCode || {})[displayName] || displayName;
        return GDPT_2018_CONFIG.CONSECUTIVE_SUBJECTS.includes(code);
    };

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

    const emit = (name, value) => onChange({ target: { name, value } });

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
                                    allTeacherNames.length === 0
                                        ? [{ value: "", label: "Không có giáo viên" }]
                                        : allTeacherNames.map((name) => {
                                            const status = getTeacherStatus(name);
                                            return {
                                                value: name,
                                                label: status?.busy ? `${name} (Đang bận - Lớp ${status.class})` : `${name}`
                                            };
                                        })
                                }
                                disabled={allTeacherNames.length === 0}
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
    const { 
        selectedSchoolYear = "2025-2026", 
        selectedTerm = "hk1", 
        handleYearArrow, 
        handleTermChange 
    } = useSchoolYearTerm() || {};
    const [sessions, setSessions] = useState([]);
    const [selectedBlock, setSelectedBlock] = useState("10");
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

    const fetchCatalogData = useCallback(async () => {
        try {
            const [subjectsRes, roomsRes, teachersRes, classesRes] = await Promise.all([
                adminApiService.get_subjects(),
                axiosClient.get("/rooms"),
                adminApiService.get_teachers(),
                adminApiService.get_classes(),
            ]);

            const subjects = (subjectsRes?.data || []).map(s => ({
                value: s.name,   // display name for form value
                label: s.name,   // display name for dropdown label
                code: s.code,     // subject code for API/subjectKey
            }));
            const rooms = (roomsRes?.data || []).map(r => ({
                value: r.name,
                label: `${r.name} (Tòa ${r.building || "?"})`,
            }));
            const teachers = (teachersRes?.data || []).map(t => ({
                value: t.fullName || t.full_name || t.name || "",
                label: t.fullName || t.full_name || t.name || "",
            }));
            const classes = (classesRes?.data || []).map(c => ({
                value: c.class_name || c.name || "",
                label: c.class_name || c.name || "",
            }));

            setRealSubjects(subjects);
            setRealRooms(rooms);
            setRealTeachers(teachers);
            setRealClasses(classes);

            if (classes.length > 0 && !selectedClass) {
                setSelectedClass(classes[0].value);
            }
        } catch (e) {
            console.warn("Failed to fetch catalog data:", e);
        }
    }, [selectedClass]);

    React.useEffect(() => { fetchCatalogData(); }, [fetchCatalogData]);

    // Derived options
    const classOptions = realClasses.map(c => c.value);
    const blockOptions = Array.from(new Set(classOptions.map((c) => c.slice(0, 2))));
    const filteredClassOptions = useMemo(() => classOptions.filter((c) => c.startsWith(selectedBlock)), [classOptions, selectedBlock]);

    // Build display-name -> code and code -> display-name maps from realSubjects
    const subjectDisplayToCode = useMemo(() => {
        const m = {};
        (realSubjects || []).forEach(s => { if (s.code) m[s.label] = s.code; });
        return m;
    }, [realSubjects]);

    const subjectCodeToDisplay = useMemo(() => {
        const m = {};
        (realSubjects || []).forEach(s => { if (s.code) m[s.code] = s.label; });
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

    // Mapping for Day of Week
    const apiDayToLabel = ["", "Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

    // Fetch data from API
    React.useEffect(() => {
        const fetchTimetable = async () => {
            setIsLoading(true);
            setLoadError("");
            try {
                const data = await timetableService.listTimetable();
                // Map API periods to UI sessions
                const mapped = data.map(p => {
                    const subjectName = p.class_teacher_subject?.subject_assignments?.display_name || "Môn học";
                    const teacherName = p.class_teacher_subject?.teachers?.fullName || p.class_teacher_subject?.teachers?.name || "Chưa phân công";
                    const className = p.class_teacher_subject?.classes?.class_name || "Lớp";
                    
                    // Simple start/end time extraction
                    const startStr = p.start_time ? String(p.start_time).slice(11, 16) : "";
                    const endStr = p.end_time ? String(p.end_time).slice(11, 16) : "";

                    return {
                        id: p.id,
                        year: selectedSchoolYear,
                        term: selectedTerm,
                        className: className,
                        day: apiDayToLabel[p.day_of_week] || "Thứ 2",
                        period: p.period_number || 1,
                        periodEnd: p.period_number || 1, // API usually returns per period, so start=end
                        subject: subjectName,
                        subjectKey: p.class_teacher_subject?.subject_assignments?.subject_code || "TOAN",
                        teacher: teacherName,
                        room: p.room || "—",
                        status: STATUS_META.normal.label,
                        note: p.note || "",
                        mode: MODE_META.offline,
                        color: SUBJECT_COLOR_MAP[p.class_teacher_subject?.subject_assignments?.subject_code] || "teal",
                        start: startStr,
                        end: endStr
                    };
                });
                setSessions(mapped);
            } catch (error) {
                console.warn("Failed to fetch real timetable, using empty data:", error);
                // setLoadError(getErrorMessage(error, "Không thể tải thời khóa biểu."));
            } finally {
                setIsLoading(false);
            }
        };
        fetchTimetable();
    }, [selectedSchoolYear, selectedTerm]);


    // Khi đổi block, cập nhật selectedClass về lớp đầu tiên của block đó
    React.useEffect(() => {
        if (!filteredClassOptions.includes(selectedClass)) {
            setSelectedClass(filteredClassOptions[0]);
        }
    }, [selectedBlock, filteredClassOptions, selectedClass]);

    // Tính lại danh sách giáo viên filter dựa trên tuần, lớp, ngày
    const teacherOptions = useMemo(() => {
        let filtered = sessions.filter((item) => 
            item.year === selectedSchoolYear && 
            item.term === selectedTerm && 
            item.className === selectedClass
        );
        if (selectedDay !== "Tất cả thứ") {
            filtered = filtered.filter((item) => item.day === selectedDay);
        }
        const names = Array.from(new Set(filtered.map((item) => item.teacher).filter(Boolean)));
        return ["Tất cả giáo viên", ...names];
    }, [sessions, selectedSchoolYear, selectedTerm, selectedClass, selectedDay]);

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

    const sessionsInTerm = useMemo(
        () => sessions.filter((item) => item.year === selectedSchoolYear && item.term === selectedTerm),
        [sessions, selectedSchoolYear, selectedTerm]
    );

    // [NEW] Tính tiến độ xếp lớp
    const progressLabel = useMemo(() => {
        const classesWithSessions = new Set(sessionsInTerm.map(s => s.className)).size;
        return `${classesWithSessions}/${classOptions.length} lớp`;
    }, [sessionsInTerm]);

    const sessionsInTermByClass = useMemo(
        () => sessionsInTerm.filter((item) => item.className === selectedClass),
        [sessionsInTerm, selectedClass]
    );

    const timetableSessions = useMemo(() => {
        return sessionsInTerm.filter((item) => {
            const matchesClass = item.className === selectedClass;
            const matchesTeacher = selectedTeacher === "Tất cả giáo viên" || item.teacher === selectedTeacher;
            const matchesDay = selectedDay === "Tất cả thứ" || item.day === selectedDay;
            const keyword = normalizeText(searchTerm);
            const matchesKeyword =
                !keyword ||
                normalizeText(item.subject).includes(keyword) ||
                normalizeText(item.teacher).includes(keyword) ||
                normalizeText(item.room).includes(keyword);

            return matchesClass && matchesTeacher && matchesDay && matchesKeyword;
        });
    }, [sessionsInTerm, selectedClass, selectedTeacher, selectedDay, searchTerm]);

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

        // [NEW] Final check for Quota and Teacher/Room availability
        const classSessions = sessions.filter(s => s.className === formData.className && s.year === selectedSchoolYear && s.term === selectedTerm);
        
        // Tính tổng số tiết của môn học hiện tại (bao gồm cả tiết đôi/ba...)
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

        if (activeModalMode === "edit" && activeSessionId) {
            setSessions((prev) => prev.map((item) => (
                item.id === activeSessionId
                    ? {
                        ...item,
                        ...formData,
                        subject: formData.subject,
                        subjectKey: subjectDisplayToCode[formData.subject] || formData.subject,
                        year: selectedSchoolYear,
                        term: selectedTerm,
                        start: getPeriodRangeLabel(formData.period, formData.period).split(" - ")[0],
                        end: getPeriodRangeLabel(formData.period, formData.periodEnd).split(" - ")[1],
                        color: SUBJECT_COLOR_MAP[subjectDisplayToCode[formData.subject] || formData.subject] || "teal",
                    }
                    : item
            )));
        } else {
            setSessions((prev) => [
                {
                    id: Date.now(),
                    year: selectedSchoolYear,
                    term: selectedTerm,
                    ...formData,
                    subject: formData.subject,
                    subjectKey: subjectDisplayToCode[formData.subject] || formData.subject,
                    start: getPeriodRangeLabel(formData.period, formData.period).split(" - ")[0],
                    end: getPeriodRangeLabel(formData.period, formData.periodEnd).split(" - ")[1],
                    color: SUBJECT_COLOR_MAP[subjectDisplayToCode[formData.subject] || formData.subject] || "teal",
                },
                ...prev,
            ]);
        }

        closeModal();
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
                    <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>{loadError}</div>
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

