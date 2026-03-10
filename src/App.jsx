import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import UITestPage from "./components/ui/UITestPage.jsx";
import CommonTestPage from "./components/common/CommonTestPage.jsx";
import DashboardTest from "./components/dashboard/DashboardTest.jsx";

import ParentLayout from "./components/sidebar/SidebarLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import TeacherDashboard from "./pages/teacher/TeacherDashboard.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import ParentDashboard from "./pages/parent/ParentDashboard.jsx";

import "./styles/variables.css";
import "./styles/global.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/login/forgotpass" element={<ForgotPassword />} />
                <Route path="/login/resetpass" element={<ResetPassword />} />

                --test components--
                <Route path="/ui-test" element={<UITestPage />} />
                <Route path="/common-test" element={<CommonTestPage />} />
                <Route path="/dashboard-test" element={<DashboardTest />} />

                <Route path="/admin" element={<ParentLayout role="admin">
                    <AdminDashboard />
                    </ParentLayout>
                    }
                />
                <Route path="/teacher" element={<ParentLayout role="teacher">
                    <TeacherDashboard />
                    </ParentLayout>
                    }
                />
                <Route path="/student" element={<ParentLayout role="student">
                    <StudentDashboard />
                    </ParentLayout>
                    }
                />
                <Route path="/parent" element={<ParentLayout role="parent">
                    <ParentDashboard />
                    </ParentLayout>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;