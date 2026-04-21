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

/* ADMIN SUB-ROLE LAYOUTS */
const PrincipalLayout = lazy(() => import("../layouts/principal/PrincipalLayout"));
const VpAcademicLayout = lazy(() => import("../layouts/vp-academic/VpAcademicLayout"));
const VpDisciplineLayout = lazy(() => import("../layouts/vp-discipline/VpDisciplineLayout"));
const AcademicStaffLayout = lazy(() => import("../layouts/academic-staff/AcademicStaffLayout"));
const FinanceLayout = lazy(() => import("../layouts/finance/FinanceLayout"));

/* PRINCIPAL PAGES */
const PrincipalDashboard = lazy(() => import("../pages/principal/dashboard/PrincipalDashboard"));
const PrincipalOverview = lazy(() => import("../pages/principal/overview/PrincipalOverview"));
const PrincipalApprovals = lazy(() => import("../pages/principal/approvals/PrincipalApprovals"));
const PrincipalReports = lazy(() => import("../pages/principal/reports/PrincipalReports"));
const PrincipalAuditLogs = lazy(() => import("../pages/principal/audit-logs/PrincipalAuditLogs"));
const PrincipalNotifications = lazy(() => import("../pages/principal/notifications/PrincipalNotifications"));

/* VP ACADEMIC PAGES */
const VpAcademicDashboard = lazy(() => import("../pages/vp-academic/dashboard/VpAcademicDashboard"));
const VpAcademicGrades = lazy(() => import("../pages/vp-academic/grades/VpAcademicGrades"));
const VpAcademicApprovals = lazy(() => import("../pages/vp-academic/approvals/VpAcademicApprovals"));
const VpAcademicExams = lazy(() => import("../pages/vp-academic/exams/VpAcademicExams"));
const VpAcademicTimetable = lazy(() => import("../pages/vp-academic/timetable/VpAcademicTimetable"));
const VpAcademicTeachingAssignment = lazy(() => import("../pages/vp-academic/teaching-assignment/VpAcademicTeachingAssignment"));
const VpAcademicDataManagement = lazy(() => import("../pages/vp-academic/data-management/VpAcademicDataManagement"));
const VpAcademicNotifications = lazy(() => import("../pages/vp-academic/notifications/VpAcademicNotifications"));

/* VP DISCIPLINE PAGES */
const VpDisciplineDashboard = lazy(() => import("../pages/vp-discipline/dashboard/VpDisciplineDashboard"));
const VpDisciplineMgmt = lazy(() => import("../pages/vp-discipline/discipline-management/VpDisciplineMgmt"));
const VpDisciplineCompetition = lazy(() => import("../pages/vp-discipline/competition/VpDisciplineCompetition"));
const VpDisciplineAttendance = lazy(() => import("../pages/vp-discipline/attendance/VpDisciplineAttendance"));
const VpDisciplineConduct = lazy(() => import("../pages/vp-discipline/conduct/VpDisciplineConduct"));
const VpDisciplineApprovals = lazy(() => import("../pages/vp-discipline/approvals/VpDisciplineApprovals"));
const VpDisciplineReports = lazy(() => import("../pages/vp-discipline/reports/VpDisciplineReports"));
const VpDisciplineNotifications = lazy(() => import("../pages/vp-discipline/notifications/VpDisciplineNotifications"));

/* ACADEMIC STAFF PAGES */
const AcademicStaffDashboard = lazy(() => import("../pages/academic-staff/dashboard/AcademicStaffDashboard"));
const AcademicStaffPersonnel = lazy(() => import("../pages/academic-staff/personnel/AcademicStaffPersonnel"));
const AcademicStaffClassMgmt = lazy(() => import("../pages/academic-staff/class-management/AcademicStaffClassMgmt"));
const AcademicStaffTimetable = lazy(() => import("../pages/academic-staff/timetable/AcademicStaffTimetable"));
const AcademicStaffAcademicRecords = lazy(() => import("../pages/academic-staff/academic-records/AcademicStaffAcademicRecords"));
const AcademicStaffImport = lazy(() => import("../pages/academic-staff/import/AcademicStaffImport"));
const AcademicStaffNotifications = lazy(() => import("../pages/academic-staff/notifications/AcademicStaffNotifications"));

/* FINANCE PAGES */
const FinanceDashboard = lazy(() => import("../pages/finance/dashboard/FinanceDashboard"));
const FinanceFeeManagement = lazy(() => import("../pages/finance/fee-management/FinanceFeeManagement"));
const FinancePaymentHub = lazy(() => import("../pages/finance/payment-hub/FinancePaymentHub"));
const FinanceReports = lazy(() => import("../pages/finance/reports/FinanceReports"));
const FinanceNotifications = lazy(() => import("../pages/finance/notifications/FinanceNotifications"));
const FinanceApprovals = lazy(() => import("../pages/finance/approvals/FinanceApprovals"));
const FinanceAuditLog = lazy(() => import("../pages/finance/settings/FinanceAuditLog"));


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

      {/* PRINCIPAL */}
      <Route path="/principal" element={<PrincipalLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PrincipalDashboard />} />
        <Route path="overview" element={<PrincipalOverview />} />
        <Route path="classes/:classId" element={<ClassDetailSection />} />
        <Route path="approvals" element={<PrincipalApprovals />} />
        <Route path="reports" element={<PrincipalReports />} />
        <Route path="audit-logs" element={<PrincipalAuditLogs />} />
        <Route path="notifications" element={<PrincipalNotifications />} />
      </Route>

      {/* VP ACADEMIC */}
      <Route path="/vp-academic" element={<VpAcademicLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<VpAcademicDashboard />} />
        <Route path="grades" element={<VpAcademicGrades />} />
        <Route path="approvals" element={<VpAcademicApprovals />} />
        <Route path="exams" element={<VpAcademicExams />} />
        <Route path="timetable" element={<VpAcademicTimetable />} />
        <Route path="teaching-assignment" element={<VpAcademicTeachingAssignment />} />
        <Route path="data-management" element={<VpAcademicDataManagement />} />
        <Route path="notifications" element={<VpAcademicNotifications />} />
      </Route>

      {/* VP DISCIPLINE */}
      <Route path="/vp-discipline" element={<VpDisciplineLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<VpDisciplineDashboard />} />
        <Route path="discipline-management" element={<VpDisciplineMgmt />} />
        <Route path="discipline" element={<Navigate to="/vp-discipline/discipline-management" replace />} />
        <Route path="incidents" element={<Navigate to="/vp-discipline/discipline-management" replace />} />
        <Route path="competition" element={<VpDisciplineCompetition />} />
        <Route path="attendance" element={<VpDisciplineAttendance />} />
        <Route path="conduct" element={<VpDisciplineConduct />} />
        <Route path="approvals" element={<VpDisciplineApprovals />} />
        <Route path="reports" element={<VpDisciplineReports />} />
        <Route path="notifications" element={<VpDisciplineNotifications />} />
      </Route>

      {/* ACADEMIC STAFF */}
      <Route path="/academic" element={<AcademicStaffLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AcademicStaffDashboard />} />
        <Route path="personnel" element={<AcademicStaffPersonnel />} />
        <Route path="class-management" element={<AcademicStaffClassMgmt />} />
        <Route path="timetable" element={<AcademicStaffTimetable />} />
        <Route path="academic-records" element={<AcademicStaffAcademicRecords />} />
        <Route path="import" element={<AcademicStaffImport />} />
        <Route path="notifications" element={<AcademicStaffNotifications />} />
      </Route>

      {/* FINANCE */}
      <Route path="/finance" element={<FinanceLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<FinanceDashboard />} />
        <Route path="fee-management" element={<FinanceFeeManagement />} />
        <Route path="payment-hub" element={<FinancePaymentHub />} />
        <Route path="reports" element={<FinanceReports />} />
        <Route path="approvals" element={<FinanceApprovals />} />
        <Route path="audit-log" element={<FinanceAuditLog />} />
        <Route path="notifications" element={<FinanceNotifications />} />
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