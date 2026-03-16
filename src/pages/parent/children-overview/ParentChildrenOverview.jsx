import React, { useState } from "react"
import "./ParentChildrenOverview.css"
import ChildHeader from "./components/childHeader/ChildHeader"
import ChildTabs from "./components/ChildTabs/ChildTabs"
import AttendanceSection from "./components/attendanceSection/AttendanceSection"
import CalendarSection from "./components/calendarSection/CalendarSection"
import GradesSection from "./components/GradesSection/GradesSection"
import LeaveRequestSection from "./components/LeaveRequestSection/LeaveRequestSection"
import ChildSwitcher from "./components/ChildSwitcher/ChildSwitcher"

export default function ParentChildrenOverview() {
    const [activeTab, setActiveTab] = useState("overview")
    const [selectedSemester, setSelectedSemester] = useState("hk1")
    const [selectedChildId, setSelectedChildId] = useState("child1")

    const buildAttendanceSummary = (label, records) => {
        const base = { present: 0, absent: 0, late: 0 }
        const summary = records.reduce((acc, item) => {
            if (item.status === "Có mặt") acc.present += 1
            else if (item.status === "Vắng mặt") acc.absent += 1
            else if (item.status === "Đi muộn") acc.late += 1
            return acc
        }, base)
        const total = records.length
        const rate = total > 0 ? `${Math.round((summary.present / total) * 100)}%` : "0%"
        return { label, ...summary, total, rate }
    }

    // ===== DỮ LIỆU CON 1 — LỚP 10 =====
    const child1 = {
        id: "child1",
        name: "Nguyễn Minh Tuấn",
        studentId: "STU1024",
        className: "10A1",
        schoolYear: "2025 - 2026",
        status: "Đang học",
        parentName: "Nguyễn Văn Phụ Huynh",
        homeroomTeacher: "Trần Thị Lan Anh",
        avatarLetter: "T",
        avatarColor: "linear-gradient(135deg, #a67cff, #7c4dff)",
        averageScores: { semester1: "8.4", semester2: "8.8", fullYear: "8.6" }
    }

    const child1WeeklyRecords = [
        { day: "Thứ 2", status: "Có mặt" },
        { day: "Thứ 3", status: "Có mặt" },
        { day: "Thứ 4", status: "Đi muộn" },
        { day: "Thứ 5", status: "Có mặt" },
        { day: "Thứ 6", status: "Vắng mặt" }
    ]

    const child1MonthlyRecords = [
        // Tháng 1/2026
        { day: "05/01/2026", status: "Có mặt" }, { day: "06/01/2026", status: "Có mặt" },
        { day: "07/01/2026", status: "Đi muộn" }, { day: "08/01/2026", status: "Có mặt" },
        { day: "09/01/2026", status: "Có mặt" }, { day: "12/01/2026", status: "Có mặt" },
        { day: "13/01/2026", status: "Vắng mặt" }, { day: "14/01/2026", status: "Có mặt" },
        { day: "15/01/2026", status: "Có mặt" }, { day: "16/01/2026", status: "Đi muộn" },
        { day: "19/01/2026", status: "Có mặt" }, { day: "20/01/2026", status: "Có mặt" },
        { day: "21/01/2026", status: "Có mặt" }, { day: "22/01/2026", status: "Có mặt" },
        { day: "23/01/2026", status: "Vắng mặt" },
        // Tháng 2/2026
        { day: "02/02/2026", status: "Có mặt" }, { day: "03/02/2026", status: "Có mặt" },
        { day: "04/02/2026", status: "Có mặt" }, { day: "05/02/2026", status: "Đi muộn" },
        { day: "06/02/2026", status: "Có mặt" }, { day: "09/02/2026", status: "Có mặt" },
        { day: "10/02/2026", status: "Vắng mặt" }, { day: "11/02/2026", status: "Có mặt" },
        { day: "12/02/2026", status: "Có mặt" }, { day: "13/02/2026", status: "Có mặt" },
        { day: "16/02/2026", status: "Có mặt" }, { day: "17/02/2026", status: "Có mặt" },
        { day: "18/02/2026", status: "Đi muộn" }, { day: "19/02/2026", status: "Có mặt" },
        { day: "20/02/2026", status: "Có mặt" }, { day: "23/02/2026", status: "Có mặt" },
        { day: "24/02/2026", status: "Có mặt" }, { day: "25/02/2026", status: "Vắng mặt" },
        { day: "26/02/2026", status: "Có mặt" }, { day: "27/02/2026", status: "Có mặt" },
        // Tháng 3/2026
        { day: "03/03/2026", status: "Có mặt" }, { day: "04/03/2026", status: "Có mặt" },
        { day: "05/03/2026", status: "Đi muộn" }, { day: "06/03/2026", status: "Có mặt" },
        { day: "07/03/2026", status: "Có mặt" }, { day: "10/03/2026", status: "Vắng mặt" },
        { day: "11/03/2026", status: "Có mặt" }, { day: "12/03/2026", status: "Có mặt" },
        { day: "13/03/2026", status: "Có mặt" }, { day: "14/03/2026", status: "Đi muộn" },
        { day: "17/03/2026", status: "Có mặt" }, { day: "18/03/2026", status: "Có mặt" },
        { day: "19/03/2026", status: "Có mặt" }, { day: "20/03/2026", status: "Có mặt" },
        { day: "21/03/2026", status: "Có mặt" }, { day: "24/03/2026", status: "Vắng mặt" },
        { day: "25/03/2026", status: "Có mặt" }, { day: "26/03/2026", status: "Có mặt" },
        { day: "27/03/2026", status: "Có mặt" }, { day: "28/03/2026", status: "Có mặt" },
        { day: "31/03/2026", status: "Có mặt" }
    ]

    const child1GradesBySemester = {
        hk1: [
            { subject: "Toán học", oral: 8.4, test15: 8.3, midterm: 8.4, final: 8.7, average: 8.4 },
            { subject: "Tiếng Anh", oral: 8.0, test15: 7.8, midterm: 8.1, final: 8.3, average: 8.0 },
            { subject: "Vật lý", oral: 8.5, test15: 8.3, midterm: 8.4, final: 8.8, average: 8.5 },
            { subject: "Văn học", oral: 8.0, test15: 7.7, midterm: 7.9, final: 8.1, average: 7.9 },
            { subject: "Hóa học", oral: 8.3, test15: 8.1, midterm: 8.2, final: 8.5, average: 8.3 },
            { subject: "Sinh học", oral: 8.7, test15: 8.5, midterm: 8.6, final: 8.8, average: 8.7 },
            { subject: "Lịch sử", oral: 8.5, test15: 8.3, midterm: 8.4, final: 8.6, average: 8.5 },
            { subject: "Tin học", oral: 8.9, test15: 8.8, midterm: 8.9, final: 9.0, average: 8.9 }
        ],
        hk2: [
            { subject: "Toán học", oral: 8.8, test15: 8.7, midterm: 8.9, final: 9.1, average: 8.8 },
            { subject: "Tiếng Anh", oral: 8.5, test15: 8.3, midterm: 8.6, final: 8.9, average: 8.5 },
            { subject: "Vật lý", oral: 8.9, test15: 8.8, midterm: 8.9, final: 9.1, average: 8.9 },
            { subject: "Văn học", oral: 8.3, test15: 8.1, midterm: 8.2, final: 8.4, average: 8.2 },
            { subject: "Hóa học", oral: 8.7, test15: 8.6, midterm: 8.7, final: 8.9, average: 8.7 },
            { subject: "Sinh học", oral: 9.0, test15: 8.9, midterm: 9.0, final: 9.2, average: 9.0 },
            { subject: "Lịch sử", oral: 8.9, test15: 8.8, midterm: 8.9, final: 9.0, average: 8.9 },
            { subject: "Tin học", oral: 9.4, test15: 9.3, midterm: 9.4, final: 9.5, average: 9.4 }
        ],
        year: [
            { subject: "Toán học", oral: 8.6, test15: 8.5, midterm: 8.6, final: 8.9, average: 8.6 },
            { subject: "Tiếng Anh", oral: 8.3, test15: 8.1, midterm: 8.4, final: 8.6, average: 8.3 },
            { subject: "Vật lý", oral: 8.7, test15: 8.5, midterm: 8.7, final: 8.9, average: 8.7 },
            { subject: "Văn học", oral: 8.2, test15: 8.0, midterm: 8.1, final: 8.3, average: 8.1 },
            { subject: "Hóa học", oral: 8.5, test15: 8.3, midterm: 8.5, final: 8.7, average: 8.5 },
            { subject: "Sinh học", oral: 8.8, test15: 8.7, midterm: 8.8, final: 9.0, average: 8.8 },
            { subject: "Lịch sử", oral: 8.7, test15: 8.5, midterm: 8.6, final: 8.8, average: 8.7 },
            { subject: "Tin học", oral: 9.1, test15: 9.0, midterm: 9.1, final: 9.2, average: 9.1 }
        ]
    }

    const child1LeaveRequests = [
        { date: "2026-03-01", reason: "Sốt cao và nghỉ tại nhà", status: "Đã duyệt", approver: "Giáo viên chủ nhiệm" },
        { date: "2026-03-08", reason: "Sự kiện gia đình", status: "Đang chờ", approver: "—" },
        { date: "2026-03-10", reason: "Khám sức khỏe", status: "Bị từ chối", approver: "Văn phòng nhà trường" }
    ]

    const child1ScheduleData = [
        { day: "Thứ 2", time: "08:00 - 09:30", subject: "Toán học", room: "A101" },
        { day: "Thứ 3", time: "09:45 - 11:15", subject: "Tiếng Anh", room: "B203" },
        { day: "Thứ 4", time: "13:00 - 14:30", subject: "Vật lý", room: "C110" }
    ]

    const child1UpcomingEvents = [
        { title: "Kiểm tra Tiếng Anh", date: "Thứ 6, 14 Tháng 3", type: "Kiểm tra" },
        { title: "Cuộc họp Phụ huynh", date: "Thứ 7, 15 Tháng 3", type: "Họp" },
        { title: "Bài kiểm tra Toán", date: "Thứ 2, 17 Tháng 3", type: "Bài kiểm tra" }
    ]

    // ===== DỮ LIỆU CON 2 — LỚP 12 =====
    const child2 = {
        id: "child2",
        name: "Nguyễn Thị Ngọc Hà",
        studentId: "STU0891",
        className: "12A2",
        schoolYear: "2025 - 2026",
        status: "Đang học",
        parentName: "Nguyễn Văn Phụ Huynh",
        homeroomTeacher: "Lê Minh Hoàng",
        avatarLetter: "H",
        avatarColor: "linear-gradient(135deg, #f97316, #ef4444)",
        averageScores: { semester1: "9.1", semester2: "9.3", fullYear: "9.2" }
    }

    const child2WeeklyRecords = [
        { day: "Thứ 2", status: "Có mặt" },
        { day: "Thứ 3", status: "Có mặt" },
        { day: "Thứ 4", status: "Có mặt" },
        { day: "Thứ 5", status: "Có mặt" },
        { day: "Thứ 6", status: "Có mặt" }
    ]

    const child2MonthlyRecords = [
        // Tháng 1/2026
        { day: "05/01/2026", status: "Có mặt" }, { day: "06/01/2026", status: "Có mặt" },
        { day: "07/01/2026", status: "Có mặt" }, { day: "08/01/2026", status: "Có mặt" },
        { day: "09/01/2026", status: "Có mặt" }, { day: "12/01/2026", status: "Đi muộn" },
        { day: "13/01/2026", status: "Có mặt" }, { day: "14/01/2026", status: "Có mặt" },
        { day: "15/01/2026", status: "Có mặt" }, { day: "16/01/2026", status: "Có mặt" },
        { day: "19/01/2026", status: "Có mặt" }, { day: "20/01/2026", status: "Có mặt" },
        { day: "21/01/2026", status: "Có mặt" }, { day: "22/01/2026", status: "Có mặt" },
        { day: "23/01/2026", status: "Có mặt" },
        // Tháng 2/2026
        { day: "02/02/2026", status: "Có mặt" }, { day: "03/02/2026", status: "Có mặt" },
        { day: "04/02/2026", status: "Có mặt" }, { day: "05/02/2026", status: "Có mặt" },
        { day: "06/02/2026", status: "Có mặt" }, { day: "09/02/2026", status: "Có mặt" },
        { day: "10/02/2026", status: "Có mặt" }, { day: "11/02/2026", status: "Đi muộn" },
        { day: "12/02/2026", status: "Có mặt" }, { day: "13/02/2026", status: "Có mặt" },
        { day: "16/02/2026", status: "Có mặt" }, { day: "17/02/2026", status: "Có mặt" },
        { day: "18/02/2026", status: "Có mặt" }, { day: "19/02/2026", status: "Vắng mặt" },
        { day: "20/02/2026", status: "Có mặt" }, { day: "23/02/2026", status: "Có mặt" },
        { day: "24/02/2026", status: "Có mặt" }, { day: "25/02/2026", status: "Có mặt" },
        { day: "26/02/2026", status: "Có mặt" }, { day: "27/02/2026", status: "Có mặt" },
        // Tháng 3/2026
        { day: "03/03/2026", status: "Có mặt" }, { day: "04/03/2026", status: "Có mặt" },
        { day: "05/03/2026", status: "Có mặt" }, { day: "06/03/2026", status: "Có mặt" },
        { day: "07/03/2026", status: "Có mặt" }, { day: "10/03/2026", status: "Có mặt" },
        { day: "11/03/2026", status: "Có mặt" }, { day: "12/03/2026", status: "Có mặt" },
        { day: "13/03/2026", status: "Có mặt" }, { day: "14/03/2026", status: "Có mặt" },
        { day: "17/03/2026", status: "Đi muộn" }, { day: "18/03/2026", status: "Có mặt" },
        { day: "19/03/2026", status: "Có mặt" }, { day: "20/03/2026", status: "Có mặt" },
        { day: "21/03/2026", status: "Có mặt" }, { day: "24/03/2026", status: "Có mặt" },
        { day: "25/03/2026", status: "Có mặt" }, { day: "26/03/2026", status: "Vắng mặt" },
        { day: "27/03/2026", status: "Có mặt" }, { day: "28/03/2026", status: "Có mặt" },
        { day: "31/03/2026", status: "Có mặt" }
    ]

    const child2GradesBySemester = {
        hk1: [
            { subject: "Toán học", oral: 9.2, test15: 9.0, midterm: 9.1, final: 9.3, average: 9.1 },
            { subject: "Tiếng Anh", oral: 9.5, test15: 9.3, midterm: 9.4, final: 9.6, average: 9.4 },
            { subject: "Vật lý", oral: 9.0, test15: 8.9, midterm: 9.0, final: 9.2, average: 9.0 },
            { subject: "Văn học", oral: 8.8, test15: 8.7, midterm: 8.8, final: 9.0, average: 8.8 },
            { subject: "Hóa học", oral: 9.1, test15: 9.0, midterm: 9.1, final: 9.3, average: 9.1 },
            { subject: "Sinh học", oral: 9.3, test15: 9.2, midterm: 9.3, final: 9.5, average: 9.3 },
            { subject: "Địa lý", oral: 8.9, test15: 8.8, midterm: 8.9, final: 9.1, average: 8.9 },
            { subject: "GDCD", oral: 9.4, test15: 9.3, midterm: 9.4, final: 9.5, average: 9.4 },
            { subject: "Tin học", oral: 9.6, test15: 9.5, midterm: 9.6, final: 9.8, average: 9.6 }
        ],
        hk2: [
            { subject: "Toán học", oral: 9.4, test15: 9.3, midterm: 9.4, final: 9.5, average: 9.4 },
            { subject: "Tiếng Anh", oral: 9.7, test15: 9.5, midterm: 9.6, final: 9.8, average: 9.6 },
            { subject: "Vật lý", oral: 9.2, test15: 9.1, midterm: 9.3, final: 9.4, average: 9.2 },
            { subject: "Văn học", oral: 9.0, test15: 8.9, midterm: 9.0, final: 9.2, average: 9.0 },
            { subject: "Hóa học", oral: 9.3, test15: 9.2, midterm: 9.3, final: 9.5, average: 9.3 },
            { subject: "Sinh học", oral: 9.5, test15: 9.4, midterm: 9.5, final: 9.7, average: 9.5 },
            { subject: "Địa lý", oral: 9.1, test15: 9.0, midterm: 9.1, final: 9.3, average: 9.1 },
            { subject: "GDCD", oral: 9.6, test15: 9.5, midterm: 9.6, final: 9.7, average: 9.6 },
            { subject: "Tin học", oral: 9.8, test15: 9.7, midterm: 9.8, final: 10.0, average: 9.8 }
        ],
        year: [
            { subject: "Toán học", oral: 9.3, test15: 9.1, midterm: 9.2, final: 9.4, average: 9.2 },
            { subject: "Tiếng Anh", oral: 9.6, test15: 9.4, midterm: 9.5, final: 9.7, average: 9.5 },
            { subject: "Vật lý", oral: 9.1, test15: 9.0, midterm: 9.1, final: 9.3, average: 9.1 },
            { subject: "Văn học", oral: 8.9, test15: 8.8, midterm: 8.9, final: 9.1, average: 8.9 },
            { subject: "Hóa học", oral: 9.2, test15: 9.1, midterm: 9.2, final: 9.4, average: 9.2 },
            { subject: "Sinh học", oral: 9.4, test15: 9.3, midterm: 9.4, final: 9.6, average: 9.4 },
            { subject: "Địa lý", oral: 9.0, test15: 8.9, midterm: 9.0, final: 9.2, average: 9.0 },
            { subject: "GDCD", oral: 9.5, test15: 9.4, midterm: 9.5, final: 9.6, average: 9.5 },
            { subject: "Tin học", oral: 9.7, test15: 9.6, midterm: 9.7, final: 9.9, average: 9.7 }
        ]
    }

    const child2LeaveRequests = [
        { date: "2026-02-19", reason: "Đau đầu, nghỉ dưỡng tại nhà", status: "Đã duyệt", approver: "Giáo viên chủ nhiệm" },
        { date: "2026-03-12", reason: "Thi thử đại học tại trường ngoài", status: "Đã duyệt", approver: "Hiệu trưởng" }
    ]

    const child2ScheduleData = [
        { day: "Thứ 2", time: "07:30 - 09:00", subject: "Toán học", room: "A201" },
        { day: "Thứ 2", time: "09:15 - 10:45", subject: "Vật lý", room: "B301" },
        { day: "Thứ 3", time: "07:30 - 09:00", subject: "Tiếng Anh", room: "C102" },
        { day: "Thứ 4", time: "13:00 - 14:30", subject: "Hóa học", room: "D205" },
        { day: "Thứ 5", time: "07:30 - 09:00", subject: "Văn học", room: "A105" },
        { day: "Thứ 6", time: "07:30 - 09:00", subject: "Sinh học", room: "B208" }
    ]

    const child2UpcomingEvents = [
        { title: "Thi thử THPT Quốc gia môn Toán", date: "Thứ 3, 18 Tháng 3", type: "Kiểm tra" },
        { title: "Nộp hồ sơ xét tuyển đại học", date: "Thứ 6, 28 Tháng 3", type: "Hạn nộp" },
        { title: "Họp phụ huynh cuối kỳ", date: "Thứ 7, 29 Tháng 3", type: "Họp" }
    ]

    // ===== CHỌN DỮ LIỆU THEO CON ĐANG XEM =====
    const isChild2 = selectedChildId === "child2"

    const childData = isChild2 ? child2 : child1
    const gradesBySemester = isChild2 ? child2GradesBySemester : child1GradesBySemester
    const leaveRequests = isChild2 ? child2LeaveRequests : child1LeaveRequests
    const scheduleData = isChild2 ? child2ScheduleData : child1ScheduleData
    const upcomingEvents = isChild2 ? child2UpcomingEvents : child1UpcomingEvents
    const weeklyRecords = isChild2 ? child2WeeklyRecords : child1WeeklyRecords
    const allMonthlyRecords = isChild2 ? child2MonthlyRecords : child1MonthlyRecords

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
        setActiveTab("grades")
    }

    const handleChildSwitch = (id) => {
        setSelectedChildId(id)
        setActiveTab("overview")
        setSelectedSemester("hk1")
    }

    const allChildren = [
        { id: "child1", name: child1.name, className: child1.className, schoolYear: child1.schoolYear, avatarLetter: child1.avatarLetter, avatarColor: child1.avatarColor },
        { id: "child2", name: child2.name, className: child2.className, schoolYear: child2.schoolYear, avatarLetter: child2.avatarLetter, avatarColor: child2.avatarColor }
    ]

    return (
        <div className="parent-children-overview-page">
            <div className="page-title-block">
                <h1>Tổng quan con em</h1>
            </div>

            <ChildSwitcher
                children={allChildren}
                selectedId={selectedChildId}
                onSelect={handleChildSwitch}
            />

            <ChildHeader child={childData} onStatClick={handleOverviewCardClick} />

            <ChildTabs activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === "overview" && (
                <div className="overview-tab-content">
                    <div className="overview-top-single">
                        <GradesSection
                            compact
                            gradesBySemester={gradesBySemester}
                            selectedSemester={selectedSemester}
                            onSemesterChange={setSelectedSemester}
                        />
                    </div>

                    <div className="overview-triple-grid">
                        <AttendanceSection data={attendanceData} compact />
                        <CalendarSection schedule={scheduleData} events={upcomingEvents} compact />
                        <LeaveRequestSection requests={leaveRequests.slice(0, 3)} compact />
                    </div>
                </div>
            )}

            {activeTab === "attendance" && (
                <AttendanceSection data={attendanceData} />
            )}

            {activeTab === "calendar" && (
                <CalendarSection schedule={scheduleData} events={upcomingEvents} />
            )}

            {activeTab === "grades" && (
                <GradesSection
                    gradesBySemester={gradesBySemester}
                    selectedSemester={selectedSemester}
                    onSemesterChange={setSelectedSemester}
                />
            )}

            {activeTab === "leave" && (
                <LeaveRequestSection requests={leaveRequests} />
            )}
        </div>
    )
}