import { Navigate, Route, Routes } from "react-router-dom";

/* AUTH PAGES */
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

/* STUDENT PAGES */
import StudentLayout from "../layouts/student/StudentLayout";
import StudentDashboard from "../pages/student/dashboard/StudentDashboard";
import StudentClasses from "../pages/student/classes/StudentClasses";
import StudentGrades from "../pages/student/grades/StudentGrades";
import StudentQuiz from "../pages/student/quiz/StudentQuiz";
import StudentNotifications from "../pages/student/notification/StudentNotifications";
import StudentSchedule from "../pages/student/schedule/StudentSchedule";
import StudentSupport from "../pages/student/support/StudentSupport";
import StudentProfile from "../pages/student/profile/StudentProfile";

/* TEACHER PAGES */
import TeacherLayout from "../layouts/teacher/TeacherLayout";
import TeacherDashboard from "../pages/teacher/dashboard/TeacherDashboard";
import TeacherGrades from "../pages/teacher/grades/TeacherGrades";
import TeacherHomeroom from "../pages/teacher/homeroom/TeacherHomeroom";
import TeacherLessons from "../pages/teacher/lessons/TeacherLessons";
import TeacherQuiz from "../pages/teacher/quiz/TeacherQuiz";
import TeacherRequest from "../pages/teacher/request/TeacherRequest";
import TeacherSchedule from "../pages/teacher/schedule/TeacherSchedule";
import TeacherSupport from "../pages/teacher/support/TeacherSupport";
import TeacherTeachingClasses from "../pages/teacher/teachingClasses/TeacherTeachingClasses";
import TeacherNotifications from "../pages/teacher/notifications/TeacherNotifications";
import TeacherProfile from "../pages/teacher/profile/TeacherProfile";

export default function AppRoutes() {
  return (
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

      {/* TEACHER */}
      <Route path="/teacher" element={<TeacherLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"        element={<TeacherDashboard />} />
        <Route path="teaching-classes" element={<TeacherTeachingClasses />} />
        <Route path="homeroom"         element={<TeacherHomeroom />} />
        <Route path="lessons"          element={<TeacherLessons />} />
        <Route path="grades"           element={<TeacherGrades />} />
        <Route path="quiz"             element={<TeacherQuiz />} />
        <Route path="schedule"         element={<TeacherSchedule />} />
        <Route path="request"          element={<TeacherRequest />} />
        <Route path="notifications"    element={<TeacherNotifications />} />
        <Route path="support"          element={<TeacherSupport />} />
        <Route path="profile"          element={<TeacherProfile />} />
      </Route>
    </Routes>
  );
}