import React, { useMemo, useState } from "react";
import "./AdminTimetable.css";
import TimetableFiltersSection from "./components/timetableFiltersSection/timetableFiltersSection";
import ScheduleSlotSection from "./components/scheduleSlotSection/scheduleSlotSection";
import ConflictCheckSection from "./components/conflictCheckSection/conflictCheckSection";
import Modal from "../../../components/ui/Modal/Modal";
import { SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiUsers, FiCalendar, FiClock, FiBook, FiUser, FiMapPin, FiActivity, FiX, FiCheckCircle, FiSave, FiPlus } from "react-icons/fi";
import { buildAdminInitialSessions, CLASS_OPTIONS, WEEK_DAYS, STATUS_META, MODE_META, getPeriodRangeLabel } from "../../../utils/timetableShared";

const classOptions = CLASS_OPTIONS;
// Tạo blockOptions từ classOptions (lấy ký tự đầu, loại trùng)
const blockOptions = Array.from(new Set(classOptions.map((c) => c.slice(0, 2))));
const dayOptions = WEEK_DAYS.map((item) => item.label);
const periodOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];


const initialSessions = buildAdminInitialSessions();

const teacherCatalog = Array.from(
    new Map(initialSessions.map((item) => [item.teacher, item.subject])).entries()
).map(([name, subject]) => ({ name, subject }));

const subjectTeacherMap = teacherCatalog.reduce((acc, item) => {
    if (!acc[item.subject]) acc[item.subject] = [];
    acc[item.subject].push(item.name);
    return acc;
}, {});

const subjectOptions = Object.keys(subjectTeacherMap);

function getTeachersBySubject(subject) {
    return subjectTeacherMap[subject] || [];
}

const defaultSubject = subjectOptions[0] || "";
const defaultTeacher = getTeachersBySubject(defaultSubject)[0] || "";

const emptyForm = {
    className: "10A1",
    day: "Thứ 2",
    period: 1,
    periodEnd: 1,
    subject: defaultSubject,
    teacher: defaultTeacher,
    room: "",
    status: STATUS_META.normal.label,
    note: "",
    mode: MODE_META.offline,
};

function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
}

function LessonModal({ mode, formData, subjectOptions, onChange, onClose, onSubmit }) {
    const teacherOptionsBySubject = getTeachersBySubject(formData.subject);

    return (
        <div className="admin-timetable-modal-overlay">
            <div className="admin-timetable-modal exp-modal-card lesson-modal-wide">
                <div className="modal-header exp-header">
                    <div className="modal-icon-circle">
                        {mode === "edit" ? <FiCheckCircle /> : <FiPlus />}
                    </div>
                    <h3>{mode === "edit" ? "Cập nhật tiết học" : "Thêm tiết học mới"}</h3>
                    <p>Chỉnh sửa thông tin chi tiết cho khung giờ đã chọn.</p>
                    <button className="modal-close-btn" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className="modal-body exp-body">
                    <div className="exp-form-grid">
                        <div className="exp-form-item">
                            <label className="exp-label"><FiUsers /> Lớp</label>
                            <div className="exp-input-wrapper">
                                <select className="exp-select" name="className" value={formData.className} onChange={onChange}>
                                    {classOptions.map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="exp-form-item">
                            <label className="exp-label"><FiCalendar /> Thứ</label>
                            <div className="exp-input-wrapper">
                                <select className="exp-select" name="day" value={formData.day} onChange={onChange}>
                                    {dayOptions.map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="exp-form-item">
                            <label className="exp-label"><FiClock /> Tiết</label>
                            <div className="exp-input-wrapper">
                                <select className="exp-select" name="period" value={formData.period} onChange={onChange}>
                                    {periodOptions.map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="exp-form-item">
                            <label className="exp-label"><FiClock /> Đến tiết</label>
                            <div className="exp-input-wrapper">
                                <select className="exp-select" name="periodEnd" value={formData.periodEnd} onChange={onChange}>
                                    {periodOptions.filter((item) => item >= formData.period).map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="exp-form-item">
                            <label className="exp-label"><FiBook /> Môn học</label>
                            <div className="exp-input-wrapper">
                                <select className="exp-select" name="subject" value={formData.subject} onChange={onChange}>
                                    {subjectOptions.map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="exp-form-item full-width">
                            <label className="exp-label"><FiUser /> Giáo viên giảng dạy</label>
                            <div className="exp-input-wrapper">
                                <select 
                                    className="exp-select"
                                    name="teacher"
                                    value={formData.teacher}
                                    onChange={onChange}
                                    disabled={teacherOptionsBySubject.length === 0}
                                >
                                    {teacherOptionsBySubject.length === 0 ? (
                                        <option value="">Không có giáo viên cho môn này</option>
                                    ) : (
                                        teacherOptionsBySubject.map((item) => (
                                            <option key={item} value={item}>{item}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="exp-form-item">
                            <label className="exp-label"><FiMapPin /> Phòng học</label>
                            <div className="exp-input-wrapper">
                                <input 
                                    className="exp-input"
                                    name="room" 
                                    value={formData.room} 
                                    onChange={onChange} 
                                    placeholder="VD: P201" 
                                />
                            </div>
                        </div>

                        <div className="exp-form-item">
                            <label className="exp-label"><FiActivity /> Trạng thái</label>
                            <div className="exp-input-wrapper">
                                <select className="exp-select" name="status" value={formData.status} onChange={onChange}>
                                    {Object.values(STATUS_META).map((status) => (
                                        <option key={status.label} value={status.label}>{status.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="exp-form-item">
                            <label className="exp-label"><FiActivity /> Hình thức</label>
                            <div className="exp-input-wrapper">
                                <select className="exp-select" name="mode" value={formData.mode} onChange={onChange}>
                                    {Object.values(MODE_META).map((mode) => (
                                        <option key={mode} value={mode}>{mode}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="exp-form-item full-width">
                            <label className="exp-label"><FiActivity /> Ghi chú</label>
                            <div className="exp-input-wrapper">
                                <input
                                    className="exp-input"
                                    name="note"
                                    value={formData.note}
                                    onChange={onChange}
                                    placeholder="Noi dung tiet hoc"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer exp-footer">
                    <button type="button" className="exp-btn-cancel" onClick={onClose}>Hủy bỏ</button>
                    <button type="button" className="exp-btn-submit" onClick={onSubmit}>
                        {mode === "edit" ? <FiSave /> : <FiPlus />}
                        {mode === "edit" ? "Lưu thay đổi" : "Thêm tiết học"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminTimetable() {
    const { 
        selectedSchoolYear = "2025-2026", 
        selectedTerm = "hk1", 
        handleYearArrow, 
        handleTermChange 
    } = useSchoolYearTerm() || {};
    const [sessions, setSessions] = useState(initialSessions);
    // Thêm state cho selectedBlock
    const [selectedBlock, setSelectedBlock] = useState(blockOptions[0]);
    // Khi đổi block, selectedClass sẽ là lớp đầu tiên của block đó
    const filteredClassOptions = useMemo(() => classOptions.filter((c) => c.startsWith(selectedBlock)), [selectedBlock]);
    const [selectedClass, setSelectedClass] = useState(filteredClassOptions[0]);
    const [selectedTeacher, setSelectedTeacher] = useState("Tất cả giáo viên");
    const [selectedDay, setSelectedDay] = useState("Tất cả thứ");
    const [searchTerm, setSearchTerm] = useState("");
    const [sessionView, setSessionView] = useState("morning");

    const [activeModalMode, setActiveModalMode] = useState(null);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);


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

    const openCreateModal = () => {
        setFormData({
            ...emptyForm,
            className: selectedClass,
            day: "Thứ 2",
            period: visiblePeriods[0] || 1,
            periodEnd: visiblePeriods[0] || 1,
        });
        setActiveSessionId(null);
        setActiveModalMode("create");
    };

    const openCreateFromSlot = (day, period) => {
        setFormData({ ...emptyForm, className: selectedClass, day, period, periodEnd: period });
        setActiveSessionId(null);
        setActiveModalMode("create");
    };

    const openEditModal = (session) => {
        const teachersOfSubject = getTeachersBySubject(session.subject);
        const safeTeacher = teachersOfSubject.includes(session.teacher)
            ? session.teacher
            : (teachersOfSubject[0] || "");

        setFormData({
            className: session.className,
            day: session.day,
            period: session.period,
            periodEnd: session.periodEnd || session.period,
            subject: session.subject,
            teacher: safeTeacher,
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
            if (name === "subject") {
                const teachersOfSubject = getTeachersBySubject(value);
                return {
                    ...prev,
                    subject: value,
                    teacher: teachersOfSubject[0] || "",
                };
            }

            return {
                ...prev,
                [name]: name === "period" || name === "periodEnd" ? Number(value) : value,
            };
        });
    };

    const handleDeleteSession = (id) => {
        const confirmed = window.confirm("Bạn có chắc muốn xóa tiết học này không?");
        if (!confirmed) return;
        setSessions((prev) => prev.filter((item) => item.id !== id));
    };

    const handleSubmitModal = () => {
        if (!formData.subject.trim() || !formData.teacher.trim() || !formData.room.trim()) {
            window.alert("Vui lòng nhập đầy đủ môn học, giáo viên và phòng học.");
            return;
        }

        if (formData.periodEnd < formData.period) {
            window.alert("Tiet ket thuc phai lon hon hoac bang tiet bat dau.");
            return;
        }

        const validTeachers = getTeachersBySubject(formData.subject);
        if (!validTeachers.includes(formData.teacher)) {
            window.alert("Giáo viên không thuộc môn đã chọn. Vui lòng chọn lại.");
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
                        year: selectedSchoolYear,
                        term: selectedTerm,
                        start: getPeriodRangeLabel(formData.period, formData.period).split(" - ")[0],
                        end: getPeriodRangeLabel(formData.period, formData.periodEnd).split(" - ")[1],
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
                    start: getPeriodRangeLabel(formData.period, formData.period).split(" - ")[0],
                    end: getPeriodRangeLabel(formData.period, formData.periodEnd).split(" - ")[1],
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
                conflictCount={conflicts.length}
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
                onOpenConflicts={() => setIsConflictModalOpen(true)}
            >
                <SchoolYearTermSelector
                    selectedSchoolYear={selectedSchoolYear}
                    selectedTerm={selectedTerm}
                    onYearChange={handleYearArrow}
                    onTermChange={handleTermChange}
                />
            </TimetableFiltersSection>

            <div className="admin-timetable-content-grid">
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
                    onOpenConflicts={() => setIsConflictModalOpen(true)}
                    conflictCount={conflicts.length}
                />
            </div>

            {activeModalMode && (
                <LessonModal
                    mode={activeModalMode}
                    formData={formData}
                    subjectOptions={subjectOptions}
                    onChange={handleFormChange}
                    onClose={closeModal}
                    onSubmit={handleSubmitModal}
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
