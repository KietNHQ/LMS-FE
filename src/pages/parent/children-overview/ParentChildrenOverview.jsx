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
        gpa: "8.7",
        attendanceRate: "96%",
        assignmentsDone: "24",
        notices: "3"
    }

    const overviewCards = [
        {
            title: "GPA Hiện tại",
            value: "8.7",
            type: "primary"
        },
        {
            title: "Bài tập hoàn thành",
            value: "24",
            type: "warning"
        },
        {
            title: "Thông báo mới",
            value: "3",
            type: "danger"
        }
    ]

    const weeklyRecords = [
        { day: "Thứ 2", status: "Có mặt" },
        { day: "Thứ 3", status: "Có mặt" },
        { day: "Thứ 4", status: "Đi muộn" },
        { day: "Thứ 5", status: "Có mặt" },
        { day: "Thứ 6", status: "Vắng mặt" }
    ]

    const monthlyRecords = [
        { day: "03/03", status: "Có mặt" },
        { day: "04/03", status: "Có mặt" },
        { day: "05/03", status: "Đi muộn" },
        { day: "06/03", status: "Có mặt" },
        { day: "07/03", status: "Có mặt" },
        { day: "10/03", status: "Vắng mặt" },
        { day: "11/03", status: "Có mặt" },
        { day: "12/03", status: "Có mặt" },
        { day: "13/03", status: "Có mặt" },
        { day: "14/03", status: "Đi muộn" },
        { day: "17/03", status: "Có mặt" },
        { day: "18/03", status: "Có mặt" },
        { day: "19/03", status: "Có mặt" },
        { day: "20/03", status: "Có mặt" },
        { day: "21/03", status: "Có mặt" },
        { day: "24/03", status: "Vắng mặt" },
        { day: "25/03", status: "Có mặt" },
        { day: "26/03", status: "Có mặt" },
        { day: "27/03", status: "Có mặt" },
        { day: "28/03", status: "Có mặt" },
        { day: "31/03", status: "Có mặt" }
    ]

    const weeklySummary = buildAttendanceSummary("Tuần này", weeklyRecords)
    const monthlySummary = buildAttendanceSummary("Tháng này", monthlyRecords)

    const attendanceData = {
        present: weeklySummary.present,
        absent: weeklySummary.absent,
        late: weeklySummary.late,
        weeklySummary,
        monthlySummary,
        weeklyRecords,
        monthlyRecords,
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

    const gradesData = [
        { subject: "Toán học", oral: 8.5, test15: 8.0, midterm: 8.5, final: 9.0, average: 8.6, status: "Tốt" },
        { subject: "Tiếng Anh", oral: 8.0, test15: 7.5, midterm: 8.0, final: 8.5, average: 8.0, status: "Tốt" },
        { subject: "Vật lý", oral: 9.0, test15: 8.5, midterm: 8.0, final: 8.5, average: 8.5, status: "Xuất sắc" },
        { subject: "Văn học", oral: 7.5, test15: 7.0, midterm: 7.5, final: 8.0, average: 7.6, status: "Ổn định" }
    ]

    const leaveRequests = [
        { date: "2026-03-01", reason: "Sốt cao và nghỉ tại nhà", status: "Đã duyệt", approver: "Giáo viên chủ nhiệm" },
        { date: "2026-03-08", reason: "Sự kiện gia đình", status: "Đang chờ", approver: "—" },
        { date: "2026-03-10", reason: "Khám sức khỏe", status: "Bị từ chối", approver: "Văn phòng nhà trường" }
    ]

    return (
        <div className="parent-children-overview-page">
            <div className="page-title-block">
                <h1>Tổng quan con em</h1>
                <p>Theo dõi tiến độ học tập, điểm danh, lịch học, điểm số và đơn xin phép của con em.</p>
            </div>

            <ChildHeader child={childData} />

            <ChildTabs activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === "overview" && (
                <div className="overview-tab-content">
                    <ChildOverviewSection cards={overviewCards} />

                    <div className="overview-dual-grid">
                        <AttendanceSection data={attendanceData} compact />
                        <CalendarSection schedule={scheduleData} events={upcomingEvents} compact />
                    </div>

                    <div className="overview-bottom-grid">
                        <GradesSection grades={gradesData.slice(0, 4)} compact />
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
                <GradesSection grades={gradesData} />
            )}

            {activeTab === "leave" && (
                <LeaveRequestSection requests={leaveRequests} />
            )}
        </div>
    )
}