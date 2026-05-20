import React, { useEffect, useState } from "react"
import "./ParentChildrenOverview.css"
import { PageHeader, SchoolYearTermSelector, LoadingSpinner } from "../../../components/common"
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm"
import ChildHeader from "./components/childHeader/ChildHeader"
import ChildTabs from "./components/ChildTabs/ChildTabs"
import AttendanceSection from "./components/attendanceSection/AttendanceSection"
import CalendarSection from "./components/calendarSection/CalendarSection"
import GradesSection from "./components/GradesSection/GradesSection"
import LeaveRequestSection from "./components/LeaveRequestSection/LeaveRequestSection"
import ChildSwitcher from "./components/ChildSwitcher/ChildSwitcher"
import { parentService } from "../../../services/pages/parent/parentService"

export default function ParentChildrenOverview() {
    const [childrenList, setChildrenList] = useState([])
    const [activeTab, setActiveTab] = useState("overview")
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm()
    const [selectedSemester, setSelectedSemester] = useState(selectedTerm)
    const [selectedChildId, setSelectedChildId] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [childData, setChildData] = useState(null)
    const [gradesBySemester, setGradesBySemester] = useState({ hk1: [], hk2: [], year: [] })
    const [attendanceRecords, setAttendanceRecords] = useState({
        present: 0, absent: 0, late: 0,
        weeklySummary: { label: "Tuần này", present: 0, absent: 0, late: 0, total: 0, rate: "0%" },
        weeklyRecords: [], allMonthlyRecords: [], records: []
    })

    const [leaveRequests, setLeaveRequests] = useState([])

    const fetchLeaveRequests = async () => {
        if (!selectedChildId) return;
        try {
            const res = await parentService.listLeaveRequests({
                params: { studentEnrollmentId: selectedChildId }
            });
            if (res.success && res.data) {
                setLeaveRequests(res.data);
            } else {
                setLeaveRequests([]);
            }
        } catch (err) {
            console.error("Error fetching leave requests:", err);
            setLeaveRequests([]);
        }
    };

    useEffect(() => {
        fetchLeaveRequests();
    }, [selectedChildId]);

    // 1. Khởi tạo danh sách con từ localStorage
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const localChildren = storedUser?.profile?.linkedStudents || [];
        
        if (localChildren.length > 0) {
            const formatted = localChildren
                .filter(c => c.id !== "child1" && c.name !== "Nguyễn Minh Tuấn")
                .map(c => ({
                    ...c,
                    id: c.id || c.studentId,
                    name: c.name || `${c.surname || ""} ${c.given_name || ""}`.trim(),
                    avatarLetter: (c.given_name || c.name || "S")[0].toUpperCase(),
                    avatarColor: "linear-gradient(135deg, #a67cff, #7c4dff)"
                }));
            
            if (formatted.length > 0) {
                setChildrenList(formatted);
                if (!selectedChildId) setSelectedChildId(formatted[0].id);
            }
        }
    }, []);

    // 2. Lấy dữ liệu chi tiết khi chọn con hoặc học kỳ
    useEffect(() => {
        if (!selectedChildId) return;

        const fetchChildDetails = async () => {
            try {
                setIsLoading(true);
                // Tìm thông tin con trong list
                const currentChild = childrenList.find(c => c.id === selectedChildId);
                if (currentChild) {
                    setChildData({
                        ...currentChild,
                        schoolYear: selectedSchoolYear,
                        status: "Đang học",
                        averageScores: { semester1: "0.0", semester2: "0.0", fullYear: "0.0" }
                    });
                }

                // Gọi API lấy điểm thực tế
                // Lưu ý: API này Backend đã mở tại /api/v1/students/:id/grades
                const gradesRes = await parentService.getChildGrades({ 
                    pathParams: { childId: selectedChildId },
                    mock: false 
                });

                if (gradesRes.success && gradesRes.data) {
                    setGradesBySemester(gradesRes.data);
                } else {
                    setGradesBySemester({ hk1: [], hk2: [], year: [] });
                }
            } catch (err) {
                // [CẢI TIẾN] Xử lý lỗi 404 êm đẹp nếu đã có dữ liệu local
                if (err.response?.status === 404 || err.message?.includes("404")) {
                    console.info("ℹ️ Child Grades API 404 - Using local profile data.");
                } else {
                    console.error("❌ Error fetching child details:", err);
                }
                setGradesBySemester({ hk1: [], hk2: [], year: [] });
            } finally {
                setIsLoading(false);
            }
        };

        fetchChildDetails();
    }, [selectedChildId, selectedSchoolYear, childrenList]);

    useEffect(() => {
        setSelectedSemester(selectedTerm)
    }, [selectedTerm])

    const buildAttendanceSummary = (label, records) => {
        const base = { present: 0, absent: 0, late: 0 }
        const summary = Array.isArray(records) ? records.reduce((acc, item) => {
            if (item.status === "Có mặt") acc.present += 1
            else if (item.status === "Vắng mặt") acc.absent += 1
            else if (item.status === "Đi muộn") acc.late += 1
            return acc
        }, base) : base
        const total = Array.isArray(records) ? records.length : 0
        const rate = total > 0 ? `${Math.round((summary.present / total) * 100)}%` : "0%"
        return { label, ...summary, total, rate }
    }

    // Giả lập dữ liệu cho các phần chưa có API (sẽ thay bằng API thật sau)
    const scheduleData = []
    const upcomingEvents = []
    const weeklyRecords = []
    const allMonthlyRecords = []

    const weeklySummary = buildAttendanceSummary("Tuần này", weeklyRecords)

    const attendanceData = {
        present: weeklySummary.present,
        absent: weeklySummary.absent,
        late: weeklySummary.late,
        weeklySummary,
        weeklyRecords,
        allMonthlyRecords,
        records: weeklyRecords
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
    }

    const overviewCurrentSemesterGrades = gradesBySemester?.[selectedTerm] || []
    const overviewSemesterLabel = selectedTerm === "hk2" ? "Học kỳ II" : "Học kỳ I"

    if (!selectedChildId || !childData) {
        return <div className="layout-loading-wrapper"><LoadingSpinner size="lg" label="Đang tải dữ liệu con em..." role="parent" /></div>
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

            <ChildHeader child={childData} onStatClick={handleOverviewCardClick} />

            <ChildTabs activeTab={activeTab} onChange={setActiveTab} />

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
                        />
                        <LeaveRequestSection requests={leaveRequests.slice(0, 3)} compact childId={selectedChildId} onSuccess={fetchLeaveRequests} />
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
                <LeaveRequestSection requests={leaveRequests} childId={selectedChildId} onSuccess={fetchLeaveRequests} />
            )}
        </div>
    )
}
