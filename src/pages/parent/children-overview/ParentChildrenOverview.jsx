import React, { useState } from "react"
import "./ParentChildrenOverview.css"
import ChildHeader from "./components/childHeader/ChildHeader"
import ChildTabs from "./components/ChildTabs/ChildTabs"
import ChildOverviewSection from "./components/ChildOverviewSection/ChildOverviewSection"
import AttendanceSection from "./components/attendanceSection/AttendanceSection"
import CalendarSection from "./components/calendarSection/CalendarSection"
import GradesSection from "./components/GradesSection/GradesSection"
import LeaveRequestSection from "./components/LeaveRequestSection/LeaveRequestSection"

export default function ParentChildrenOverview() {
    const [activeTab, setActiveTab] = useState("overview")
    const [selectedSemester, setSelectedSemester] = useState("hk1")

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

    const childData = {
        name: "Nguyễn Minh Tuấn",
        studentId: "STU1024",
        className: "10A1",
        schoolYear: "2025 - 2026",
        status: "Đang học",
        parentName: "Nguyễn Văn Phụ Huynh",
        homeroomTeacher: "Trần Thị Lan Anh",
        avatarLetter: "N",
        averageScores: {
            semester1: "8.4",
            semester2: "8.8",
            fullYear: "8.6"
        },
        attendanceRate: "96%"
    }

    const overviewCards = [
        {
            title: "TBHK I",
            value: childData.averageScores.semester1,
            type: "primary",
            semesterKey: "hk1"
        },
        {
            title: "TBHK II",
            value: childData.averageScores.semester2,
            type: "success",
            semesterKey: "hk2"
        },
        {
            title: "Cả năm",
            value: childData.averageScores.fullYear,
            type: "warning",
            semesterKey: "year"
        }
    ]

    const weeklyRecords = [
        { day: "Thứ 2", status: "Có mặt" },
        { day: "Thứ 3", status: "Có mặt" },
        { day: "Thứ 4", status: "Đi muộn" },
        { day: "Thứ 5", status: "Có mặt" },
        { day: "Thứ 6", status: "Vắng mặt" }
    ]

    // Tất cả bản ghi theo tháng — định dạng DD/MM/YYYY
    const allMonthlyRecords = [
        // Tháng 1/2026
        { day: "05/01/2026", status: "Có mặt" },
        { day: "06/01/2026", status: "Có mặt" },
        { day: "07/01/2026", status: "Đi muộn" },
        { day: "08/01/2026", status: "Có mặt" },
        { day: "09/01/2026", status: "Có mặt" },
        { day: "12/01/2026", status: "Có mặt" },
        { day: "13/01/2026", status: "Vắng mặt" },
        { day: "14/01/2026", status: "Có mặt" },
        { day: "15/01/2026", status: "Có mặt" },
        { day: "16/01/2026", status: "Đi muộn" },
        { day: "19/01/2026", status: "Có mặt" },
        { day: "20/01/2026", status: "Có mặt" },
        { day: "21/01/2026", status: "Có mặt" },
        { day: "22/01/2026", status: "Có mặt" },
        { day: "23/01/2026", status: "Vắng mặt" },
        // Tháng 2/2026
        { day: "02/02/2026", status: "Có mặt" },
        { day: "03/02/2026", status: "Có mặt" },
        { day: "04/02/2026", status: "Có mặt" },
        { day: "05/02/2026", status: "Đi muộn" },
        { day: "06/02/2026", status: "Có mặt" },
        { day: "09/02/2026", status: "Có mặt" },
        { day: "10/02/2026", status: "Vắng mặt" },
        { day: "11/02/2026", status: "Có mặt" },
        { day: "12/02/2026", status: "Có mặt" },
        { day: "13/02/2026", status: "Có mặt" },
        { day: "16/02/2026", status: "Có mặt" },
        { day: "17/02/2026", status: "Có mặt" },
        { day: "18/02/2026", status: "Đi muộn" },
        { day: "19/02/2026", status: "Có mặt" },
        { day: "20/02/2026", status: "Có mặt" },
        { day: "23/02/2026", status: "Có mặt" },
        { day: "24/02/2026", status: "Có mặt" },
        { day: "25/02/2026", status: "Vắng mặt" },
        { day: "26/02/2026", status: "Có mặt" },
        { day: "27/02/2026", status: "Có mặt" },
        // Tháng 3/2026
        { day: "03/03/2026", status: "Có mặt" },
        { day: "04/03/2026", status: "Có mặt" },
        { day: "05/03/2026", status: "Đi muộn" },
        { day: "06/03/2026", status: "Có mặt" },
        { day: "07/03/2026", status: "Có mặt" },
        { day: "10/03/2026", status: "Vắng mặt" },
        { day: "11/03/2026", status: "Có mặt" },
        { day: "12/03/2026", status: "Có mặt" },
        { day: "13/03/2026", status: "Có mặt" },
        { day: "14/03/2026", status: "Đi muộn" },
        { day: "17/03/2026", status: "Có mặt" },
        { day: "18/03/2026", status: "Có mặt" },
        { day: "19/03/2026", status: "Có mặt" },
        { day: "20/03/2026", status: "Có mặt" },
        { day: "21/03/2026", status: "Có mặt" },
        { day: "24/03/2026", status: "Vắng mặt" },
        { day: "25/03/2026", status: "Có mặt" },
        { day: "26/03/2026", status: "Có mặt" },
        { day: "27/03/2026", status: "Có mặt" },
        { day: "28/03/2026", status: "Có mặt" },
        { day: "31/03/2026", status: "Có mặt" },
    ]

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

    const scheduleData = [
        { day: "Thứ 2", time: "08:00 - 09:30", subject: "Toán học", room: "A101" },
        { day: "Thứ 3", time: "09:45 - 11:15", subject: "Tiếng Anh", room: "B203" },
        { day: "Thứ 4", time: "13:00 - 14:30", subject: "Vật lý", room: "C110" }
    ]

    const upcomingEvents = [
        { title: "Kiểm tra Tiếng Anh", date: "Thứ 6, 14 Tháng 3", type: "Kiểm tra" },
        { title: "Cuộc họp Phụ huynh", date: "Thứ 7, 15 Tháng 3", type: "Họp" },
        { title: "Bài kiểm tra Toán", date: "Thứ 2, 17 Tháng 3", type: "Bài kiểm tra" }
    ]

    const gradesBySemester = {
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

    const handleOverviewCardClick = (semesterKey) => {
        if (!semesterKey) return
        setSelectedSemester(semesterKey)
        setActiveTab("grades")
    }

    const leaveRequests = [
        { date: "2026-03-01", reason: "Sốt cao và nghỉ tại nhà", status: "Đã duyệt", approver: "Giáo viên chủ nhiệm" },
        { date: "2026-03-08", reason: "Sự kiện gia đình", status: "Đang chờ", approver: "—" },
        { date: "2026-03-10", reason: "Khám sức khỏe", status: "Bị từ chối", approver: "Văn phòng nhà trường" }
    ]

    return (
        <div className="parent-children-overview-page">
            <div className="page-title-block">
                <h1>Tổng quan con em</h1>
            </div>

            <ChildHeader child={childData} onStatClick={handleOverviewCardClick} />

            <ChildTabs activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === "overview" && (
                <div className="overview-tab-content">
                    <ChildOverviewSection cards={overviewCards} onCardClick={handleOverviewCardClick} />

                    <div className="overview-dual-grid">
                        <AttendanceSection data={attendanceData} compact />
                        <CalendarSection schedule={scheduleData} events={upcomingEvents} compact />
                    </div>

                    <div className="overview-bottom-grid">
                        <GradesSection
                            compact
                            gradesBySemester={gradesBySemester}
                            selectedSemester={selectedSemester}
                            onSemesterChange={setSelectedSemester}
                        />
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