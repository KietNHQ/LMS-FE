import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import UITestPage from "./components/ui/UITestPage.jsx";

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
            </Routes>
        </BrowserRouter>
    );
}

export default App;