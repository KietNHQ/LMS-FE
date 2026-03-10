import React from "react";
import "./DashboardTest.css";

import {
    PiStudent,
    PiChalkboardTeacher,
    PiBooks,
    PiMoneyWavy,
} from "react-icons/pi";

import DashboardHeader from "./components/DashboardHeader/DashboardHeader";
import DashboardSection from "./components/DashboardSection/DashboardSection";
import StatCard from "./components/StatCard/StatCard";
import ProgressChart from "./components/ProgressChart/ProgressChart";
import NotificationPreview from "./components/NotificationPreview/NotificationPreview";
import QuizList from "./components/QuizList/QuizList";
import RadarChart from "./components/RadarChart/RadarChart";
import YearProgress from "./components/YearProgress/YearProgress";

export default function DashboardTest() {
    const role = localStorage.getItem("role") || "admin" +
        "";

    const notifications = [
        { type: "warning", text: "Midterm schedule updated" },
        { type: "info", text: "3 new student registrations" },
        { type: "success", text: "Monthly report generated successfully" },
    ];

    const quizzes = [
        { title: "Grammar Quiz", meta: "Due tomorrow" },
        { title: "Vocabulary Test", meta: "Class 10A1" },
        { title: "Reading Practice", meta: "Friday, 10:00 AM" },
    ];

    return (
        <div className={`dashboard-test-page role-${role}`}>
            <DashboardHeader
                title="Dashboard Preview"
                subtitle="Testing all dashboard components"
                role={role}
            />

            <div className="dashboard-test-stats">
                <StatCard
                    title="Total Students"
                    value="1,240"
                    icon={<PiStudent />}
                    role={role}
                />
                <StatCard
                    title="Total Teachers"
                    value="82"
                    icon={<PiChalkboardTeacher />}
                    role={role}
                />
                <StatCard
                    title="Active Classes"
                    value="35"
                    icon={<PiBooks />}
                    role={role}
                />
                <StatCard
                    title="Revenue"
                    value="$32,000"
                    icon={<PiMoneyWavy />}
                    role={role}
                />
            </div>

            <div className="dashboard-test-grid">
                <DashboardSection title="Progress Chart" role={role}>
                    <ProgressChart role={role} title="Student Growth" />
                </DashboardSection>

                <DashboardSection title="Notifications" role={role}>
                    <NotificationPreview items={notifications} />
                </DashboardSection>

                <DashboardSection title="Quiz List" role={role}>
                    <QuizList items={quizzes} />
                </DashboardSection>

                <DashboardSection title="Subject Radar" role={role}>
                    <RadarChart role={role} />
                </DashboardSection>

                <DashboardSection title="Year Progress" role={role}>
                    <YearProgress />
                </DashboardSection>

                <DashboardSection title="Latest Students" role={role}>
                    <div className="test-list">
                        <div className="test-list-item">
                            <span className="student-name">Nguyen Van A</span>
                            <span className="student-class">Class 10A1</span>
                        </div>

                        <div className="test-list-item">
                            <span className="student-name">Tran Thi B</span>
                            <span className="student-class">Class 11A2</span>
                        </div>

                        <div className="test-list-item">
                            <span className="student-name">Le Van C</span>
                            <span className="student-class">Class 12A3</span>
                        </div>
                    </div>
                </DashboardSection>
            </div>
        </div>
    );
}