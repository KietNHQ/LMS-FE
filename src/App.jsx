import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import UITestPage from "./components/ui/UITestPage.jsx";
import CommonTestPage from "./components/common/CommonTestPage.jsx";
import DashboardTest from "./components/dashboard/DashboardTest.jsx";

import SidebarLayout from "./layouts/sidebar/SidebarLayout.jsx";
import AdminDashboard from "./components/dashboard/admin/AdminDashboard.jsx";
import TeacherDashboard from "./components/dashboard/teacher/TeacherDashboard.jsx";
import StudentDashboard from "./components/dashboard/student/StudentDashboard.jsx";
import ParentDashboard from "./components/dashboard/parent/ParentDashboard.jsx";

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

                <Route path="/admin" element={<SidebarLayout role="admin">
                    <AdminDashboard />
                    </SidebarLayout>
                    }
                />
                <Route path="/teacher" element={<SidebarLayout role="teacher">
                    <TeacherDashboard />
                    </SidebarLayout>
                    }
                />
                <Route path="/student" element={<SidebarLayout role="student">
                    <StudentDashboard />
                    </SidebarLayout>
                    }
                />
                <Route path="/parent" element={<SidebarLayout role="parent">
                    <ParentDashboard />
                    </SidebarLayout>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;