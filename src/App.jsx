import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

/* AUTH PAGES */
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

/* STUDENT PAGES */
import StudentLayout from "./layouts/student/StudentLayout";
import StudentDashboard from "./pages/student/dashboard/StudentDashboard";
import StudentClasses from "./pages/student/classes/StudentClasses";
import StudentGrades from "./pages/student/grades/StudentGrades";
import StudentQuiz from "./pages/student/quiz/StudentQuiz";
import StudentNotifications from "./pages/student/notification/StudentNotifications";
import StudentSchedule from "./pages/student/schedule/StudentSchedule";
import StudentSupport from "./pages/student/support/StudentSupport";
import StudentProfile from "./pages/student/profile/StudentProfile";

/* GLOBAL STYLE */
import "./styles/variables.css";
import "./styles/global.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* DEFAULT */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* AUTH */}
                <Route path="/login" element={<Login />} />
                <Route path="/login/forgotpass" element={<ForgotPassword />} />
                <Route path="/login/resetpass" element={<ResetPassword />} />

                {/* STUDENT */}
                <Route path="/student" element={<StudentLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="classes" element={<StudentClasses />} />
                    <Route path="grades" element={<StudentGrades />} />
                    <Route path="quiz" element={<StudentQuiz />} />
                    <Route path="notifications" element={<StudentNotifications />} />
                    <Route path="schedule" element={<StudentSchedule />} />
                    <Route path="support" element={<StudentSupport />} />
                    <Route path="profile" element={<StudentProfile />} />
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;