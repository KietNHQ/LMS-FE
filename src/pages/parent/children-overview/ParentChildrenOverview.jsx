import React, { useEffect, useState, useMemo } from "react"
import "./ParentChildrenOverview.css"
import { PageHeader, SchoolYearTermSelector, LoadingSpinner } from "../../../components/common"
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm"
import { resolveSemesterId } from "../../../services/shared/schoolYearLookup"
import ChildHeader from "./components/childHeader/ChildHeader"
import ChildTabs from "./components/ChildTabs/ChildTabs"
import AttendanceSection from "./components/attendanceSection/AttendanceSection"
import CalendarSection from "./components/calendarSection/CalendarSection"
import GradesSection from "./components/GradesSection/GradesSection"
import LeaveRequestSection from "./components/LeaveRequestSection/LeaveRequestSection"
import ConductSection from "./components/ConductSection/ConductSection"
import ChildSwitcher from "./components/ChildSwitcher/ChildSwitcher"
import { parentService } from "../../../services/pages/parent/parentService"

const DAY_MAP = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
    7: "Sunday",
}

const transformScheduleItem = (item) => ({
    id: item.id,
    day: DAY_MAP[item.dayOfWeek] || `Day${item.dayOfWeek}`,
    periodStart: item.period_number,
    periodEnd: item.period_number,
    subject: item.class_teacher_subject?.subject_assignments?.display_name || item.subject_name || "—",
    teacher: item.class_teacher_subject?.teachers?.fullName || item.teacher_name || "—",
    room: item.room || "—",
    start: item.start_time || "",
    end: item.end_time || "",
    timeRange: item.start_time && item.end_time ? `${item.start_time} - ${item.end_time}` : "",
    note: item.note || "",
    subjectKey: item.class_teacher_subject?.subject_assignments?.subject_code || "",
    status: "normal",
    mode: "offline",
    color: "",
})

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
                const res = await parentService.listChildren({ mock: false })
                const children = res?.data || []
                if (children.length > 0) {
                    const parentName = getParentName()
                    const enrichedChildren = children.map((c, idx) => {
                        const name = `${c.surname || ""} ${c.given_name || ""}`.trim() || "Học sinh"
                        const avatarLetter = c.given_name ? c.given_name.charAt(0).toUpperCase() : "H"
                        const avatarColor = c.avatarColor || getAvatarColor(c.id || idx)
                        const homeroomTeacher = c.teacherName || "Chưa phân công"
                        return {
                            ...c,
                            name,
                            avatarLetter,
                            avatarColor,
                            homeroomTeacher,
                            parentName,
                        }
                    })
                    setChildrenList(enrichedChildren)
                    if (!selectedChildId) {
                        setSelectedChildId(enrichedChildren[0].id)
                    }
                }
            } catch (err) {
                console.error("Error fetching children:", err)
                setChildrenList([])
            }
        }
        fetchChildren()
    }, [])

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

                const [gradesRes, attendanceRes, scheduleRes] = await Promise.allSettled([
                    parentService.getChildGrades({
                        pathParams: { childId: selectedChildId },
                        mock: false
                    }),
                    parentService.getChildAttendance({
                        pathParams: { childId: selectedChildId },
                        mock: false
                    }),
                    parentService.getChildSchedule({
                        pathParams: { childId: selectedChildId },
                        mock: false
                    }),
                ])

                if (gradesRes.status === "fulfilled" && gradesRes.value?.success) {
                    const rawGrades = Array.isArray(gradesRes.value.data)
                        ? gradesRes.value.data
                        : []
                    const grouped = transformGradesData(rawGrades)
                    setGradesBySemester(grouped)
                }

                if (attendanceRes.status === "fulfilled" && attendanceRes.value?.success) {
                    const records = attendanceRes.value.data?.records || attendanceRes.value.data || []
                    const mappedRecords = records.map(r => {
                        let dayVal = r.date || r.day || r.attendance_date || ""
                        if (dayVal && (dayVal.includes("T") || dayVal.includes("-"))) {
                            const d = new Date(dayVal)
                            if (!isNaN(d.getTime())) {
                                const dd = String(d.getDate()).padStart(2, "0")
                                const mm = String(d.getMonth() + 1).padStart(2, "0")
                                const yyyy = d.getFullYear()
                                dayVal = `${dd}/${mm}/${yyyy}`
                            }
                        }
                        
                        let statusVal = r.status || r.attendance_status || ""
                        if (statusVal === "P" || statusVal === "present" || statusVal === "Co mat" || statusVal === "Có mặt") {
                            statusVal = "Có mặt"
                        } else if (statusVal === "A" || statusVal === "absent" || statusVal === "Vang mat" || statusVal === "Vắng mặt") {
                            statusVal = "Vắng mặt"
                        } else if (statusVal === "L" || statusVal === "late" || statusVal === "Di muon" || statusVal === "Đi muộn") {
                            statusVal = "Đi muộn"
                        }

                        return {
                            day: dayVal,
                            status: statusVal,
                            note: r.note || r.reason || "",
                        }
                    })
                    setAttendanceRecords(mappedRecords)
                }

                if (scheduleRes.status === "fulfilled" && scheduleRes.value?.success) {
                    const rawSchedule = Array.isArray(scheduleRes.value.data)
                        ? scheduleRes.value.data
                        : []
                    const transformed = rawSchedule.map(transformScheduleItem)
                    setScheduleData(transformed)
                    setScheduleError(null)
                    setUpcomingEvents(
                        transformed.map(item => ({
                            id: item.id,
                            title: item.subject,
                            date: `${item.day}, Tiết ${item.periodStart}`,
                            type: "schedule",
                            startTime: item.start,
                            endTime: item.end,
                        }))
                    )
                } else if (scheduleRes.status === "rejected" || !scheduleRes.value?.success) {
                    setScheduleData([])
                    setScheduleError(
                        scheduleRes.value?.error ||
                        (scheduleRes.status === "rejected" ? "Không thể tải lịch học" : null)
                    )
                }
            } catch (err) {
                console.error("Error fetching child data:", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchChildData()
    }, [selectedChildId, selectedTerm, selectedSchoolYear])

    // 3. Fetch leave requests khi doi con
    useEffect(() => {
        if (!selectedChildId) return
        const fetchLeaveRequests = async () => {
            try {
                const res = await parentService.listLeaveRequests({
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
                    parentService.getChildConductSummary({
                        pathParams: { childId: selectedChildId },
                        params: { hk1SemesterId: hk1SemId, hk2SemesterId: hk2SemId },
                        mock: false,
                    }),
                    parentService.getChildDisciplineScores({
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

    useEffect(() => {
        setSelectedSemester(selectedTerm)
    }, [selectedTerm])

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
        handleTermChange(semesterKey)
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
    const overviewSemesterLabel = selectedTerm === "hk2" ? "Học kỳ II" : "Học kỳ I"

    if (!selectedChildId || (!childHeaderData && isLoading)) {
        return <div className="layout-loading-wrapper"><LoadingSpinner size="lg" label="Đang tải dữ liệu con em..." role="parent" /></div>
    }

    const refreshLeaveRequests = () => {
        parentService.listLeaveRequests({
            params: { studentId: selectedChildId },
            mock: false
        }).then(res => {
            if (res.success && res.data) setLeaveRequests(res.data)
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
                                            schedule={scheduleData}
                                            events={upcomingEvents}
                                            compact
                                            classNameValue={childHeaderData.className}
                                            selectedChildId={selectedChildId}
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
                                    schedule={scheduleData}
                                    events={upcomingEvents}
                                    classNameValue={childHeaderData.className}
                                    selectedChildId={selectedChildId}
                                    scheduleError={scheduleError}
                                />
                            )}

                            {activeTab === "grades" && (
                                <GradesSection
                                    gradesBySemester={gradesBySemester}
                                    selectedSemester={selectedSemester}
                                    onSemesterChange={(semester) => {
                                        setSelectedSemester(semester)
                                        handleTermChange(semester)
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
