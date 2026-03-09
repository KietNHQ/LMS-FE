import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import Dashboard from "../pages/admin/Dashboard";
import UITestPage from "../components/ui/UITestPage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* thêm route test */}
      <Route path="/ui-test" element={<UITestPage />} />
    </Routes>
  );
}