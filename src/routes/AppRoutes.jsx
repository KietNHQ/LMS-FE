import { Navigate, Route, Routes } from "react-router-dom";

/* AUTH PAGES */
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

/* ADMIN PAGES */
import AdminLayout from "../layouts/admin/AdminLayout";
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import AdminUsers from "../pages/admin/users/AdminUsers";
import AdminTeachers from "../pages/admin/teachers/AdminTeachers";
import AdminStudents from "../pages/admin/students/AdminStudents";
import AdminParents from "../pages/admin/parents/AdminParents";
import AdminClasses from "../pages/admin/classes/AdminClasses";
import AdminCourses from "../pages/admin/courses/AdminCourses";
import AdminTimetable from "../pages/admin/timetable/AdminTimetable";
import AdminAttendance from "../pages/admin/attendance/AdminAttendance";
import AdminNotifications from "../pages/admin/notifications/AdminNotifications";
import AdminReports from "../pages/admin/reports/AdminReports";

/* STUDENT PAGES */
import StudentLayout from "../layouts/student/StudentLayout";
import StudentDashboard from "../pages/student/dashboard/StudentDashboard";
import StudentClasses from "../pages/student/classes/StudentClasses";
import StudentClassDetail from "../pages/student/classes/StudentClassDetail";
import StudentGrades from "../pages/student/grades/StudentGrades";
import StudentQuiz from "../pages/student/quiz/StudentQuiz";
import StudentNotifications from "../pages/student/notification/StudentNotifications";
import StudentSchedule from "../pages/student/schedule/StudentSchedule";
import StudentSupport from "../pages/student/support/StudentSupport";
// import StudentProfile from "../pages/student/profile/StudentProfile";

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

/* PARENT PAGES */
import ParentLayout from "../layouts/parent/ParentLayout";
import ParentDashboard from "../pages/parent/dashboard/ParentDashboard";
import ParentChildrenOverview from "../pages/parent/children-overview/ParentChildrenOverview";
import ParentNotifications from "../pages/parent/notifications/ParentNotifications";
import ParentMessages from "../pages/parent/messages/ParentMessages";
import ParentPayments from "../pages/parent/payments/ParentPayments";
import ParentSupport from "../pages/parent/support/ParentSupport";


export default function AppRoutes() {
  return (
    <Routes>
      {/* DEFAULT */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/login/forgotpass" element={<ForgotPassword />} />
      <Route path="/login/resetpass" element={<ResetPassword />} />

      {/* ADMIN */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="teachers" element={<AdminTeachers />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="parents" element={<AdminParents />} />
        <Route path="classes" element={<AdminClasses />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="timetable" element={<AdminTimetable />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      {/* STUDENT */}
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="classes" element={<StudentClasses />} />
        <Route path="classes/:classId" element={<StudentClassDetail />} />
        <Route path="grades" element={<StudentGrades />} />
        <Route path="quiz" element={<StudentQuiz />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="schedule" element={<StudentSchedule />} />
        <Route path="support" element={<StudentSupport />} />
        {/* <Route path="profile" element={<StudentProfile />} /> */}
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
      </Route>

        {/* PARENT */}
        <Route path="/parent" element={<ParentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ParentDashboard />} />
            <Route path="children-overview" element={<ParentChildrenOverview />} />
            <Route path="notifications" element={<ParentNotifications />} />
            <Route path="messages" element={<ParentMessages />} />
            <Route path="payments" element={<ParentPayments />} />
            <Route path="support" element={<ParentSupport />} />
        </Route>

    </Routes>
  );
}