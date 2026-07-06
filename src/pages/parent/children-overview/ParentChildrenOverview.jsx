import React, { useEffect, useMemo, useState } from "react"
import "./ParentChildrenOverview.css"
import { SchoolYearTermSelector, LoadingSpinner } from "../../../components/common"
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm"
import { resolveSchoolYearId, resolveSemesterId } from "../../../services/shared/schoolYearLookup"
import ChildHeader from "./components/childHeader/ChildHeader"
import ChildTabs from "./components/ChildTabs/ChildTabs"
import AttendanceSection from "./components/attendanceSection/AttendanceSection"
import CalendarSection from "./components/calendarSection/CalendarSection"
import GradesSection from "./components/GradesSection/GradesSection"
import LeaveRequestSection from "./components/LeaveRequestSection/LeaveRequestSection"
import ConductSection from "./components/ConductSection/ConductSection"
import ChildSwitcher from "./components/ChildSwitcher/ChildSwitcher"
import { childrenOverviewService } from "../../../services/pages/parent/children-overview/childrenOverviewService"
import { getRows, transformParentGradesData } from "../shared/parentGradeUtils"

const DAY_MAP = {
    1: "Sunday",
    2: "Monday",
    3: "Tuesday",
    4: "Wednesday",
    5: "Thursday",
    6: "Friday",
    7: "Saturday",
    8: "Sunday",
}

const DAY_LABELS = {
    Monday: "Thứ 2",
    Tuesday: "Thứ 3",
    Wednesday: "Thứ 4",
    Thursday: "Thứ 5",
    Friday: "Thứ 6",
    Saturday: "Thứ 7",
    Sunday: "Chủ nhật",
}

const transformScheduleItem = (item) => ({
    id: item.id,
    day: DAY_MAP[item.dayOfWeek ?? item.day_of_week] || item.day || `Day${(item.dayOfWeek ?? item.day_of_week) || ""}`,
    periodStart: item.period_number ?? item.periodNumber ?? item.period,
    periodEnd: item.period_end ?? item.periodEnd ?? item.period_number ?? item.periodNumber ?? item.period,
    classId: item.class_teacher_subject?.classes?.id || item.class_id || item.classId || null,
    className: item.class_teacher_subject?.classes?.class_name || item.class_name || item.className || "",
    subject: item.class_teacher_subject?.subject_assignments?.display_name || item.subject_name || item.subjectName || item.subject || "—",
    teacher: item.class_teacher_subject?.teachers?.fullName || item.teacher_name || item.teacherName || "—",
    room: item.room || item.roomName || "—",
    start: item.start_time || "",
    end: item.end_time || "",
    timeRange: item.start_time && item.end_time ? `${item.start_time} - ${item.end_time}` : "",
    note: item.note || "",
    subjectKey: item.class_teacher_subject?.subject_assignments?.subject_code || "",
    status: "normal",
    mode: "offline",
    color: "",
})

const buildFullName = (item) =>
    item.name ||
    item.fullName ||
    [item.surname, item.given_name || item.givenName].filter(Boolean).join(" ").trim() ||
    "Học sinh"

const buildAverageScores = (gradesBySemester) => {
    const averageOf = (rows = []) => {
        const values = rows.map((row) => Number(row.average)).filter(Number.isFinite)
        if (!values.length) return "—"
        return (Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10).toFixed(1)
    }

    return {
        semester1: averageOf(gradesBySemester.hk1),
        semester2: averageOf(gradesBySemester.hk2),
        fullYear: averageOf(gradesBySemester.year),
    }
}

const normalizeChild = (child, selectedSchoolYear, gradesBySemester, index = 0) => {
    const name = buildFullName(child)
    return {
        ...child,
        name,
        studentId: child.studentId || child.student_code || child.studentCode || child.id,
        classId: child.classId || child.class_id || child.currentClassId || child.current_class_id || null,
        className: child.className || child.class_name || "Chưa xếp lớp",
        schoolYear: child.schoolYear || child.school_year_name || selectedSchoolYear,
        status: child.status || "Đang học",
        parentName: child.parentName || child.guardianName || "Phụ huynh",
        homeroomTeacher: child.homeroomTeacher || child.teacherName || "Chưa phân công",
        avatarLetter: child.avatarLetter || name.charAt(0),
        avatarColor: child.avatarColor || getAvatarColor(child.id || index),
        averageScores: child.averageScores || buildAverageScores(gradesBySemester),
    }
}

const normalizeEvent = (event) => ({
    id: event.id,
    title: event.title || event.name || "Sự kiện",
    date: event.date
        ? new Date(event.date).toLocaleDateString("vi-VN")
        : event.startDate
            ? new Date(event.startDate).toLocaleDateString("vi-VN")
            : "",
    type: event.eventType || event.event_type || event.type || "school-event",
})

const normalizeTitleKey = (value) =>
    String(value || "")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim()
        .toLowerCase()

const matchesSelectedClass = (lesson, selectedClassId, selectedClassKey) => {
    if (!selectedClassId && !selectedClassKey) return true
    const nameMatches = selectedClassKey && normalizeTitleKey(lesson.className) === selectedClassKey
    if (selectedClassId && lesson.classId != null) {
        return String(lesson.classId) === String(selectedClassId) || Boolean(nameMatches)
    }
    return Boolean(nameMatches)
}

const buildLessonEvent = (lesson, index) => {
    const periodLabel = `Tiết ${lesson.periodStart || "?"}${lesson.periodEnd > lesson.periodStart ? `-${lesson.periodEnd}` : ""}`
    const timeLabel = lesson.timeRange ? ` • ${lesson.timeRange}` : ""
    const roomLabel = lesson.room && lesson.room !== "—" ? ` • Phòng ${lesson.room}` : ""

    return {
        id: `lesson-event-${lesson.id || index}`,
        title: lesson.subject || "Tiết học",
        date: `${DAY_LABELS[lesson.day] || lesson.day || "Lịch học"} • ${periodLabel}${timeLabel}`,
        type: "Lịch học",
        description: `${periodLabel}${roomLabel}`,
        source: "schedule",
    }
}

const AVATAR_COLORS = [
    "linear-gradient(135deg, #a67cff, #7c4dff)",
    "linear-gradient(135deg, #f97316, #ef4444)",
    "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    "linear-gradient(135deg, #10b981, #047857)",
]

const getAvatarColor = (id) => {
    const idx = typeof id === "number" ? id : (String(id).charCodeAt(0) || 0)
    return AVATAR_COLORS[idx % AVATAR_COLORS.length]
}

const getParentName = () => {
    try {
        const isPersistent = localStorage.getItem("isPersistent") === "true";
        const userStr = sessionStorage.getItem("user") || (isPersistent ? localStorage.getItem("user") : null);
        const user = JSON.parse(userStr || "{}");
        if (user.surname || user.given_name) {
            return `${user.surname || ""} ${user.given_name || ""}`.trim();
        }
        return user.name || user.fullName || "Phụ huynh";
    } catch {
        return "Phụ huynh";
    }
}

const calculateSemesterGPA = (subjectsList) => {
    if (!subjectsList || !Array.isArray(subjectsList) || subjectsList.length === 0) return "—"
    const averages = subjectsList.map(s => s.average).filter(v => v != null)
    if (averages.length === 0) return "—"
    const sum = averages.reduce((a, b) => a + b, 0)
    return (Math.round((sum / averages.length) * 10) / 10).toFixed(1)
}

const calculateYearGPA = (hk1, hk2) => {
    const hk1Val = parseFloat(hk1)
    const hk2Val = parseFloat(hk2)
    if (isNaN(hk1Val) && isNaN(hk2Val)) return "—"
    if (isNaN(hk1Val)) return hk2Val.toFixed(1)
    if (isNaN(hk2Val)) return hk1Val.toFixed(1)
    return (Math.round(((hk1Val + hk2Val) / 2) * 10) / 10).toFixed(1)
}

const transformGradesData = (gradesArray) => {
    const bySemester = { hk1: [], hk2: [], year: [] }
    const hk1Map = {}
    const hk2Map = {}

    for (const g of gradesArray) {
        const key = g.subject_assignment_id || g.subject_name || g.subject
        const isHk1 = g.semester_id === 1 || String(g.semester_name || "").toLowerCase().includes("1")
        const targetMap = isHk1 ? hk1Map : hk2Map

        if (!targetMap[key]) {
            targetMap[key] = {
                subject: g.subject_name || g.subject || "—",
                oral: null,
                test15: null,
                midterm: null,
                final: null,
                average: null,
            }
        }

        const name = (g.grade_item_name || "").toLowerCase()
        const score = Number(g.score)
        if (name.includes("miệng") || name.includes("oral")) targetMap[key].oral = score
        else if (name.includes("15") || name.includes("15p") || name.includes("15phut")) targetMap[key].test15 = score
        else if (name.includes("giữa") || name.includes("midterm") || name.includes("gk")) targetMap[key].midterm = score
        else if (name.includes("cuối") || name.includes("final") || name.includes("ck")) targetMap[key].final = score
        else {
            if (targetMap[key].oral == null) targetMap[key].oral = score
            else if (targetMap[key].test15 == null) targetMap[key].test15 = score
            else if (targetMap[key].midterm == null) targetMap[key].midterm = score
            else targetMap[key].final = score
        }
    }

    const processMap = (map) => {
        const list = []
        for (const key of Object.keys(map)) {
            const s = map[key]
            const scores = [s.oral, s.test15, s.midterm, s.final].filter(v => v != null)
            if (scores.length > 0) {
                s.average = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
            }
            list.push(s)
        }
        return list
    }

    bySemester.hk1 = processMap(hk1Map)
    bySemester.hk2 = processMap(hk2Map)

    const allSubjects = new Set([...Object.keys(hk1Map), ...Object.keys(hk2Map)])
    for (const key of allSubjects) {
        const s1 = hk1Map[key]
        const s2 = hk2Map[key]
        const subjectName = s1?.subject || s2?.subject || "—"

        let yearAvg = null
        if (s1?.average != null && s2?.average != null) {
            yearAvg = Math.round(((s1.average + s2.average) / 2) * 10) / 10
        } else if (s1?.average != null) {
            yearAvg = s1.average
        } else if (s2?.average != null) {
            yearAvg = s2.average
        }

        bySemester.year.push({
            subject: subjectName,
            oral: null,
            test15: null,
            midterm: null,
            final: null,
            average: yearAvg,
        })
    }

    return bySemester
}

export default function ParentChildrenOverview() {
    const [childrenList, setChildrenList] = useState([])
    const [activeTab, setActiveTab] = useState("overview")
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm()
    const [selectedSemester, setSelectedSemester] = useState(selectedTerm)
    const [selectedChildId, setSelectedChildId] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [gradesBySemester, setGradesBySemester] = useState({ hk1: [], hk2: [], year: [] })
    const [attendanceRecords, setAttendanceRecords] = useState([])
    const [scheduleData, setScheduleData] = useState([])
    const [scheduleError, setScheduleError] = useState(null)
    const [upcomingEvents, setUpcomingEvents] = useState([])
    const [leaveRequests, setLeaveRequests] = useState([])
    const [conductSummary, setConductSummary] = useState(null)
    const [disciplineScores, setDisciplineScores] = useState(null)

    // 1. Fetch children list tu API
    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const res = await childrenOverviewService.listChildren({ mock: false })
                const children = getRows(res).map((child, idx) =>
                    normalizeChild(child, selectedSchoolYear, { hk1: [], hk2: [], year: [] }, idx)
                )
                if (children.length > 0) {
                    setChildrenList(children)
                    setSelectedChildId((currentId) => currentId || children[0].id)
                }
            } catch (err) {
                console.error("Error fetching children:", err)
                setChildrenList([])
            }
        }
        fetchChildren()
    }, [selectedSchoolYear])

    const childHeaderData = useMemo(() => {
        if (!selectedChildId || childrenList.length === 0) return null
        const currentChild = childrenList.find(c => c.id === selectedChildId)
        if (!currentChild) return null

        const hk1Avg = calculateSemesterGPA(gradesBySemester?.hk1)
        const hk2Avg = calculateSemesterGPA(gradesBySemester?.hk2)
        const fullYearAvg = calculateYearGPA(hk1Avg, hk2Avg)

        return {
            ...currentChild,
            schoolYear: currentChild.schoolYear || selectedSchoolYear,
            status: "Đang học",
            averageScores: {
                semester1: hk1Avg,
                semester2: hk2Avg,
                fullYear: fullYearAvg,
            }
        }
    }, [childrenList, selectedChildId, selectedSchoolYear, gradesBySemester])

    // 2. Fetch grades, attendance, schedule khi doi con
    useEffect(() => {
        if (!selectedChildId) return

        const fetchChildData = async () => {
            try {
                setIsLoading(true)
                const [semesterId, schoolYearId] = await Promise.all([
                    resolveSemesterId(selectedSchoolYear, selectedTerm),
                    resolveSchoolYearId(selectedSchoolYear),
                ])

                const [gradesRes, attendanceRes, scheduleRes, eventsRes] = await Promise.allSettled([
                    childrenOverviewService.getChildGrades({
                        pathParams: { childId: selectedChildId },
                        params: {
                            ...(schoolYearId ? { school_year_id: schoolYearId } : {}),
                        },
                        mock: false
                    }),
                    childrenOverviewService.getChildAttendance({
                        pathParams: { childId: selectedChildId },
                        params: semesterId ? { semesterId } : undefined,
                        mock: false
                    }),
                    childrenOverviewService.getChildSchedule({
                        pathParams: { childId: selectedChildId },
                        params: {
                            ...(semesterId ? { semester_id: semesterId } : {}),
                            ...(schoolYearId ? { school_year_id: schoolYearId } : {}),
                        },
                        mock: false
                    }),
                    childrenOverviewService.getSystemEvents({
                        params: {
                            ...(semesterId ? { semesterId } : {}),
                            ...(schoolYearId ? { schoolYearId } : {}),
                        },
                        mock: false,
                    }),
                ])

                let grouped = { hk1: [], hk2: [], year: [] }
                if (gradesRes.status === "fulfilled" && gradesRes.value?.success) {
                    const rawGrades = getRows(gradesRes.value)
                    grouped = transformParentGradesData(rawGrades)
                    setGradesBySemester(grouped)
                } else {
                    setGradesBySemester(grouped)
                }

                if (attendanceRes.status === "fulfilled" && attendanceRes.value?.success) {
                    const records = getRows(attendanceRes.value)
                    const mappedRecords = records.map(r => ({
                        day: r.date || r.day || r.attendance_date || "",
                        status: r.status || r.attendance_status || "",
                        note: r.note || r.reason || "",
                    }))
                    setAttendanceRecords(mappedRecords)
                }

                if (scheduleRes.status === "fulfilled" && scheduleRes.value?.success) {
                    const rawSchedule = getRows(scheduleRes.value)
                    const currentChild = childrenList.find(c => String(c.id) === String(selectedChildId))
                    const selectedClassId = currentChild?.classId || currentChild?.class_id || null
                    const selectedClassName = currentChild?.className || currentChild?.class_name || ""
                    const selectedClassKey = normalizeTitleKey(selectedClassName)
                    const transformed = rawSchedule.map(transformScheduleItem)
                    const filteredSchedule = transformed.filter((lesson) =>
                        matchesSelectedClass(lesson, selectedClassId, selectedClassKey)
                    )
                    setScheduleData(filteredSchedule)
                    setScheduleError(null)
                } else if (scheduleRes.status === "rejected" || !scheduleRes.value?.success) {
                    setScheduleData([])
                    setScheduleError(
                        scheduleRes.value?.error ||
                        (scheduleRes.status === "rejected" ? "Không thể tải lịch học" : null)
                    )
                }

                if (eventsRes.status === "fulfilled" && eventsRes.value?.success) {
                    setUpcomingEvents(getRows(eventsRes.value).map(normalizeEvent))
                } else {
                    setUpcomingEvents([])
                }

            } catch (err) {
                console.error("Error fetching child data:", err)
                setGradesBySemester({ hk1: [], hk2: [], year: [] })
                setAttendanceRecords([])
                setScheduleData([])
                setUpcomingEvents([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchChildData()
    }, [selectedChildId, selectedTerm, selectedSchoolYear, childrenList])

    // 3. Fetch leave requests khi doi con
    useEffect(() => {
        if (!selectedChildId) return
        const fetchLeaveRequests = async () => {
            try {
                const res = await childrenOverviewService.listLeaveRequests({
                    params: { studentId: selectedChildId },
                    mock: false
                })
                if (res.success && res.data) {
                    setLeaveRequests(res.data)
                } else {
                    setLeaveRequests([])
                }
            } catch (err) {
                console.error("Error fetching leave requests:", err)
                setLeaveRequests([])
            }
        }
        fetchLeaveRequests()
    }, [selectedChildId])

    // 4. Fetch conduct data when child changes
    useEffect(() => {
        if (!selectedChildId || !selectedSchoolYear) return

        const fetchConductData = async () => {
            try {
                const hk1SemId = await resolveSemesterId(selectedSchoolYear, "hk1")
                const hk2SemId = await resolveSemesterId(selectedSchoolYear, "hk2")

                if (!hk1SemId || !hk2SemId) return

                const [conductRes, disciplineRes] = await Promise.allSettled([
                    childrenOverviewService.getChildConductSummary({
                        pathParams: { childId: selectedChildId },
                        params: { hk1SemesterId: hk1SemId, hk2SemesterId: hk2SemId },
                        mock: false,
                    }),
                    childrenOverviewService.getChildDisciplineScores({
                        pathParams: { childId: selectedChildId },
                        params: { semesterId: hk1SemId },
                        mock: false,
                    }),
                ])

                if (conductRes.status === "fulfilled" && conductRes.value?.success) {
                    setConductSummary(conductRes.value.data)
                }
                if (disciplineRes.status === "fulfilled" && disciplineRes.value?.success) {
                    setDisciplineScores(disciplineRes.value.data)
                }
            } catch (err) {
                console.error("Error fetching conduct data:", err)
            }
        }

        fetchConductData()
    }, [selectedChildId, selectedSchoolYear])

    const buildAttendanceSummary = (records) => {
        const base = { present: 0, absent: 0, late: 0, excused: 0 }
        const summary = Array.isArray(records)
            ? records.reduce((acc, item) => {
                const status = item.status || ""
                if (status === "present" || status === "Co mat" || status === "Có mặt" || status === "P") acc.present += 1
                else if (status === "absent" || status === "Vang mat" || status === "Vắng mặt" || status === "A") acc.absent += 1
                else if (status === "late" || status === "Di muon" || status === "Đi muộn" || status === "L") acc.late += 1
                else if (status === "excused" || status === "Vang co phep" || status === "Vắng có phép") acc.excused += 1
                return acc
            }, base)
            : base
        const total = Array.isArray(records) ? records.length : 0
        const rate = total > 0 ? `${Math.round((summary.present / total) * 100)}%` : "0%"
        return { label: "Tổng kết", ...summary, total, rate }
    }

    const weeklySummary = buildAttendanceSummary(attendanceRecords)

    const attendanceData = {
        present: weeklySummary.present,
        absent: weeklySummary.absent,
        late: weeklySummary.late,
        excused: weeklySummary.excused,
        weeklySummary,
        weeklyRecords: attendanceRecords,
        allMonthlyRecords: attendanceRecords,
        records: attendanceRecords,
    }

    const handleOverviewCardClick = (semesterKey) => {
        if (!semesterKey) return
        setSelectedSemester(semesterKey)
        if (semesterKey !== "year") {
            handleTermChange(semesterKey)
        }
        setActiveTab("grades")
    }

    const handleChildSwitch = (id) => {
        setSelectedChildId(id)
        setActiveTab("overview")
        setSelectedSemester(selectedTerm)
        setGradesBySemester({ hk1: [], hk2: [], year: [] })
        setAttendanceRecords([])
        setScheduleData([])
        setScheduleError(null)
        setUpcomingEvents([])
        setLeaveRequests([])
        setConductSummary(null)
        setDisciplineScores(null)
    }

    const overviewCurrentSemesterGrades = gradesBySemester?.[selectedTerm] || []
    const overviewSemesterLabel = selectedTerm === "hk2" ? "Hoc ky II" : "Hoc ky I"
    const calendarEvents = useMemo(() => {
        const schoolEvents = Array.isArray(upcomingEvents) ? upcomingEvents : []
        const seenTitles = new Set(schoolEvents.map((event) => normalizeTitleKey(event.title)))
        const lessonEvents = (Array.isArray(scheduleData) ? scheduleData : [])
            .filter((lesson) => lesson?.subject && lesson.subject !== "—")
            .filter((lesson) => !seenTitles.has(normalizeTitleKey(lesson.subject)))
            .map(buildLessonEvent)

        return [...schoolEvents, ...lessonEvents]
    }, [scheduleData, upcomingEvents])

    if (!selectedChildId || (!childHeaderData && isLoading)) {
        return <div className="layout-loading-wrapper"><LoadingSpinner size="lg" label="Đang tải dữ liệu con em..." role="parent" /></div>
    }

    const refreshLeaveRequests = () => {
        childrenOverviewService.listLeaveRequests({
            params: { studentId: selectedChildId },
            mock: false
        }).then(res => {
            if (res.success) setLeaveRequests(getRows(res))
        })
    }

    return (
        <div className="parent-children-overview-page">
            <div className="parent-children-overview-top-panel">
                <div className="parent-children-overview-header">
                    <div className="page-title-block">
                        <h1>Tổng quan con em</h1>
                    </div>

                    <div className="parent-children-overview-toolbar">
                        <SchoolYearTermSelector
                            selectedSchoolYear={selectedSchoolYear}
                            selectedTerm={selectedTerm}
                            onYearChange={handleYearArrow}
                            onTermChange={(term) => {
                                setSelectedSemester(term)
                                handleTermChange(term)
                            }}
                        />
                    </div>
                </div>

                <ChildSwitcher
                    children={childrenList}
                    selectedId={selectedChildId}
                    onSelect={handleChildSwitch}
                />
            </div>

            {childHeaderData && (
                <>
                    <ChildHeader child={childHeaderData} onStatClick={handleOverviewCardClick} />

                    <ChildTabs activeTab={activeTab} onChange={setActiveTab} />

                    {isLoading ? (
                        <div className="layout-loading-wrapper">
                            <LoadingSpinner size="lg" label="Đang cập nhật dữ liệu..." role="parent" />
                        </div>
                    ) : (
                        <>
                            {activeTab === "overview" && (
                                <div className="overview-tab-content">
                                    <div className="overview-top-single">
                                        <GradesSection
                                            compact
                                            grades={overviewCurrentSemesterGrades}
                                            selectedSemester={selectedTerm}
                                            semesterNoteText={overviewSemesterLabel}
                                            highlightSemesterNote
                                        />
                                    </div>

                                    <div className="overview-triple-grid">
                                        <AttendanceSection data={attendanceData} compact />
                                        <CalendarSection
                                            key={`overview-calendar-${selectedChildId}-${selectedTerm}`}
                                            schedule={scheduleData}
                                            events={calendarEvents}
                                            compact
                                            classNameValue={childHeaderData.className}
                                            classIdValue={childHeaderData.classId}
                                            scheduleError={scheduleError}
                                        />
                                        <LeaveRequestSection
                                            requests={leaveRequests.slice(0, 3)}
                                            compact
                                            childId={selectedChildId}
                                            onSuccess={refreshLeaveRequests}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === "attendance" && (
                                <AttendanceSection data={attendanceData} />
                            )}

                            {activeTab === "calendar" && (
                                <CalendarSection
                                    key={`calendar-${selectedChildId}-${selectedTerm}`}
                                    schedule={scheduleData}
                                    events={calendarEvents}
                                    classNameValue={childHeaderData.className}
                                    classIdValue={childHeaderData.classId}
                                    scheduleError={scheduleError}
                                />
                            )}

                            {activeTab === "grades" && (
                                <GradesSection
                                    gradesBySemester={gradesBySemester}
                                    selectedSemester={selectedSemester}
                                    onSemesterChange={(semester) => {
                                        setSelectedSemester(semester)
                                        if (semester !== "year") {
                                            handleTermChange(semester)
                                        }
                                    }}
                                />
                            )}

                            {activeTab === "leave" && (
                                <LeaveRequestSection
                                    requests={leaveRequests}
                                    childId={selectedChildId}
                                    onSuccess={refreshLeaveRequests}
                                />
                            )}

                            {activeTab === "conduct" && (
                                <ConductSection
                                    conductSummary={conductSummary}
                                    disciplineScores={disciplineScores}
                                    loading={!conductSummary && !selectedChildId}
                                />
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    )
}
