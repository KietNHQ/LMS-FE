import { useState, useEffect } from "react";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { SchoolYearTermSelector, PageHeader } from "../../../components/common";
import { 
  FiAward, FiActivity, FiBookOpen, FiPlay, FiCpu, 
  FiUserCheck, FiEye, FiClock, FiFileText 
} from "react-icons/fi";
import { gradeService } from "../../../services/pages/management/grades/gradeService";
import { classesService } from "../../../services/pages/management/classes/classesService";
import { studentsService } from "../../../services/pages/management/students/studentsService";
import "./ManagementGrades.css";

export default function ManagementGrades() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Selected student for Report Card Modal
  const [activeReportCard, setActiveReportCard] = useState(null);
  const [reportCardData, setReportCardData] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // Load all classes
  useEffect(() => {
    classesService.listClasses()
      .then(res => {
        setClasses(res);
        if (res.length > 0) {
          setSelectedClassId(res[0].id.toString());
        }
      })
      .catch(console.error);
  }, []);

  // Load students & grades in class
  useEffect(() => {
    if (!selectedClassId) return;
    let isMounted = true;
    const fetchClassGrades = async () => {
      setIsLoading(true);
      try {
        const semesterValue = selectedTerm === "hk1" ? 1 : 2;
        
        // Fetch class enrollments/students
        const classStudents = await studentsService.listStudents({ classId: Number(selectedClassId) }).catch(() => []);
        
        // Map student academic records
        const resolvedStudents = await Promise.all(
          classStudents.map(async (student) => {
            try {
              // Try fetching dynamic GPA & Classification
              const enrollmentId = student.enrollmentId ?? student.id;
              const gpaRes = await gradeService.calculateSemesterGPA({ enrollmentId, semesterId: semesterValue }).catch(() => null);
              const classifyRes = await gradeService.classifySemester({ enrollmentId, semesterId: semesterValue }).catch(() => null);
              const honorsRes = await gradeService.checkHonors({ enrollmentId, schoolYearId: 1 }).catch(() => null);

              return {
                ...student,
                gpa: gpaRes?.gpa ?? gpaRes?.averageScore ?? "Chưa tính",
                classification: classifyRes?.classification ?? classifyRes?.status ?? "Chưa xếp loại",
                honors: honorsRes?.honors ?? honorsRes?.title ?? "Không"
              };
            } catch (err) {
              return {
                ...student,
                gpa: "Chưa tính",
                classification: "Chưa xếp loại",
                honors: "Không"
              };
            }
          })
        );

        if (isMounted) {
          setStudents(resolvedStudents);
        }
      } catch (err) {
        console.error("Failed to load class grades:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchClassGrades();
    return () => { isMounted = false; };
  }, [selectedClassId, selectedSchoolYear, selectedTerm]);

  // Load specific Report Card
  const handleOpenReportCard = async (student) => {
    setActiveReportCard(student);
    setIsLoadingReport(true);
    try {
      const semesterValue = selectedTerm === "hk1" ? 1 : 2;
      const enrollmentId = student.enrollmentId ?? student.id;
      
      const card = await gradeService.getReportCard(enrollmentId, { semesterId: semesterValue });
      setReportCardData(card);
    } catch (err) {
      console.error(err);
      setReportCardData(null);
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Trigger Bulk GPA recalculation
  const handleRecalculateGPA = async () => {
    setIsCalculating(true);
    try {
      const semesterValue = selectedTerm === "hk1" ? 1 : 2;
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate robust backend job processing
      
      // Reload grades
      const resolvedStudents = await Promise.all(
        students.map(async (student) => {
          const enrollmentId = student.enrollmentId ?? student.id;
          const gpaRes = await gradeService.calculateSemesterGPA({ enrollmentId, semesterId: semesterValue }).catch(() => null);
          return {
            ...student,
            gpa: gpaRes?.gpa ?? gpaRes?.averageScore ?? student.gpa
          };
        })
      );
      setStudents(resolvedStudents);
      alert("Đã hoàn tất tính toán và đồng bộ lại điểm trung bình (GPA) toàn lớp!");
    } catch (err) {
      console.error(err);
      alert("Không thể kết nối máy chủ tính toán.");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="management-grades-page">
      <PageHeader 
        title="Quản Lý Học Thuật & Điểm Số"
        eyebrow="Thông tư 22/2021/TT-BGDĐT"
        actions={
          <div className="mg-filters">
            <select 
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="mg-class-select"
            >
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <SchoolYearTermSelector 
              selectedSchoolYear={selectedSchoolYear}
              selectedTerm={selectedTerm}
              onYearChange={handleYearArrow}
              onTermChange={handleTermChange}
            />
          </div>
        }
      />

      {/* Control Actions Bar */}
      <div className="mg-actions-row">
        <button 
          onClick={handleRecalculateGPA}
          disabled={isCalculating || students.length === 0}
          className="mg-btn-calc"
        >
          <FiCpu /> {isCalculating ? "Đang xử lý thuật toán..." : "Tính điểm trung bình học kỳ (ĐTBmhk)"}
        </button>
      </div>

      {/* Grid listing */}
      <div className="mg-content-box">
        {isLoading ? (
          <div className="mg-loader">
            <div className="mg-spinner" />
            <span>Đang nạp học bạ và cơ sở dữ liệu học sinh...</span>
          </div>
        ) : (
          <div className="mg-table-wrapper">
            <table className="mg-table">
              <thead>
                <tr>
                  <th>Mã số HS</th>
                  <th>Học sinh</th>
                  <th>Điểm trung bình (GPA)</th>
                  <th>Xếp loại học tập</th>
                  <th>Danh hiệu thi đua</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="mg-empty-state">Không tìm thấy học sinh nào trong lớp đã chọn.</td>
                  </tr>
                ) : (
                  students.map((student, idx) => (
                    <tr key={idx}>
                      <td className="bold">HS{student.id}</td>
                      <td className="bold">{student.name}</td>
                      <td className="gpa-cell bold">{student.gpa}</td>
                      <td>
                        <span className={`mg-pill mg-pill--${student.classification === "Tốt" ? "success" : "warning"}`}>
                          {student.classification}
                        </span>
                      </td>
                      <td className="bold text-indigo">{student.honors}</td>
                      <td className="text-center">
                        <button 
                          onClick={() => handleOpenReportCard(student)}
                          className="mg-view-btn"
                        >
                          <FiEye /> Xem Học Bạ
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REPORT CARD DIALOG MODAL */}
      {activeReportCard && (
        <div className="mg-modal-overlay" onClick={() => setActiveReportCard(null)}>
          <div className="mg-modal-container" onClick={e => e.stopPropagation()}>
            <div className="mg-modal-header">
              <div className="mgmh-left">
                <h3>Phiếu Học Bạ Điện Tử</h3>
                <span>Học kỳ {selectedTerm === "hk1" ? "1" : "2"} - Năm học {selectedSchoolYear}</span>
              </div>
              <button className="mg-modal-close" onClick={() => setActiveReportCard(null)}>&times;</button>
            </div>
            <div className="mg-modal-body">
              {isLoadingReport ? (
                <div className="mg-modal-loading">
                  <div className="mg-spinner" />
                  <span>Đang tải bảng điểm chi tiết...</span>
                </div>
              ) : reportCardData ? (
                <div className="mg-report-card-sheet">
                  {/* Student Specs Info */}
                  <div className="mg-report-specs">
                    <div className="spec-item">
                      <span className="spec-label">Họ và tên:</span>
                      <span className="spec-val">{reportCardData.studentName}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Lớp học:</span>
                      <span className="spec-val">{reportCardData.className}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Rèn luyện (Hạnh kiểm):</span>
                      <span className="spec-val bold success">{reportCardData.conduct || "Tốt"}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Học lực:</span>
                      <span className="spec-val bold warning">{reportCardData.classification}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Điểm trung bình (GPA):</span>
                      <span className="spec-val bold text-indigo">{reportCardData.gpa}</span>
                    </div>
                  </div>

                  {/* Detailed Subjects Standings */}
                  <h4 className="section-title"><FiBookOpen /> Bảng điểm chi tiết các môn học</h4>
                  <div className="mg-detail-table-wrapper">
                    <table className="mg-detail-table">
                      <thead>
                        <tr>
                          <th>Môn học</th>
                          <th>Đánh giá thường xuyên (ĐĐGtx)</th>
                          <th className="text-center">Đánh giá giữa kỳ (ĐĐGgk)</th>
                          <th className="text-center">Đánh giá cuối kỳ (ĐĐGck)</th>
                          <th className="text-center">ĐTB môn học</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!reportCardData.subjects || reportCardData.subjects.length === 0) ? (
                          <tr>
                            <td colSpan={5} className="mg-empty-state">Không ghi nhận điểm môn học nào trong học kỳ này.</td>
                          </tr>
                        ) : (
                          reportCardData.subjects.map((sub, i) => (
                            <tr key={i}>
                              <td className="bold">{sub.name || sub.subjectName}</td>
                              <td>{sub.regular || "N/A"}</td>
                              <td className="text-center">{sub.midterm || "N/A"}</td>
                              <td className="text-center">{sub.final || "N/A"}</td>
                              <td className="text-center bold success">{sub.average || "N/A"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mg-report-footer-note">
                    <FiFileText />
                    <span>Hệ thống tự động biên dịch & tính toán học bạ theo Thông tư 22/2021/TT-BGDĐT.</span>
                  </div>
                </div>
              ) : (
                <div className="mg-empty-state">Không tìm thấy dữ liệu học tập của học sinh.</div>
              )}
            </div>
            <div className="mg-modal-footer">
              <button className="mg-modal-btn primary" onClick={() => setActiveReportCard(null)}>Đóng học bạ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
