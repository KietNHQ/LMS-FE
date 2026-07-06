import { useQuery } from "@tanstack/react-query";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import teacherService from "../../../services/pages/teacher/teacherService";
import VpDisciplineConduct from "../../management/discipline/conduct/VpDisciplineConduct";
import { FiInfo } from "react-icons/fi";
import "../homeroom/TeacherHomeroom.css";

function getStoredUser() {
  try {
    const isPersistent = localStorage.getItem("isPersistent") === "true";
    const userString = sessionStorage.getItem("user") || (isPersistent ? localStorage.getItem("user") : null);
    return JSON.parse(userString || "{}");
  } catch {
    return {};
  }
}

function resolveHomeroomClass(payload) {
  const data = payload?.data || payload || null;
  if (Array.isArray(data)) return data[0] || null;
  if (data && Object.keys(data).length > 0) return data;
  return null;
}

function getClassName(classData) {
  return classData?.class_name || classData?.className || classData?.name || "";
}

export default function TeacherConductRating() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const storedUser = getStoredUser();
  const teacherId = storedUser.profile?.id || storedUser.teacherId || (storedUser.role === "teacher" ? storedUser.id : null);

  const { data: homeroomClass, isLoading } = useQuery({
    queryKey: ["teacher-conduct-rating-homeroom", teacherId, selectedSchoolYear, selectedTerm],
    queryFn: async () => {
      if (!teacherId) return null;

      try {
        const consolidated = await teacherService.getConsolidatedHomeroom({
          pathParams: { id: teacherId },
          params: { schoolYear: selectedSchoolYear, term: selectedTerm },
        });
        const resolved = resolveHomeroomClass(consolidated);
        if (resolved) return resolved;
      } catch {
        // Fallback to the older homeroom endpoint below.
      }

      const response = await teacherService.getHomeroomClasses({
        mock: false,
        pathParams: { id: teacherId },
      });
      const classes = response?.data || [];
      return classes.find((item) => item.school_year === selectedSchoolYear) || classes[0] || null;
    },
    enabled: Boolean(teacherId),
    staleTime: 60_000,
  });

  const headerActions = (
    <SchoolYearTermSelector
      selectedSchoolYear={selectedSchoolYear}
      selectedTerm={selectedTerm}
      onYearChange={handleYearArrow}
      onTermChange={handleTermChange}
    />
  );

  if (isLoading) {
    return (
      <div className="teacher-homeroom-page">
        <PageHeader title="Đánh giá hạnh kiểm" actions={headerActions} />
        <div className="loading-state">
          <div className="spinner" />
          <p>Đang tải lớp chủ nhiệm...</p>
        </div>
      </div>
    );
  }

  if (!homeroomClass?.id) {
    return (
      <div className="teacher-homeroom-page">
        <PageHeader title="Đánh giá hạnh kiểm" actions={headerActions} />
        <div className="empty-state">
          <div className="empty-state-icon">
            <FiInfo size={48} />
          </div>
          <h3>Không tìm thấy lớp chủ nhiệm</h3>
          <p>Thầy/cô chưa được phân công lớp chủ nhiệm trong học kỳ này.</p>
        </div>
      </div>
    );
  }

  const className = getClassName(homeroomClass);

  return (
    <div className="teacher-homeroom-page">
      <PageHeader
        title={`Đánh giá hạnh kiểm: ${className || `Lớp ${homeroomClass.id}`}`}
        actions={headerActions}
      />
      <VpDisciplineConduct
        isEmbedded
        audience="teacher"
        fixedClassId={String(homeroomClass.id)}
        fixedClassName={className}
      />
    </div>
  );
}
