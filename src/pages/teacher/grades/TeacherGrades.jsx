import { useMemo, useState, useEffect } from "react";
import Modal from "../../../components/ui/Modal/Modal";
import { Select } from "../../../components/ui";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import teacherService from "../../../services/pages/teacher/teacherService";
import GradeListSection from "./components/gradeListSection/GradeListSection";
import { FiPlus, FiSave, FiX, FiTrash2 } from "react-icons/fi";
import GradeSummarySection, { GradeSummaryHeader } from "./components/gradeSummarySection/GradeSummarySection";
import { toast } from "react-toastify";
import "./TeacherGrades.css";

const SEMESTERS = {
  hk1: { label: "Học kỳ 1" },
  hk2: { label: "Học kỳ 2" },
};

function round1(value) {
  if (value === null || value === undefined || isNaN(value)) return 0;
  return Math.round(value * 10) / 10;
}

function getRank(average) {
  if (average >= 8.5) return "excellent";
  if (average >= 7.0) return "good";
  if (average >= 5.5) return "fair";
  if (average >= 4.0) return "average";
  return "weak";
}

export default function TeacherGrades() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  
  // State
  const [grades] = useState(["10", "11", "12"]);
  const [selectedGrade, setSelectedGrade] = useState("10");
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Dialog State
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [atRiskDialogOpen, setAtRiskDialogOpen] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);
  const [editDraft, setEditDraft] = useState({
    oralScores: [""],
    test15Scores: [""],
    midterm: "",
    final: "",
    note: ""
  });

  // Fetch Classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await teacherService.getTeacherClasses({ mock: true });
        if (response.success) {
          const fetchedClasses = response.data || [];
          setClasses(fetchedClasses);
          if (fetchedClasses.length > 0 && !selectedClassId) {
            setSelectedClassId(fetchedClasses[0].id);
          }
        }
      } catch (err) {
        console.error("Fetch classes error:", err);
      }
    };
    fetchClasses();
  }, []);

  // Fetch Subjects when class changes
  useEffect(() => {
    if (!selectedClassId) return;
    const fetchSubjects = async () => {
      try {
        const response = await teacherService.getClassSubjects({ 
          pathParams: { id: selectedClassId },
          mock: true 
        });
        if (response.success) {
          const fetchedSubjects = response.data || [];
          setSubjects(fetchedSubjects);
          if (fetchedSubjects.length > 0) {
            setSelectedSubjectId(fetchedSubjects[0].id);
          }
        }
      } catch (err) {
        console.error("Fetch subjects error:", err);
      }
    };
    fetchSubjects();
  }, [selectedClassId]);

  // Filtered Classes based on Grade
  const filteredClasses = useMemo(() => {
    return classes.filter(c => c.name.startsWith(selectedGrade));
  }, [classes, selectedGrade]);

  // Update selected class if it's no longer in filtered list
  useEffect(() => {
    if (filteredClasses.length > 0) {
      if (!selectedClassId || !filteredClasses.find(c => c.id === selectedClassId)) {
        setSelectedClassId(filteredClasses[0].id);
      }
    } else {
      setSelectedClassId("");
    }
  }, [filteredClasses]);

  // Fetch Grades
  const fetchGrades = async () => {
    if (!selectedClassId || !selectedSubjectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await teacherService.getGradesByClass({
        pathParams: { classId: selectedClassId },
        params: { 
          subjectId: selectedSubjectId,
          schoolYear: selectedSchoolYear,
          term: selectedTerm
        },
        mock: true
      });

      if (response.success) {
        // Transform API data to UI records if needed
        // For now, assume API returns the needed structure or use mock if empty
        const data = response.data || [];
        
        // If API returns empty (common in mock), generate some realistic mock data based on the class
        if (data.length === 0) {
          const mockRecords = generateMockRecords(selectedClassId, selectedSubjectId, selectedTerm);
          setRecords(mockRecords);
        } else {
          setRecords(data);
        }
      } else {
        setError("Không thể tải danh sách điểm.");
      }
    } catch (err) {
      console.error("Fetch grades error:", err);
      setError("Đã xảy ra lỗi khi tải dữ liệu điểm số.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [selectedClassId, selectedSubjectId, selectedSchoolYear, selectedTerm]);

  // Derived Summary Stats
  const summaryStats = useMemo(() => {
    if (!records.length) return {
      average: 0, passRate: 0, excellentRate: 0, atRiskCount: 0, atRiskStudents: []
    };

    const averages = records.map(r => r.average).filter(v => v !== null);
    const totalAvg = averages.length ? averages.reduce((a, b) => a + b, 0) / averages.length : 0;
    const passCount = records.filter(r => r.average >= 5).length;
    const excellentCount = records.filter(r => r.average >= 8.5).length;
    const atRiskStudents = records.filter(r => r.average < 5);

    return {
      average: round1(totalAvg),
      passRate: Math.round((passCount / records.length) * 100),
      excellentRate: Math.round((excellentCount / records.length) * 100),
      atRiskCount: atRiskStudents.length,
      atRiskStudents
    };
  }, [records]);

  // Handlers
  const handleClassChange = (e) => setSelectedClassId(e.target.value);
  
  const openEditDialog = (record) => {
    setEditStudentId(record.id);
    
    // Ensure at least 2 slots for Oral and 15min
    let oral = record.oralScores || ["", ""];
    while (oral.length < 2) oral.push("");
    
    let test15 = record.test15Scores || ["", ""];
    while (test15.length < 2) test15.push("");

    setEditDraft({
      oralScores: oral,
      test15Scores: test15,
      midterm: record.midterm || "",
      final: record.final || "",
      note: record.note || ""
    });
    setEditDialogOpen(true);
  };

  const handleSaveGrade = async () => {
    try {
      // In real scenario, call teacherService.updateGrade
      // For now, update local state
      setRecords(prev => prev.map(r => {
        if (r.id === editStudentId) {
          const updated = {
            ...r,
            ...editDraft,
            average: calculateRecordAverage(editDraft)
          };
          updated.rank = getRank(updated.average);
          updated.status = updated.average >= 5 ? "Đạt" : "Chưa đạt";
          return updated;
        }
        return r;
      }));
      
      toast.success("Đã cập nhật điểm thành công!");
      setEditDialogOpen(false);
    } catch (err) {
      toast.error("Lỗi khi lưu điểm.");
    }
  };

  const calculateRecordAverage = (draft) => {
    const oral = (draft.oralScores || []).filter(v => v !== "").map(Number);
    const test15 = (draft.test15Scores || []).filter(v => v !== "").map(Number);
    const midterm = draft.midterm !== "" ? Number(draft.midterm) : null;
    const final = draft.final !== "" ? Number(draft.final) : null;

    const components = [...oral, ...test15];
    if (midterm !== null) components.push(midterm, midterm); // Weight 2
    if (final !== null) components.push(final, final, final); // Weight 3
    
    if (components.length === 0) return 0;
    return round1(components.reduce((a, b) => a + b, 0) / components.length);
  };

  const currentClass = classes.find(c => c.id === selectedClassId) || {};
  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || {};
  const semesterLabel = SEMESTERS[selectedTerm]?.label || selectedTerm;

  if (error) {
    return (
      <div className="teacher-grades-error">
        <p>{error}</p>
        <button onClick={fetchGrades}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="teacher-grades-page">
      <PageHeader
        title="Quản lý điểm học sinh"
        eyebrow={`Lớp: ${currentClass.name || "---"} | Môn: ${currentSubject.name || "---"}`}
        actions={
          <SchoolYearTermSelector
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            onTermChange={handleTermChange}
          />
        }
      />

      <div className="teacher-grades-top-panel">
        <div className="teacher-grades-toolbar">
          <div className="teacher-grades-toolbar__group">
            <Select
              className="teacher-grades-select"
              variant="custom"
              label="Khối"
              value={selectedGrade}
              options={grades.map(g => ({ value: g, label: `Khối ${g}` }))}
              onChange={(e) => setSelectedGrade(e.target.value)}
            />
            <Select
              className="teacher-grades-select"
              variant="custom"
              label="Chọn lớp"
              value={selectedClassId}
              options={filteredClasses.map(c => ({ value: c.id, label: c.name }))}
              onChange={handleClassChange}
              searchable
            />
          </div>

          <div className="teacher-grades-toolbar__meta">
            <span className="grade-entry-badge teacher-grades-teacher-badge">
              GVCN: {currentClass.teacher || "Chưa phân công"}
            </span>
          </div>
        </div>

        <div className="teacher-grades-summary-header">
          <GradeSummaryHeader subjectLabel={currentSubject.name} />
        </div>

        <div className="teacher-grades-summary-row">
          <GradeSummarySection
            stats={summaryStats}
            onOpenAtRisk={() => setAtRiskDialogOpen(true)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="teacher-grades-loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu điểm số...</p>
        </div>
      ) : (
        <div className="teacher-grades-grid">
          <GradeListSection
            records={records}
            onOpenEditDialog={openEditDialog}
            subjectLabel={currentSubject.name}
            semesterLabel={semesterLabel}
          />
        </div>
      )}

      {/* Edit Grade Modal */}
      <Modal
        open={editDialogOpen}
        title={editStudentId ? `Chỉnh sửa điểm - ${records.find(r => r.id === editStudentId)?.name}` : "Chỉnh sửa điểm"}
        onClose={() => setEditDialogOpen(false)}
        className="teacher-grade-edit-modal"
      >
        <div className="teacher-grade-edit-form">
           <div className="teacher-grade-edit-meta">
              <span>{currentClass.name}</span>
              <span>{currentSubject.name}</span>
              <span>{semesterLabel}</span>
           </div>

           <section className="grade-entry-score-block">
              <div className="grade-entry-score-block__head">
                <span>Điểm miệng</span>
                <button 
                  className="grade-entry-score-add-btn"
                  onClick={() => {
                    setEditDraft(prev => ({
                      ...prev,
                      oralScores: [...prev.oralScores, ""]
                    }));
                  }}
                >
                  <FiPlus />
                </button>
              </div>
              <div className="grade-entry-score-grid">
                {editDraft.oralScores.map((val, idx) => (
                  <div key={`oral-${idx}`} className="grade-entry-field">
                    <div className="grade-entry-field__label">
                      <span>Miệng {idx + 1}</span>
                      {editDraft.oralScores.length > 2 && (
                        <button 
                          className="grade-entry-delete-btn"
                          onClick={() => {
                            setEditDraft(prev => ({
                              ...prev,
                              oralScores: prev.oralScores.filter((_, i) => i !== idx)
                            }));
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                    <input 
                      type="number" step="0.1" min="0" max="10" value={val} 
                      onChange={e => {
                        const next = [...editDraft.oralScores];
                        next[idx] = e.target.value;
                        setEditDraft(prev => ({ ...prev, oralScores: next }));
                      }}
                    />
                  </div>
                ))}
              </div>
           </section>

           <section className="grade-entry-score-block">
              <div className="grade-entry-score-block__head">
                <span>Điểm 15 phút</span>
                <button 
                  className="grade-entry-score-add-btn"
                  onClick={() => {
                    setEditDraft(prev => ({
                      ...prev,
                      test15Scores: [...prev.test15Scores, ""]
                    }));
                  }}
                >
                  <FiPlus />
                </button>
              </div>
              <div className="grade-entry-score-grid">
                {editDraft.test15Scores.map((val, idx) => (
                  <div key={`test-${idx}`} className="grade-entry-field">
                    <div className="grade-entry-field__label">
                      <span>15 phút {idx + 1}</span>
                      {editDraft.test15Scores.length > 2 && (
                        <button 
                          className="grade-entry-delete-btn"
                          onClick={() => {
                            setEditDraft(prev => ({
                              ...prev,
                              test15Scores: prev.test15Scores.filter((_, i) => i !== idx)
                            }));
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                    <input 
                      type="number" step="0.1" min="0" max="10" value={val} 
                      onChange={e => {
                        const next = [...editDraft.test15Scores];
                        next[idx] = e.target.value;
                        setEditDraft(prev => ({ ...prev, test15Scores: next }));
                      }}
                    />
                  </div>
                ))}
              </div>
           </section>

              <div className="teacher-grade-edit-grid">
                <div className="teacher-grade-edit-note">
                  <span>Giữa kỳ</span>
                  <input 
                    type="number" step="0.1" min="0" max="10" value={editDraft.midterm} 
                    onChange={e => setEditDraft(prev => ({ ...prev, midterm: e.target.value }))}
                  />
                </div>
                <div className="teacher-grade-edit-note">
                  <span>Cuối kỳ</span>
                  <input 
                    type="number" step="0.1" min="0" max="10" value={editDraft.final} 
                    onChange={e => setEditDraft(prev => ({ ...prev, final: e.target.value }))}
                  />
                </div>
              </div>

           <div className="teacher-grade-edit-note">
              <span>Ghi chú</span>
              <textarea 
                rows="3" value={editDraft.note} 
                onChange={e => setEditDraft(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Nhận xét của giáo viên..."
              />
           </div>

           <div className="teacher-grade-edit-actions">
              <button className="teacher-grade-edit-btn is-ghost" onClick={() => setEditDialogOpen(false)}>
                <FiX /> Hủy
              </button>
              <button className="teacher-grade-edit-btn is-primary" onClick={handleSaveGrade}>
                <FiSave /> Lưu thay đổi
              </button>
           </div>
        </div>
      </Modal>

      {/* At Risk List Modal */}
      <Modal
        open={atRiskDialogOpen}
        title={`Học sinh cảnh báo (${summaryStats.atRiskCount})`}
        onClose={() => setAtRiskDialogOpen(false)}
        className="teacher-grade-risk-modal"
      >
        <div className="teacher-grade-risk-list">
          {summaryStats.atRiskStudents.map(student => (
            <div 
              key={student.id} className="teacher-grade-risk-item"
              onClick={() => { setAtRiskDialogOpen(false); openEditDialog(student); }}
            >
              <div>
                <strong>{student.name}</strong>
                <span>{student.code}</span>
              </div>
              <small>TB: {student.average}</small>
            </div>
          ))}
          {summaryStats.atRiskCount === 0 && <p style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>Không có học sinh nào bị cảnh báo.</p>}
        </div>
      </Modal>
    </div>
  );
}

// Mock Data Generator for Development
function generateMockRecords(classId, subjectId, term) {
  const names = [
    "Nguyễn Minh Kiet", "Trần Gia Hân", "Lê Hoàng Nam", "Phạm Thu Uyên", "Võ Anh Khoa",
    "Đặng Gia Minh", "Phan Ngọc Hân", "Bùi Anh Thư", "Lý Thành Công", "Trương Khánh An"
  ];
  
  return names.map((name, i) => {
    const oral = [round1(8 + Math.random() * 2), round1(7 + Math.random() * 3)];
    const test15 = [round1(7 + Math.random() * 3)];
    const midterm = round1(6 + Math.random() * 4);
    const final = round1(5 + Math.random() * 5);
    
    // Weighted average: (oral + 15p + midterm*2 + final*3) / (n_oral + n_15p + 2 + 3)
    const avg = round1((oral.reduce((a, b) => a+b, 0) + test15.reduce((a, b) => a+b, 0) + midterm*2 + final*3) / (oral.length + test15.length + 5));
    
    return {
      id: i + 1,
      name,
      code: `${classId}-${(i+1).toString().padStart(2, '0')}`,
      oralScores: oral.map(String),
      test15Scores: test15.map(String),
      midterm: String(midterm),
      final: String(final),
      average: avg,
      rank: getRank(avg),
      status: avg >= 5 ? "Đạt" : "Chưa đạt",
      note: ""
    };
  });
}
