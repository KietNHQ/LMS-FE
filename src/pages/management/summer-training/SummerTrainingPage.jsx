import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader, EmptyState, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import Select from "../../../components/ui/Select/Select";
import {
  FiSun, FiPlay, FiCheckCircle, FiXCircle, FiClock, FiAward,
  FiEye, FiX, FiCheck, FiAlertTriangle, FiChevronLeft, FiChevronRight
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { summerTrainingService } from "../../../services/pages/management/summerTraining/summerTrainingService";
import { classesService } from "../../../services/pages/management/classes/classesService";
import { resolveSchoolYearId } from "../../../services/shared/schoolYearLookup";
import "./SummerTrainingPage.css";

const TRAINING_STATUS = {
  not_started: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-300", label: "Chưa bắt đầu", icon: FiClock },
  in_progress: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300", label: "Đang rèn luyện", icon: FiPlay },
  completed: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300", label: "Hoàn thành", icon: FiCheckCircle },
  not_completed: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", label: "Không hoàn thành", icon: FiXCircle },
};

const normalizeTrainingStatus = (status) => {
  if (status === "enrolled") return "not_started";
  return status || "not_started";
};

const mapStudentData = (s) => ({
  enrollmentId: s.enrollmentId || s.enrollment_id,
  studentId: s.studentId || s.student_id,
  studentCode: s.studentCode || s.student_code,
  studentName: s.studentName || s.student_name || "",
  className: s.className || s.class_name || "",
  annualGpa: s.annualGpa ?? s.annual_gpa ?? s.gpa ?? null,
  currentConduct: s.currentConduct || s.current_conduct || s.conduct || "",
  targetConduct: s.targetConduct || s.target_conduct || "Tốt",
  daysAttended: s.daysAttended ?? s.days_attended ?? s.attendance_days ?? s.days ?? 0,
  status: normalizeTrainingStatus(s.status || s.completion_status),
  note: s.note || s.notes || "",
});

export default function SummerTrainingPage() {
  const [searchParams] = useSearchParams();
  const urlClass = searchParams.get("class");
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const queryClient = useQueryClient();

  const [selectedGrade, setSelectedGrade] = useState("10");
  const [selectedClass, setSelectedClass] = useState(urlClass || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [detailModal, setDetailModal] = useState(null);
  const [attendanceModal, setAttendanceModal] = useState(null);
  const [completeModal, setCompleteModal] = useState(null);
  const [daysInput, setDaysInput] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (urlClass) {
      setSelectedClass(urlClass);
      const grade = urlClass.slice(0, 2);
      if (["10", "11", "12"].includes(grade)) setSelectedGrade(grade);
    }
  }, [urlClass]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClass]);

  const { data: classesData } = useQuery({
    queryKey: ["classes-for-summer-training", selectedSchoolYear, selectedGrade],
    queryFn: async () => {
      const res = await classesService.listClasses({
        schoolYearId: selectedSchoolYear,
        gradeLevelId: parseInt(selectedGrade),
      });
      return res;
    },
    staleTime: 5 * 60_000,
  });

  const classOptions = useMemo(() => {
    if (!classesData) return [];
    return classesData.map((c) => ({
      value: String(c.id || c.name || c.class_name || ""),
      label: c.name || c.class_name || "",
      grade: String((c.name || c.class_name || "").slice(0, 2)),
    }));
  }, [classesData]);

  const filteredClassOptions = useMemo(() => {
    if (selectedGrade === "all") return classOptions;
    return classOptions.filter((c) => c.grade === selectedGrade);
  }, [classOptions, selectedGrade]);

  const { data: trainingData, isLoading, refetch } = useQuery({
    queryKey: ["summer-training-summary", selectedClass, selectedSchoolYear, currentPage],
    queryFn: async () => {
      if (!selectedClass) return null;
      const schoolYearId = await resolveSchoolYearId(selectedSchoolYear);
      const res = await summerTrainingService.getSummerTrainingSummary(
        selectedClass, currentPage, ITEMS_PER_PAGE, schoolYearId
      );
      return res || null;
    },
    enabled: Boolean(selectedClass && selectedSchoolYear),
    staleTime: 60_000,
  });

  const startTrainingMutation = useMutation({
    mutationFn: async (enrollmentId) => {
      // Resolve string school year name to numeric ID
      let syId = selectedSchoolYear;
      if (typeof syId === "string" && isNaN(Number(syId))) {
        syId = await resolveSchoolYearId(syId);
      }
      await summerTrainingService.enrollConditionalStudents(syId);
    },
    onSuccess: () => {
      toast.success("Đã bắt đầu rèn luyện hè.");
      queryClient.invalidateQueries(["summer-training-summary"]);
    },
    onError: () => {
      toast.error("Không thể bắt đầu rèn luyện hè.");
    },
  });

  const recordAttendanceMutation = useMutation({
    mutationFn: async ({ enrollmentId, days }) => {
      await summerTrainingService.recordAttendance(enrollmentId, days);
    },
    onSuccess: () => {
      toast.success("Đã ghi nhận điểm danh.");
      setAttendanceModal(null);
      queryClient.invalidateQueries(["summer-training-summary"]);
    },
    onError: () => {
      toast.error("Không thể ghi nhận điểm danh.");
    },
  });

  const completeTrainingMutation = useMutation({
    mutationFn: async ({ enrollmentId, upgradeConduct, daysAttended }) => {
      await summerTrainingService.completeSummerTraining(enrollmentId, upgradeConduct, daysAttended);
    },
    onSuccess: () => {
      toast.success("Đã hoàn thành rèn luyện hè.");
      setCompleteModal(null);
      queryClient.invalidateQueries(["summer-training-summary"]);
    },
    onError: () => {
      toast.error("Không thể hoàn thành rèn luyện hè.");
    },
  });

  const failTrainingMutation = useMutation({
    mutationFn: async (enrollmentId) => {
      await summerTrainingService.completeSummerTraining(enrollmentId, false, 0);
    },
    onSuccess: () => {
      toast.success("Đã đánh dấu không hoàn thành.");
      queryClient.invalidateQueries(["summer-training-summary"]);
    },
    onError: () => {
      toast.error("Không thể cập nhật trạng thái.");
    },
  });

  const studentList = useMemo(() => {
    if (!trainingData?.students) return [];
    let list = trainingData.students.map((student) => {
      const mapped = mapStudentData(student);
      if (!mapped.className) {
        mapped.className = trainingData.class_name || trainingData.className || "";
      }
      return mapped;
    });
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter((s) =>
        s.studentName.toLowerCase().includes(term) ||
        (s.studentCode || "").toLowerCase().includes(term)
      );
    }
    return list;
  }, [trainingData, searchTerm]);

  const totalPages = useMemo(() => trainingData?.totalPages ?? 1, [trainingData]);
  const effectivePage = Math.min(currentPage, totalPages);
  const paginatedStudents = studentList;

  const goPrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const goNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));

  const stats = useMemo(() => {
    const total = trainingData?.total ?? 0;
    if (!total) return { total: 0, completed: 0, inProgress: 0, notStarted: 0, rate: 0 };
    const backendStats = trainingData?.stats || {};
    const completed = backendStats.completed ?? studentList.filter((s) => s.status === "completed").length;
    const inProgress = backendStats.in_progress ?? studentList.filter((s) => s.status === "in_progress").length;
    const notStarted = backendStats.enrolled ?? studentList.filter((s) => s.status === "not_started").length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, notStarted, rate };
  }, [studentList, trainingData]);

  const handleStartTraining = (student) => {
    startTrainingMutation.mutate(student.enrollmentId);
  };

  const handleRecordAttendance = (student) => {
    setAttendanceModal(student);
    setDaysInput(student.daysAttended || 0);
  };

  const handleConfirmAttendance = () => {
    if (attendanceModal) {
      recordAttendanceMutation.mutate({
        enrollmentId: attendanceModal.enrollmentId,
        days: Number(daysInput),
      });
    }
  };

  const handleComplete = (student) => {
    setCompleteModal(student);
  };

  const handleConfirmComplete = (upgradeConduct) => {
    if (completeModal) {
      completeTrainingMutation.mutate({
        enrollmentId: completeModal.enrollmentId,
        upgradeConduct,
        daysAttended: completeModal.daysAttended || daysInput,
      });
    }
  };

  const handleFail = (student) => {
    if (confirm(`Xác nhận đánh dấu "${student.studentName}" không hoàn thành rèn luyện hè?`)) {
      failTrainingMutation.mutate(student.enrollmentId);
    }
  };

  const handleEnrollAndCompleteAll = async () => {
    try {
      let syId = selectedSchoolYear;
      if (typeof syId === "string" && isNaN(Number(syId))) {
        syId = await resolveSchoolYearId(syId);
      }
      // Step 1: Ghi danh tất cả HS có điều kiện
      await summerTrainingService.enrollConditionalStudents(syId);
      queryClient.invalidateQueries(["summer-training-summary"]);
      // Step 2: Hoàn thành tất cả HS đang ở trạng thái enrolled/in_progress trong danh sách hiện tại
      const toComplete = studentList.filter(
        (s) => s.status === "enrolled" || s.status === "in_progress" || s.status === "not_started"
      );
      for (const student of toComplete) {
        await summerTrainingService.completeSummerTraining(student.enrollmentId, true, 21);
      }
      queryClient.invalidateQueries(["summer-training-summary"]);
      toast.success(`Đã ghi danh và hoàn thành rèn luyện hè cho ${toComplete.length} học sinh.`);
    } catch {
      toast.error("Không thể hoàn thành rèn luyện hè.");
    }
  };

  return (
    <div className="summer-training-page">
      <PageHeader
        title="Rèn Luyện Hè"
        subtitle="Quản lý danh sách và theo dõi rèn luyện hè cho học sinh"
        actions={
          <SchoolYearTermSelector
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            showTerm={false}
          />
        }
      />

      {/* Stats Grid */}
      <div className="summer-stats-grid">
        <div className="summer-stat-card total">
          <FiSun className="stat-icon" />
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Tổng số HS</span>
          </div>
        </div>
        <div className="summer-stat-card completed">
          <FiCheckCircle className="stat-icon" />
          <div className="stat-content">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Đã hoàn thành</span>
          </div>
        </div>
        <div className="summer-stat-card in-progress">
          <FiPlay className="stat-icon" />
          <div className="stat-content">
            <span className="stat-value">{stats.inProgress}</span>
            <span className="stat-label">Đang rèn luyện</span>
          </div>
        </div>
        <div className="summer-stat-card rate">
          <FiAward className="stat-icon" />
          <div className="stat-content">
            <span className="stat-value">{stats.rate}%</span>
            <span className="stat-label">Tỷ lệ hoàn thành</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="summer-toolbar">
        <div className="summer-filters">
          <div className="filter-group">
            <label>Khối</label>
            <Select
              variant="custom"
              value={selectedGrade}
              onChange={(e) => {
                const nextGrade = e.target.value;
                setSelectedGrade(nextGrade);
                const firstClass = classOptions.find((c) => !nextGrade || nextGrade === "all" || c.grade === nextGrade);
                if (firstClass) setSelectedClass(firstClass.value);
              }}
              options={[
                { value: "10", label: "Khối 10" },
                { value: "11", label: "Khối 11" },
                { value: "12", label: "Khối 12" },
              ]}
            />
          </div>
          <div className="filter-group">
            <label>Lớp</label>
            <Select
              variant="custom"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              options={filteredClassOptions.map((c) => ({ value: c.value, label: c.label }))}
            />
          </div>
          <div className="filter-group search">
            <label>Tìm học sinh</label>
            <input
              type="text"
              placeholder="Tên hoặc mã HS..."
              value={searchTerm}
                onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <div className="summer-actions">
          <button
            className="btn-enroll-all"
            onClick={handleEnrollAndCompleteAll}
            disabled={!selectedClass || startTrainingMutation.isPending}
          >
            <FiSun />
            Ghi danh & Hoàn thành tất cả
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="summer-table-container">
        {isLoading && <div className="summer-loading">Đang tải dữ liệu...</div>}
        {!isLoading && !trainingData && (
          <EmptyState title="Chưa chọn lớp" description="Vui lòng chọn lớp để xem danh sách rèn luyện hè." compact />
        )}
        {!isLoading && trainingData && studentList.length === 0 && (
          <EmptyState title="Không có học sinh cần rèn luyện hè" description="Tất cả học sinh trong lớp đều đủ điều kiện lên lớp." compact />
        )}
        {!isLoading && studentList.length > 0 && (
          <table className="summer-table">
            <thead>
              <tr>
                <th className="col-name">Họ tên học sinh</th>
                <th className="col-class">Lớp</th>
                <th className="col-gpa">Điểm TB cả năm</th>
                <th className="col-conduct">Hạnh kiểm</th>
                <th className="col-days">Số ngày tham gia</th>
                <th className="col-status">Trạng thái</th>
                <th className="col-actions">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map((student) => {
                const statusInfo = TRAINING_STATUS[student.status] || TRAINING_STATUS.not_started;
                const StatusIcon = statusInfo.icon;

                return (
                  <tr key={student.enrollmentId}>
                    <td className="col-name">
                      <div className="student-info">
                        <div className="student-avatar">{(student.studentName || "?").charAt(0)}</div>
                        <div>
                          <strong>{student.studentName}</strong>
                          <br />
                          <small>{student.studentCode}</small>
                        </div>
                      </div>
                    </td>
                    <td className="col-class">{student.className}</td>
                    <td className="col-gpa">
                      <span className={`gpa-value ${student.annualGpa !== null ? (student.annualGpa >= 5 ? "pass" : "fail") : ""}`}>
                        {student.annualGpa !== null ? student.annualGpa.toFixed(2) : "—"}
                      </span>
                    </td>
                    <td className="col-conduct">
                      <div className="conduct-upgrade">
                        <span className="conduct-current">{student.currentConduct || "—"}</span>
                        <span className="conduct-arrow">→</span>
                        <span className="conduct-target">{student.targetConduct}</span>
                      </div>
                    </td>
                    <td className="col-days">
                      <span className={`days-value ${student.daysAttended > 0 ? "active" : ""}`}>
                        {student.daysAttended} / 21 ngày
                      </span>
                    </td>
                    <td className="col-status">
                      <span className={`status-badge ${statusInfo.bg} ${statusInfo.text}`}>
                        <StatusIcon style={{ width: 14, height: 14 }} />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="col-actions">
                      <div className="action-buttons">
                        {student.status === "not_started" && (
                          <button
                            className="btn-start"
                            onClick={() => handleStartTraining(student)}
                            title="Bắt đầu rèn luyện"
                          >
                            <FiPlay />
                          </button>
                        )}
                        {(student.status === "in_progress" || student.status === "completed") && (
                          <button
                            className="btn-attendance"
                            onClick={() => handleRecordAttendance(student)}
                            title="Ghi nhận điểm danh"
                          >
                            <FiClock />
                          </button>
                        )}
                        {student.status === "in_progress" && (
                          <>
                            <button
                              className="btn-complete"
                              onClick={() => handleComplete(student)}
                              title="Hoàn thành"
                            >
                              <FiCheck />
                            </button>
                            <button
                              className="btn-fail"
                              onClick={() => handleFail(student)}
                              title="Không hoàn thành"
                            >
                              <FiX />
                            </button>
                          </>
                        )}
                        <button
                          className="btn-detail"
                          onClick={() => setDetailModal(student)}
                          title="Xem chi tiết"
                        >
                          <FiEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="summer-pagination">
          <button className="page-btn" onClick={goPrevPage} disabled={effectivePage === 1}>
            <FiChevronLeft />
          </button>
          <div className="page-indicator">
            <span>{effectivePage}</span>
            <small>/ {totalPages}</small>
          </div>
          <button className="page-btn" onClick={goNextPage} disabled={effectivePage === totalPages}>
            <FiChevronRight />
          </button>
        </div>
      )}

      {/* Attendance Modal */}
      {attendanceModal && (
        <div className="summer-modal-overlay" onClick={() => setAttendanceModal(null)}>
          <div className="summer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Ghi nhận điểm danh</h3>
              <button className="btn-close" onClick={() => setAttendanceModal(null)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-student-name">{attendanceModal.studentName}</p>
              <div className="form-group">
                <label>Số ngày tham gia rèn luyện hè</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={daysInput}
                  onChange={(e) => setDaysInput(Number(e.target.value))}
                />
                <small>Yêu cầu tối thiểu: 21 ngày</small>
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setAttendanceModal(null)}>
                  Hủy
                </button>
                <button className="btn-confirm" onClick={handleConfirmAttendance}>
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {completeModal && (
        <div className="summer-modal-overlay" onClick={() => setCompleteModal(null)}>
          <div className="summer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Hoàn thành rèn luyện hè</h3>
              <button className="btn-close" onClick={() => setCompleteModal(null)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-student-name">{completeModal.studentName}</p>
              <p className="modal-info">Số ngày tham gia: <strong>{completeModal.daysAttended} / 21 ngày</strong></p>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => setDaysInput(e.target.checked ? 1 : 0)}
                    defaultChecked
                  />
                  <span>Nâng hạnh kiểm lên <strong>Tốt</strong></span>
                </label>
                <small>Hạnh kiểm hiện tại: {completeModal.currentConduct}</small>
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setCompleteModal(null)}>
                  Hủy
                </button>
                <button className="btn-confirm success" onClick={() => handleConfirmComplete(daysInput > 0)}>
                  <FiCheckCircle /> Xác nhận hoàn thành
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="summer-modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="summer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết rèn luyện hè</h3>
              <button className="btn-close" onClick={() => setDetailModal(null)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="student-detail-header">
                <div className="student-avatar large">{(detailModal.studentName || "?").charAt(0)}</div>
                <div>
                  <h4>{detailModal.studentName}</h4>
                  <p>Mã HS: {detailModal.studentCode}</p>
                  <p>Lớp: {detailModal.className}</p>
                </div>
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Điểm TB cả năm</label>
                  <span>{detailModal.annualGpa !== null ? detailModal.annualGpa.toFixed(2) : "—"}</span>
                </div>
                <div className="detail-item">
                  <label>Hạnh kiểm hiện tại</label>
                  <span>{detailModal.currentConduct || "—"}</span>
                </div>
                <div className="detail-item">
                  <label>Hạnh kiểm mục tiêu</label>
                  <span className="text-emerald-600">{detailModal.targetConduct}</span>
                </div>
                <div className="detail-item">
                  <label>Số ngày tham gia</label>
                  <span>{detailModal.daysAttended} / 21 ngày</span>
                </div>
                <div className="detail-item full">
                  <label>Trạng thái</label>
                  <span className={`status-badge ${TRAINING_STATUS[detailModal.status]?.bg} ${TRAINING_STATUS[detailModal.status]?.text}`}>
                    {TRAINING_STATUS[detailModal.status]?.label || "Chưa xác định"}
                  </span>
                </div>
                {detailModal.note && (
                  <div className="detail-item full">
                    <label>Ghi chú</label>
                    <span>{detailModal.note}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
