import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoadingAnimationBook } from "../components/common";
import ProtectedRoute from "../components/common/ProtectedRoute/ProtectedRoute";

/* AUTH PAGES */
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

/* ADMIN PAGES */
const AdminLayout = lazy(() => import("../layouts/admin/AdminLayout"));
const AdminDashboard = lazy(
  () => import("../pages/admin/dashboard/AdminDashboard")
);
const AdminUsers = lazy(() => import("../pages/management/users/ManagementUsers"));
const AdminNotifications = lazy(
  () => import("../pages/management/notifications/ManagementNotifications")
);

/* ── MANAGEMENT LAYOUT (Thay thế Admin/Principal/VP/Finance Layout) ── */
const ManagementLayout = lazy(() => import("../layouts/management/ManagementLayout"));
const ManagementDashboard = lazy(() => import("../pages/management/dashboard/index.js"));
const ManagementUsers = lazy(() => import("../pages/management/users/ManagementUsers"));
const ManagementClasses = lazy(() => import("../pages/management/classes/ManagementClasses"));
const ManagementClassDetail = lazy(() => import("../pages/management/classes/components/classDetailSection/classDetailSection"));
const ManagementAcademicDashboard = lazy(() => import("../pages/management/academic/dashboard/VpAcademicDashboard"));
const ManagementDiscipline = lazy(() => import("../pages/management/discipline/index.js"));
const ManagementDisciplineReports = lazy(() => import("../pages/management/discipline/ManagementDisciplineReports"));
const ManagementTranscriptExport = lazy(() => import("../pages/management/discipline/export/VpTranscriptExport"));
const ManagementBonusPoints = lazy(() => import("../pages/management/discipline/bonus-points"));
const ManagementPeriodClosing = lazy(() => import("../pages/management/discipline/period-closing/VpDisciplinePeriodClosing"));
const ManagementClassDeductionLogs = lazy(() => import("../pages/management/discipline/class-deduction-logs/VpClassDeductionLogs"));
const ManagementCompetition = lazy(() => import("../pages/management/competition/index.js"));
const ManagementGrades = lazy(() => import("../pages/management/academic/grades/VpAcademicGrades"));
const ManagementQuiz = lazy(() => import("../pages/management/quiz/ManagementQuiz"));
const ManagementCreateQuiz = lazy(() => import("../pages/management/quiz/create/ManagementCreateQuiz"));
const ManagementQuizSubmissions = lazy(() => import("../pages/management/quiz/submissions/ManagementQuizSubmissions"));
const ManagementExams = lazy(() => import("../pages/management/exams/index.js"));
const ManagementExamRooms = lazy(() => import("../pages/management/exams/rooms/index.js"));
const ManagementExamRoomDetail = lazy(() => import("../pages/management/exams/rooms/detail.js"));
const ManagementTimetable = lazy(() => import("../pages/management/timetable/ManagementTimetable"));
const ManagementFinance = lazy(() => import("../pages/management/finance/index.js"));
const ManagementFinanceDashboard = lazy(() => import("../pages/management/finance/dashboard/FinanceDashboard").then((m) => ({ default: m.FinanceDashboard })));
const ManagementFinancePaymentHub = lazy(() => import("../pages/management/finance/payment-hub/FinancePaymentHub"));
const ManagementFinanceDebts = lazy(() => import("../pages/management/finance/debts/FinanceDebts"));
const ManagementFinanceRevenue = lazy(() => import("../pages/management/finance/revenue/FinanceRevenue"));
const ManagementFinancePaymentHistory = lazy(() => import("../pages/management/finance/payment-history/FinancePaymentHistory"));
const ManagementApprovals = lazy(() => import("../pages/management/approvals/index.js"));
const ManagementNotifications = lazy(() => import("../pages/management/notifications/ManagementNotifications"));
const ManagementReports = lazy(() => import("../pages/management/reports/ManagementReports"));
const ManagementChat = lazy(() => import("../pages/management/chat/ManagementChat"));
const ManagementPromotion = lazy(() => import("../pages/management/promotion/PromotionPage"));
const ManagementSummerTraining = lazy(() => import("../pages/management/summer-training/SummerTrainingPage"));


/* ADMIN SUB-ROLE LAYOUTS (đã xóa — chuyển sang /management) */
// Dùng AdminAuditLog cho /admin/audit-log & /admin/system-log
const AdminAuditLog = lazy(() => import("../pages/admin/audit-log/AdminAuditLog"));
const AdminSystemLog = lazy(() => import("../pages/admin/system-log/AdminSystemLog"));


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
const StudentClassCommittee = lazy(() => import("../pages/student/class-committee/StudentClassCommittee.jsx"));
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
const TeacherStudentGradeDetail = lazy(() => import("../pages/teacher/grades/StudentGradeDetail"));
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
const TeacherBanCanSuLop = lazy(() => import("../pages/teacher/ban-can-su-lop/TeacherBanCanSuLop"));
const TeacherQuizSubmissions = lazy(
  () => import("../pages/teacher/quiz/submissions/TeacherQuizSubmissions")
);
const TeacherTeachingClassDetail = lazy(
  () => import("../pages/teacher/teachingClasses/TeacherTeachingClassDetail")
);
const TeacherNotifications = lazy(
  () => import("../pages/teacher/notifications/TeacherNotifications")
);
const TeacherChat = lazy(() => import("../pages/teacher/chat/TeacherChat"));


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

/**
 * RootRedirect - Tự động điều hướng người dùng dựa trên Role sau khi đăng nhập
 * Nếu chưa đăng nhập, mặc định cho vào cổng giáo viên (hoặc trang guest mong muốn)
 */
const RootRedirect = () => {
    // Chỉ cho phép vào thẳng Dashboard nếu:
    // 1. Đang có session hoạt động (mở tab)
    // 2. HOẶC có token local NHƯNG phải có cờ isPersistent=true (đã tích Ghi nhớ)
    const sessionToken = sessionStorage.getItem("accessToken");
    const localToken = localStorage.getItem("accessToken");
    const isPersistent = localStorage.getItem("isPersistent") === "true";
    
    const accessToken = sessionToken || (isPersistent ? localToken : null);
    const userString = sessionToken ? sessionStorage.getItem("user") : (isPersistent ? localStorage.getItem("user") : null);
    const user = userString ? JSON.parse(userString) : null;

    if (!accessToken || !user) {
        return <Navigate to="/login" replace />;
    }

    const role = (user.role || localStorage.getItem('userRole') || "").toLowerCase();
    
    // 1. ADMIN
    if (role === 'admin' || role === 'quản trị viên' || role === 'administrator') {
        return <Navigate to="/admin/dashboard" replace />;
    }
    
    // 2. MANAGEMENT
    const managementRoles = ['manager', 'management', 'quản lý', 'hiệu trưởng', 'phó ht học vụ', 'phó ht nề nếp', 'giáo vụ', 'tài chính', 'tổ trưởng bộ môn'];
    if (managementRoles.includes(role)) {
        return <Navigate to="/management/dashboard" replace />;
    }
    
    // 3. TEACHER
    if (role === 'teacher' || role === 'giáo viên') {
        return <Navigate to="/teacher/dashboard" replace />;
    }

    // 4. STUDENT
    if (role === 'student' || role === 'học sinh') {
        return <Navigate to="/student/dashboard" replace />;
    }

    // 5. PARENT
    if (role === 'guardian' || role === 'parent' || role === 'phụ huynh') {
        return <Navigate to="/parent/dashboard" replace />;
    }

    // FALLBACK: Nếu không khớp vai trò nào rõ ràng, đưa về Login cho an toàn
    return <Navigate to="/login" replace />;
};


export default function AppRoutes() {
  return (
    <Routes>
      {/* DEFAULT */}
      {/* DEFAULT */}
      <Route path="/" element={<RootRedirect />} />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/login/forgotpass" element={<ForgotPassword />} />
      <Route path="/login/resetpass" element={<ResetPassword />} />

      {/* ── ADMIN ── */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <Suspense fallback={<LoadingAnimationBook fullScreen={true} label="Đang tải giao diện quản trị..." />}>
            <AdminLayout />
          </Suspense>
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<AdminDashboard />} />
        <Route path="users"         element={<AdminUsers />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="audit-log"   element={<AdminAuditLog />} />
        <Route path="system-log"  element={<AdminSystemLog />} />
        <Route path="classes"       element={<Navigate to="/management/classes" replace />} />
        <Route path="classes/*"     element={<Navigate to="/management/classes" replace />} />
        <Route path="quiz"          element={<Navigate to="/management/quiz" replace />} />
        <Route path="timetable"     element={<Navigate to="/management/timetable" replace />} />
        <Route path="payment"       element={<Navigate to="/management/finance" replace />} />
        <Route path="competition"   element={<Navigate to="/management/competition" replace />} />
        <Route path="reports"       element={<Navigate to="/management/reports" replace />} />
      </Route>


      <Route path="/management" element={
        <ProtectedRoute allowedRoles={["management"]}>
          <Suspense fallback={<LoadingAnimationBook fullScreen={true} label="Đang tải hệ thống quản lý..." />}>
            <ManagementLayout />
          </Suspense>
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"    element={<ManagementDashboard />} />
        <Route path="users"        element={<ManagementUsers />} />
        <Route path="classes"      element={<ManagementClasses />} />
        <Route path="classes/:classId" element={<ManagementClassDetail />} />
        <Route path="academic"    element={<Navigate to="academic/dashboard" replace />} />
        <Route path="academic/dashboard" element={<ManagementAcademicDashboard />} />
        <Route path="discipline"   element={<ManagementDiscipline />} />
        <Route path="discipline-reports" element={<ManagementDisciplineReports />} />
        <Route path="discipline/export" element={<ManagementTranscriptExport />} />
        <Route path="discipline/bonus-points" element={<ManagementBonusPoints />} />
        <Route path="discipline/period-closing" element={<ManagementPeriodClosing />} />
        <Route path="discipline/class-deduction-logs/:classId" element={<ManagementClassDeductionLogs />} />
        <Route path="competition"  element={<ManagementCompetition />} />
        <Route path="grades"       element={<ManagementGrades />} />
        <Route path="quiz"         element={<ManagementQuiz />} />
        <Route path="quiz/create"  element={<ManagementCreateQuiz />} />
        <Route path="quiz/:quizId/submissions" element={<ManagementQuizSubmissions />} />
        <Route path="exams"        element={<ManagementExams />} />
        <Route path="exams/rooms"  element={<ManagementExamRooms />} />
        <Route path="exams/rooms/:roomId" element={<ManagementExamRoomDetail />} />
        <Route path="timetable"    element={<ManagementTimetable />} />
        <Route path="finance"      element={<ManagementFinance />} />
        <Route path="finance/dashboard" element={<ManagementFinanceDashboard />} />
        <Route path="finance/payment-hub" element={<ManagementFinancePaymentHub />} />
        <Route path="finance/debts" element={<ManagementFinanceDebts />} />
        <Route path="finance/revenue" element={<ManagementFinanceRevenue />} />
        <Route path="finance/payment-history" element={<ManagementFinancePaymentHistory />} />
        <Route path="approvals"    element={<ManagementApprovals />} />
        <Route path="notifications" element={<ManagementNotifications />} />
        <Route path="reports"      element={<ManagementReports />} />
        <Route path="chat"         element={<ManagementChat />} />
        <Route path="promotion"   element={<ManagementPromotion />} />
        <Route path="summer-training" element={<ManagementSummerTraining />} />
      </Route>

      {/* ── Redirect tương thích ngược ── */}
      <Route path="/principal/*"     element={<Navigate to="/management/dashboard" replace />} />
      <Route path="/vp-academic/*"   element={<Navigate to="/management/grades" replace />} />
      <Route path="/vp-discipline/*" element={<Navigate to="/management/discipline" replace />} />
      <Route path="/academic/*"      element={<Navigate to="/management/academic/dashboard" replace />} />
      <Route path="/finance/*"       element={<Navigate to="/management/finance" replace />} />


      <Route path="/student" element={
        <ProtectedRoute allowedRoles={["student", "học sinh"]}>
          <Suspense fallback={<LoadingAnimationBook fullScreen={true} label="Đang tải không gian học sinh..." />}>
            <StudentLayout />
          </Suspense>
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="classes" element={<StudentClasses />} />
        <Route path="classes/:classId" element={<ClassDetailView />} />
        <Route path="grades" element={<StudentGrades />} />
        <Route path="class-committee" element={<StudentClassCommittee />} />
        <Route path="quiz" element={<StudentQuiz />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="schedule" element={<StudentSchedule />} />
        <Route path="support" element={<StudentSupport />} />
      </Route>

      <Route path="/teacher" element={
        <ProtectedRoute allowedRoles={["teacher", "giáo viên"]}>
          <Suspense fallback={<LoadingAnimationBook fullScreen={true} label="Đang tải không gian giáo viên..." />}>
            <TeacherLayout />
          </Suspense>
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"        element={<TeacherDashboard />} />
        <Route path="teaching-classes" element={<TeacherTeachingClasses />} />
        <Route path="teaching-classes/:classId" element={<TeacherTeachingClassDetail />} />
        <Route path="ban-can-su-lop" element={<TeacherBanCanSuLop />} />
        <Route path="homeroom"         element={<TeacherHomeroom />} />
        <Route path="lessons"          element={<TeacherLessons />} />
        <Route path="grades"           element={<TeacherGrades />} />
        <Route path="grades/student/:enrollmentId" element={<TeacherStudentGradeDetail />} />
        <Route path="quiz"             element={<TeacherQuiz />} />
        <Route path="quiz/create"      element={<TeacherCreateQuiz />} />
        <Route path="quiz/:quizId/submissions" element={<TeacherQuizSubmissions />} />
        <Route path="schedule"         element={<TeacherSchedule />} />
        <Route path="notifications"    element={<TeacherNotifications />} />
        <Route path="chat"             element={<TeacherChat />} />
        <Route path="support"          element={<TeacherSupport />} />
      </Route>

        <Route path="/parent" element={
          <ProtectedRoute allowedRoles={["guardian", "parent", "phụ huynh"]}>
            <Suspense fallback={<LoadingAnimationBook fullScreen={true} label="Đang tải không gian phụ huynh..." />}>
              <ParentLayout />
            </Suspense>
          </ProtectedRoute>
        }>
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


