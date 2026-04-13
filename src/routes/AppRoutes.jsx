import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "../components/common";

/* AUTH PAGES */
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

/* ADMIN PAGES */
const AdminLayout = lazy(() => import("../layouts/admin/AdminLayout"));
const AdminDashboard = lazy(
  () => import("../pages/admin/dashboard/AdminDashboard")
);
const AdminUsers = lazy(() => import("../pages/admin/users/AdminUsers"));
const AdminClasses = lazy(() => import("../pages/admin/classes/AdminClasses"));
const ClassDetailSection = lazy(
  () =>
    import(
      "../pages/admin/classes/components/classDetailSection/classDetailSection"
    )
);
const AdminQuiz = lazy(() => import("../pages/admin/quiz/AdminQuiz"));
const AdminCreateQuiz = lazy(
  () => import("../pages/admin/quiz/create/AdminCreateQuiz")
);
const AdminTimetable = lazy(
  () => import("../pages/admin/timetable/AdminTimetable")
);
const AdminNotifications = lazy(
  () => import("../pages/admin/notifications/AdminNotifications")
);
const AdminReports = lazy(() => import("../pages/admin/reports/AdminReports"));
const AdminQuizSubmissions = lazy(
    () => import("../pages/admin/quiz/submissions/AdminQuizSubmissions")
);

const AdminPayment = lazy(() => import("../pages/admin/payment/AdminPayment"));
const AdminCompetition = lazy(() => import("../pages/admin/competition/AdminCompetition"));
const AdminCompetitionDetail = lazy(() => import("../pages/admin/competition/AdminCompetitionDetail"));

/* STUDENT PAGES */
const StudentLayout = lazy(() => import("../layouts/student/StudentLayout"));
const StudentDashboard = lazy(
  () => import("../pages/student/dashboard/StudentDashboard")
);
const StudentClasses = lazy(
  () => import("../pages/student/classes/StudentClasses")
);
const ClassDetailView = lazy(
  () => import("../pages/student/classes/components/ClassDetailView/ClassDetailView")
);
const StudentGrades = lazy(() => import("../pages/student/grades/StudentGrades"));
const StudentQuiz = lazy(() => import("../pages/student/quiz/StudentQuiz"));
const StudentNotifications = lazy(
  () => import("../pages/student/notification/StudentNotifications")
);
const StudentSchedule = lazy(
  () => import("../pages/student/schedule/StudentSchedule")
);
const StudentSupport = lazy(() => import("../pages/student/support/StudentSupport"));

// const StudentProfile = lazy(() => import("../pages/student/profile/StudentProfile"));

/* TEACHER PAGES */
const TeacherLayout = lazy(() => import("../layouts/teacher/TeacherLayout"));
const TeacherDashboard = lazy(
  () => import("../pages/teacher/dashboard/TeacherDashboard")
);
const TeacherGrades = lazy(() => import("../pages/teacher/grades/TeacherGrades"));
const TeacherHomeroom = lazy(
  () => import("../pages/teacher/homeroom/TeacherHomeroom")
);
const TeacherLessons = lazy(() => import("../pages/teacher/lessons/TeacherLessons"));
const TeacherQuiz = lazy(() => import("../pages/teacher/quiz/TeacherQuiz"));
const TeacherCreateQuiz = lazy(
  () => import("../pages/teacher/quiz/create/TeacherCreateQuiz")
);
const TeacherSchedule = lazy(
  () => import("../pages/teacher/schedule/TeacherSchedule")
);
const TeacherSupport = lazy(() => import("../pages/teacher/support/TeacherSupport"));
const TeacherTeachingClasses = lazy(
  () => import("../pages/teacher/teachingClasses/TeacherTeachingClasses")
);
const TeacherQuizSubmissions = lazy(
  () => import("../pages/teacher/quiz/submissions/TeacherQuizSubmissions")
);
const TeacherTeachingClassDetail = lazy(
  () => import("../pages/teacher/teachingClasses/TeacherTeachingClassDetail")
);
const TeacherNotifications = lazy(
  () => import("../pages/teacher/notifications/TeacherNotifications")
);


/* PARENT PAGES */
const ParentLayout = lazy(() => import("../layouts/parent/ParentLayout"));
const ParentDashboard = lazy(
  () => import("../pages/parent/dashboard/ParentDashboard")
);
const ParentChildrenOverview = lazy(
  () => import("../pages/parent/children-overview/ParentChildrenOverview")
);
const ParentNotifications = lazy(
  () => import("../pages/parent/notifications/ParentNotifications")
);
const ParentMessages = lazy(() => import("../pages/parent/messages/ParentMessages"));
const ParentPayments = lazy(() => import("../pages/parent/payments/ParentPayments"));
const ParentSupport = lazy(() => import("../pages/parent/support/ParentSupport"));



export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner label="Dang tai trang..." />}>
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
        <Route path="classes" element={<AdminClasses />} />
        <Route path="classes/:classId" element={<ClassDetailSection />} />
        <Route path="quiz" element={<AdminQuiz />} />
        <Route path="quiz/create" element={<AdminCreateQuiz />} />
        <Route path="quiz/:quizId/submissions" element={<AdminQuizSubmissions />} />
        <Route path="payment" element={<AdminPayment />} />
        <Route path="competition" element={<AdminCompetition />} />
        <Route path="competition/:classId" element={<AdminCompetitionDetail />} />
        <Route path="timetable" element={<AdminTimetable />} />
        <Route path="attendance" element={<Navigate to="/admin/classes" replace />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      {/* STUDENT */}
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="classes" element={<StudentClasses />} />
        <Route path="classes/:classId" element={<ClassDetailView />} />
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
        <Route path="teaching-classes/:classId" element={<TeacherTeachingClassDetail />} />
        <Route path="homeroom"         element={<TeacherHomeroom />} />
        <Route path="lessons"          element={<TeacherLessons />} />
        <Route path="grades"           element={<TeacherGrades />} />
        <Route path="quiz"             element={<TeacherQuiz />} />
        <Route path="quiz/create"      element={<TeacherCreateQuiz />} />
        <Route path="quiz/:quizId/submissions" element={<TeacherQuizSubmissions />} />
        <Route path="schedule"         element={<TeacherSchedule />} />
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
    </Suspense>
  );
}