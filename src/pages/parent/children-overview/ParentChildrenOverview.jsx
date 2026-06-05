import React, { useEffect, useState } from "react"
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

const transformGradesData = (gradesArray) => {
    const bySemester = { hk1: [], hk2: [], year: [] }
    const subjectMap = {}

    for (const g of gradesArray) {
        const key = g.subject_assignment_id || g.subject_name || g.subject
        const semKey = g.semester_id === 1 || String(g.semester_name || "").toLowerCase().includes("1")
            ? "hk1"
            : "hk2"

        if (!subjectMap[key]) {
            subjectMap[key] = {
                subject: g.subject_name || g.subject || "—",
                oral: null,
                test15: null,
                midterm: null,
                final: null,
                average: null,
            }
        }

        const category = (g.category || "").toLowerCase()
        const score = Number(g.score)
        if (category.includes("miệng") || category.includes("oral")) subjectMap[key].oral = score
        else if (category.includes("15") || category.includes("15phut")) subjectMap[key].test15 = score
        else if (category.includes("giữa") || category.includes("midterm") || category.includes("gk")) subjectMap[key].midterm = score
        else if (category.includes("cuối") || category.includes("final") || category.includes("ck")) subjectMap[key].final = score
        else {
            if (subjectMap[key].oral == null) subjectMap[key].oral = score
            else if (subjectMap[key].test15 == null) subjectMap[key].test15 = score
            else if (subjectMap[key].midterm == null) subjectMap[key].midterm = score
            else if (subjectMap[key].final == null) subjectMap[key].final = score
        }
    }

    for (const key of Object.keys(subjectMap)) {
        const s = subjectMap[key]
        const scores = [s.oral, s.test15, s.midterm, s.final].filter(v => v != null)
        if (scores.length > 0) {
            s.average = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        }
        bySemester.hk1.push({ ...s })
        bySemester.hk2.push({ ...s })
        bySemester.year.push({ ...s })
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
    const [childData, setChildData] = useState(null)
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
                    setChildrenList(children)
                    if (!selectedChildId) {
                        setSelectedChildId(children[0].id)
                    }
                }
            } catch (err) {
                console.error("Error fetching children:", err)
                setChildrenList([])
            }
        }
        fetchChildren()
    }, [])

    // 2. Fetch grades, attendance, schedule khi doi con
    useEffect(() => {
        if (!selectedChildId) return

        const fetchChildData = async () => {
            try {
                setIsLoading(true)

                const [gradesRes, attendanceRes, scheduleRes] = await Promise.allSettled([
                    parentService.getChildGrades({
                        pathParams: { childId: selectedChildId },
                        params: { semesterId: selectedTerm === "hk1" ? 1 : 2 },
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
                    const mappedRecords = records.map(r => ({
                        day: r.date || r.day || r.attendance_date || "",
                        status: r.status || r.attendance_status || "",
                        note: r.note || r.reason || "",
                    }))
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

                const currentChild = childrenList.find(c => c.id === selectedChildId)
                if (currentChild) {
                    setChildData({
                        ...currentChild,
                        schoolYear: currentChild.schoolYear || selectedSchoolYear,
                        status: "Dang hoc",
                    })
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

    useEffect(() => {
        if (selectedChildId && childrenList.length > 0) {
            const currentChild = childrenList.find(c => c.id === selectedChildId)
            if (currentChild && !childData) {
                setChildData({
                    ...currentChild,
                    schoolYear: currentChild.schoolYear || selectedSchoolYear,
                    status: "Dang hoc",
                })
            }
        }
    }, [childrenList, selectedChildId])

    const buildAttendanceSummary = (records) => {
        const base = { present: 0, absent: 0, late: 0, excused: 0 }
        const summary = Array.isArray(records)
            ? records.reduce((acc, item) => {
                const status = item.status || ""
                if (status === "present" || status === "Co mat") acc.present += 1
                else if (status === "absent" || status === "Vang mat") acc.absent += 1
                else if (status === "late" || status === "Di muon") acc.late += 1
                else if (status === "excused" || status === "Vang co phep") acc.excused += 1
                return acc
            }, base)
            : base
        const total = Array.isArray(records) ? records.length : 0
        const rate = total > 0 ? `${Math.round((summary.present / total) * 100)}%` : "0%"
        return { label: "Tong ket", ...summary, total, rate }
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
    const overviewSemesterLabel = selectedTerm === "hk2" ? "Hoc ky II" : "Hoc ky I"

    if (!selectedChildId || (!childData && isLoading)) {
        return <div className="layout-loading-wrapper"><LoadingSpinner size="lg" label="Dang tai du lieu con em..." role="parent" /></div>
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
                        <h1>Tong quan con em</h1>
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

            {childData && (
                <>
                    <ChildHeader child={childData} onStatClick={handleOverviewCardClick} />

                    <ChildTabs activeTab={activeTab} onChange={setActiveTab} />

                    {isLoading ? (
                        <div className="layout-loading-wrapper">
                            <LoadingSpinner size="lg" label="Dang cap nhat du lieu..." role="parent" />
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
                                            classNameValue={childData.className}
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
                                    classNameValue={childData.className}
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
