import React, { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import teacherService from "../../../../../services/pages/teacher/teacherService";
import studentService from "../../../../../services/pages/student/studentService";
import { useSchoolYearContext } from "../../../../../context/SchoolYearContext";
import { resolveSemesterId } from "../../../../../services/shared/schoolYearLookup";
import "./ClassStudentsSection.css";

// Utilities
import {
  getCurrentLessonInfo,
  toDateKey,
  shiftDateKey,
  parseDateKey,
  REVIEW_CONTENT_MAPPING,
  normalizeStoredReview,
} from "../../utils/teachingClassesUtils";

// Sub-components
import LessonTimeline from "./subcomponents/LessonTimeline";
import StudentReviewModal from "./subcomponents/StudentReviewModal";
import LessonReviewModal from "./subcomponents/LessonReviewModal";
import StudentsTable from "./subcomponents/StudentsTable";
import Pagination from "./subcomponents/Pagination";
import ConfirmationModal from "../../../../../components/common/Dialog/ConfirmationModal/ConfirmationModal";

const ITEMS_PER_PAGE = 8;

const ClassStudentsSection = ({ classId, students, readOnly = false, isStudentView = false }) => {
  // --- State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentReviews, setStudentReviews] = useState({});
  const [studentAttendance, setStudentAttendance] = useState({});
  
  // Student Review Modal State
  const [reviewDialogStudent, setReviewDialogStudent] = useState(null);
  const [reviewCategory, setReviewCategory] = useState("Vi phạm: Chuyên cần");
  const [reviewContent, setReviewContent] = useState(REVIEW_CONTENT_MAPPING["Vi phạm: Chuyên cần"][0]);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewEntries, setReviewEntries] = useState([]);
  
  // Lesson Review Modal State
  const [isLessonReviewDialogOpen, setIsLessonReviewDialogOpen] = useState(false);
  const [lessonScore, setLessonScore] = useState("");
  const [lessonNote, setLessonNote] = useState("");
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [teachingDays, setTeachingDays] = useState([]);
  const [lessonReviews, setLessonReviews] = useState([]);
  const [isDoublePeriod, setIsDoublePeriod] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [isBulkReviewOpen, setIsBulkReviewOpen] = useState(false);
  const [gradeItems, setGradeItems] = useState([]);
  const [editingEvaluationId, setEditingEvaluationId] = useState(null);
  const [lessonPeriodOptions, setLessonPeriodOptions] = useState([]);
  const [selectedLessonPeriod, setSelectedLessonPeriod] = useState("");
  const [todayPeriods, setTodayPeriods] = useState([]); // Danh sách các tiết dạy hôm nay
  const [deleteReviewId, setDeleteReviewId] = useState(null);

  // --- Context ---
  const { selectedSchoolYear, selectedTerm } = useSchoolYearContext();

  const [resolvedSemester, setResolvedSemester] = useState(null);

  // Resolve semesterId from context (year/term)
  useEffect(() => {
    if (!selectedSchoolYear || !selectedTerm) return;
    let cancelled = false;
    resolveSemesterId(selectedSchoolYear, selectedTerm).then((id) => {
      if (!cancelled) setResolvedSemester(id ? { id } : null);
    });
    return () => { cancelled = true; };
  }, [selectedSchoolYear, selectedTerm]);

  // Timeline & Calendar State
  const [todayLessonInfo, setTodayLessonInfo] = useState(() => getCurrentLessonInfo(new Date()));
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(() => toDateKey(new Date()));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(() => parseDateKey(toDateKey(new Date())));

  // --- Derived State ---
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter((s) =>
      (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.id && s.id.toString().includes(searchTerm))
    );
  }, [students, searchTerm]);

  const reviewsForSelectedDate = useMemo(
    () => lessonReviews.filter((review) => review.reviewDate === selectedHistoryDate),
    [lessonReviews, selectedHistoryDate]
  );

  const selectedDateLatestReview = reviewsForSelectedDate[0] || null;

  const totalStudents = students?.length || 0;
  const attendedToday = useMemo(() => {
    return (students || []).filter(s => studentAttendance[s.id]).length;
  }, [students, studentAttendance]);

  const absentToday = Math.max(totalStudents - attendedToday, 0);
  const selectedDateObj = parseDateKey(selectedHistoryDate);
  const selectedDateLabel = selectedDateObj.toLocaleDateString("vi-VN");

  const currentLessonLabel = currentSchedule
    ? `Tiết học thực tế (Tiết ${currentSchedule.periodId || currentSchedule.period_number || currentSchedule.period || currentSchedule.id || "?"})`
    : (todayLessonInfo?.periodLabel || `Tiết học dự kiến (${lessonReviews.length + 1})`);

  const currentLessonTime = currentSchedule 
    ? `${currentSchedule.start_time?.substring(0, 5)} - ${currentSchedule.end_time?.substring(0, 5)} - ${selectedDateLabel}`
    : todayLessonInfo?.timeRange 
      ? `${todayLessonInfo.timeRange} - ${selectedDateLabel}`
      : `07:15 - 08:00 - ${selectedDateLabel || ""}`;

  const availableReviewDates = useMemo(
    () => [...new Set(lessonReviews.map((review) => review.reviewDate))].sort((a, b) => b.localeCompare(a)),
    [lessonReviews]
  );
  const availableReviewDateSet = useMemo(() => new Set(availableReviewDates), [availableReviewDates]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedStudents = filteredStudents.slice(
    (effectivePage - 1) * ITEMS_PER_PAGE,
    effectivePage * ITEMS_PER_PAGE
  );

  const reviewTotalPoints = useMemo(
    () => reviewEntries.reduce((total, entry) => total + entry.pts, 0),
    [reviewEntries]
  );

  // --- Effects ---
  useEffect(() => {
    if (selectedDateLatestReview) {
      setStudentAttendance(selectedDateLatestReview.attendanceSnapshot || {});
      setStudentReviews(selectedDateLatestReview.studentReviewSnapshot || {});
      
      setEditingEvaluationId(selectedDateLatestReview.id);
      
      const rawScore = selectedDateLatestReview.score || "";
      let normalizedScore = "";
      if (rawScore.includes("A")) normalizedScore = "A (Tốt)";
      else if (rawScore.includes("B")) normalizedScore = "B (Khá)";
      else if (rawScore.includes("C")) normalizedScore = "C (Trung bình)";
      else if (rawScore.includes("D")) normalizedScore = "D (Yếu)";
      
      setLessonScore(normalizedScore);
      setLessonNote(selectedDateLatestReview.note || "");
      setIsDoublePeriod(selectedDateLatestReview.isDoublePeriod || false);
    } else {
      // Nếu không có lịch sử cho ngày này, reset trạng thái để giáo viên điểm danh mới (mặc định tích đi học cho tất cả)
      const defaultAttendance = {};
      if (students) {
        students.forEach(s => {
          defaultAttendance[s.id] = true;
        });
      }
      setStudentAttendance(defaultAttendance);
      setStudentReviews({});
      
      // Quan trọng: Reset toàn bộ form đánh giá tiết học về trạng thái tạo mới
      setEditingEvaluationId(null);
      setLessonScore("");
      setLessonNote("");
      setIsDoublePeriod(false);
    }
    setCurrentPage(1);
  }, [selectedDateLatestReview, students]);

  const mapBackendHistory = (resData) => {
    if (!Array.isArray(resData)) return [];
    return resData.map(item => {
      const restoredReviews = {};
      if (item.student_reports && item.student_reports.length > 0) {
        item.student_reports.forEach(report => {
          const sId = report.student_id || report.student_enrollment_id;
          if (!sId) return;
          
          if (!restoredReviews[sId]) {
            restoredReviews[sId] = {
              summary: report.summary || "",
              entries: [],
              totalPoints: 0
            };
          }
          
          const entry = {
            id: report.id || (Date.now() + Math.random()),
            category: report.category,
            content: typeof report.content === 'string' ? { label: report.content, pts: report.points } : report.content,
            note: report.note || "",
            pts: report.points || 0
          };
          
          restoredReviews[sId].entries.push(entry);
          restoredReviews[sId].totalPoints += entry.pts;
        });
      }

      Object.keys(restoredReviews).forEach(sId => {
        const data = restoredReviews[sId];
        if (!data.summary) {
          const totalPoints = data.totalPoints;
          data.summary = [
            data.entries
              .map((entry) => {
                const pointLabel = entry.pts > 0 ? `+${entry.pts}` : entry.pts;
                return [entry.category, typeof entry.content === 'object' ? entry.content.label : entry.content, entry.note, `Điểm: ${pointLabel}`].filter(Boolean).join(" • ");
              })
              .join(" || "),
            `Tổng: ${totalPoints > 0 ? `+${totalPoints}` : totalPoints}`,
          ].filter(Boolean).join(" • ");
        }
      });

      const attendanceSnapshot = item.attendance_snapshot 
        ? Object.entries(item.attendance_snapshot).reduce((acc, [sId, status]) => {
            acc[sId] = status === 'present';
            return acc;
          }, {}) 
        : {};

      const periodNum = item.periodId || item.period_id || item.period_number;
      const periodDisplay = periodNum ? `Tiết ${periodNum}` : "Tiết chưa xác định";

      return {
        id: item.id,
        lessonLabel: periodDisplay,
        lessonTime: item.start_time ? `${item.start_time.substring(0, 5)} - ${new Date(item.evaluation_date).toLocaleDateString("vi-VN")}` : new Date(item.evaluation_date).toLocaleDateString("vi-VN"),
        attended: item.present_count || 0,
        absent: item.absent_count || 0,
        score: item.score,
        note: item.note,
        studentReports: item.student_reports || [],
        reviewDate: toDateKey(new Date(item.evaluation_date)),
        createdAt: new Date(item.created_at).toLocaleString("vi-VN"),
        isDoublePeriod: item.is_double_period,
        attendanceSnapshot,
        studentReviewSnapshot: restoredReviews,
        lessonInstanceId: item.lesson_instance_id || null,
        periodId: item.periodId || item.period_id || null,
        schoolDayId: item.school_day_id || null
      };
    });
  };

  useEffect(() => {
    setCalendarViewDate(parseDateKey(selectedHistoryDate));
  }, [selectedHistoryDate]);

  // Tải lịch sử đánh giá từ BE
  useEffect(() => {
    const fetchHistory = async () => {
      if (!classId) return;
      try {
        const res = isStudentView
          ? await studentService.getClassLessonEvaluations({
              mock: false,
              pathParams: { classId }
            })
          : await teacherService.getLessonEvaluations({
              mock: false,
              pathParams: { classId }
            });
        if (res.success && res.data) {
          const history = mapBackendHistory(res.data);
          if (history.length > 0) {
            setLessonReviews(history);
          } else {
            setLessonReviews([]);
          }
        } else {
          setLessonReviews([]);
        }
      } catch (err) {
        console.error("Failed to fetch evaluations:", err);
      }
    };
    fetchHistory();
  }, [classId, isStudentView]);

  // Tải danh sách cột điểm để hỗ trợ đồng bộ
  useEffect(() => {
    const fetchGradeItems = async () => {
      if (!classId || isStudentView) return;
      try {
        const res = await teacherService.listGradeItems({
          params: { classId }
        });
        if (res.success && res.data) {
          setGradeItems(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch grade items:", err);
      }
    };
    fetchGradeItems();
  }, [classId, isStudentView]);

  // Lấy TKB hiện tại dựa trên ngày đang chọn
  useEffect(() => {
    const fetchCurrentSchedule = async () => {
      if (!classId || isStudentView || !resolvedSemester?.id) return;
      try {
        const res = await teacherService.getCurrentSchedule({
          mock: false,
          pathParams: { classId },
          params: { date: selectedHistoryDate, semesterId: resolvedSemester.id }
        });
        if (res.success) {
          setCurrentSchedule(res.data || null);
        }
      } catch (err) {
        console.error("Failed to fetch current schedule:", err);
      }
    };
    fetchCurrentSchedule();
  }, [classId, selectedHistoryDate, isStudentView, resolvedSemester?.id]);

  // Lấy các thứ có lịch dạy trong tuần
  useEffect(() => {
    const fetchTeachingDays = async () => {
      if (!classId || isStudentView || !resolvedSemester?.id) return;
      try {
        const res = await teacherService.getTeachingDays({
          mock: false,
          pathParams: { classId },
          params: { semesterId: resolvedSemester.id }
        });
        if (res.success && res.data) {
          setTeachingDays(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch teaching days:", err);
      }
    };
    fetchTeachingDays();
  }, [classId, isStudentView, resolvedSemester?.id]);

  // Lấy TKB của chính giáo viên để chỉ hiện các tiết mà giáo viên này dạy trong lớp
  useEffect(() => {
    const fetchTeacherTimetable = async () => {
      if (!classId || isStudentView || !resolvedSemester?.id) return;
      try {
        const res = await teacherService.getTimetable({
          params: { semesterId: resolvedSemester.id }
        });
        const lessons = Array.isArray(res?.data?.lessons)
          ? res.data.lessons
          : Array.isArray(res?.data?.data?.lessons)
            ? res.data.data.lessons
            : Array.isArray(res?.data)
              ? res.data
              : [];

        if (Array.isArray(lessons)) {
          const selectedDate = parseDateKey(selectedHistoryDate);
          const selectedDayOfWeek = selectedDate.getDay() + 1; // 1 (CN) - 7 (T7)
          const periodsToday = lessons
            .filter((lesson) => {
              const lessonClassId = lesson.classId ?? lesson.class_id;
              const lessonDayOfWeek = lesson.dayOfWeek ?? lesson.day_of_week;
              return String(lessonClassId) === String(classId) && Number(lessonDayOfWeek) === selectedDayOfWeek;
            })
            .sort((a, b) => {
              const aPeriod = Number(a.period ?? a.period_number ?? 0);
              const bPeriod = Number(b.period ?? b.period_number ?? 0);
              return aPeriod - bPeriod;
            });
          setTodayPeriods(periodsToday);
        }
      } catch (err) {
        console.error("Failed to fetch teacher timetable:", err);
      }
    };
    fetchTeacherTimetable();
  }, [classId, selectedHistoryDate, isStudentView, resolvedSemester?.id]);

  // --- Handlers ---
  const handleBackToToday = () => setSelectedHistoryDate(toDateKey(new Date()));

  const openReviewDialog = (student) => {
    if (!student) {
      // Đánh giá loạt
      setIsBulkReviewOpen(true);
      setReviewDialogStudent(null);
    } else {
      // Đánh giá lẻ
      setReviewDialogStudent(student);
      setIsBulkReviewOpen(false);
    }
    
    // Nếu là đánh giá lẻ cho 1 học sinh, lấy lại dữ liệu cũ của học sinh đó (nếu có)
    const existingReview = student ? normalizeStoredReview(studentReviews[student.id]) : null;

    setReviewCategory("Vi phạm: Chuyên cần");
    setReviewContent(REVIEW_CONTENT_MAPPING["Vi phạm: Chuyên cần"][0]);
    setReviewNote("");
    setReviewEntries(existingReview?.entries || []);

    if (existingReview?.entries?.length > 0) {
      const firstEntry = existingReview.entries[0];
      setReviewCategory(firstEntry.category || "Vi phạm: Chuyên cần");
      setReviewContent(firstEntry.content || REVIEW_CONTENT_MAPPING["Vi phạm: Chuyên cần"][0]);
      setReviewNote(firstEntry.note || "");
    }
  };

  const closeReviewDialog = () => {
    setReviewDialogStudent(null);
    setIsBulkReviewOpen(false);
    setReviewCategory("Vi phạm: Chuyên cần");
    setReviewContent(REVIEW_CONTENT_MAPPING["Vi phạm: Chuyên cần"][0]);
    setReviewNote("");
    setReviewEntries([]);
    // Không reset selectedStudentIds ở đây để giáo viên có thể tiếp tục thao tác khác
  };

  const handleReviewCategoryChange = (category) => {
    setReviewCategory(category);
    setReviewContent(REVIEW_CONTENT_MAPPING[category][0]);
  };


  const addReviewEntry = () => {
    setReviewEntries((currentEntries) => [
      ...currentEntries,
      {
        id: Date.now(),
        category: reviewCategory,
        content: reviewContent,
        note: reviewNote.trim(),
        pts: reviewContent.pts,
      },
    ]);
    setReviewNote("");
  };

  const removeReviewEntry = (entryId) => {
    setReviewEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== entryId));
  };

  const saveReview = async () => {
    if (!reviewDialogStudent && selectedStudentIds.size === 0) return;

    const entriesToSave = reviewEntries.length > 0 ? reviewEntries : [
      {
        id: Date.now(),
        category: reviewCategory,
        content: reviewContent,
        note: reviewNote.trim(),
        pts: reviewContent.pts,
      },
    ];

    const totalPoints = entriesToSave.reduce((total, entry) => total + entry.pts, 0);

    const reviewText = [
      entriesToSave
          .map((entry) => {
            const pointLabel = entry.pts > 0 ? `+${entry.pts}` : entry.pts;
            return [entry.category, entry.content.label, entry.note, `Điểm: ${pointLabel}`].filter(Boolean).join(" • ");
          })
          .join(" || "),
      `Tổng: ${totalPoints > 0 ? `+${totalPoints}` : totalPoints}`,
    ].filter(Boolean).join(" • ");

    const targets = reviewDialogStudent ? [reviewDialogStudent.id] : Array.from(selectedStudentIds);
    
    setStudentReviews((prev) => {
      const next = { ...prev };
      targets.forEach(id => {
        next[id] = {
          summary: reviewText,
          entries: entriesToSave,
          totalPoints,
        };
      });
      return next;
    });

    toast.success(`Đã lưu ghi nhận cho ${targets.length} học sinh`);
    
    // ĐỒNG BỘ SANG SỔ ĐIỂM (Nếu có điểm miệng)
    const oralEntry = reviewEntries.find(e => e.category === "Đánh giá thường xuyên (Điểm miệng)");
    if (oralEntry) {
      const scoreStr = oralEntry.content?.label?.replace("Điểm ", "").trim();
      const scoreNum = parseFloat(scoreStr);
      
      if (!isNaN(scoreNum)) {
        // Tìm cột điểm "Miệng" hoặc "TX1"
        const oralGradeItem = gradeItems.find(item => 
          item.name.toLowerCase().includes("miệng") || 
          item.name.toLowerCase().includes("thường xuyên 1") ||
          item.code?.toLowerCase() === "tx1"
        );
        
        if (oralGradeItem) {
          try {
            const gradePayload = targets.map(sId => ({
              studentId: sId,
              gradeItemId: oralGradeItem.id,
              value: scoreNum,
              note: `Ghi nhận từ tiết học ${currentLessonLabel} ngày ${toDateKey(new Date())}`
            }));
            
            await teacherService.bulkUpdateGrades({ body: gradePayload });
            toast.success(`Đã đồng bộ điểm ${scoreNum} vào cột "${oralGradeItem.name}" trong sổ điểm!`);
          } catch (syncErr) {
            console.error("Grade sync failed:", syncErr);
            toast.error("Ghi nhận thành công nhưng không thể đồng bộ sang sổ điểm.");
          }
        } else {
          toast.info("Không tìm thấy cột điểm 'Miệng' để đồng bộ tự động.");
        }
      }
    }

    closeReviewDialog();
    if (isBulkReviewOpen) setSelectedStudentIds(new Set());
  };

  const toggleAttendance = (studentId) => {
    setStudentAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleToggleSelect = (studentId) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const handleSelectAll = (isAll) => {
    if (isAll) {
      setSelectedStudentIds(new Set(filteredStudents.map(s => s.id)));
    } else {
      setSelectedStudentIds(new Set());
    }
  };

  const resetLessonForm = () => {
    setLessonNote("");
    setLessonScore("");
    setIsDoublePeriod(false);
    setEditingEvaluationId(null);
    setLessonPeriodOptions([]);
    setSelectedLessonPeriod("");
    setIsLessonReviewDialogOpen(false);
  };

  const getLessonPeriodNumber = (lesson) => {
    return lesson?.periodId ?? lesson?.period_number ?? lesson?.periodNumber ?? lesson?.period ?? null;
  };

  const handleOpenLessonReview = () => {
    // 1. Xác định các tiết dạy thực tế trong hôm nay từ TKB
    // Nếu không có dữ liệu TKB thì dùng currentSchedule làm fallback
    const scheduledPeriods = todayPeriods.length > 0
      ? todayPeriods.map(getLessonPeriodNumber).filter(Boolean)
      : (currentSchedule ? [getLessonPeriodNumber(currentSchedule)].filter(Boolean) : []);

    const targetDate = selectedHistoryDate;
    
    // 2. Lấy danh sách đánh giá đã có cho ngày được chọn
    const existingReviews = lessonReviews.filter(r => r.reviewDate === targetDate);

    const options = [];

    // 3. Với mỗi tiết trong lịch dạy, kiểm tra xem đã đánh giá chưa
    scheduledPeriods.forEach(pNum => {
      const review = existingReviews.find(r => 
        r.lessonLabel.includes(`Tiết ${pNum}`) || 
        (r.isDoublePeriod && r.lessonLabel.includes(`Tiết ${pNum}`))
      );

      if (review) {
        options.push({
          value: review.id,
          label: `Tiết ${pNum} (Đã đánh giá)`,
          isExisting: true,
          review: review
        });
      } else {
        options.push({
          value: `new_${pNum}`,
          label: `Tiết ${pNum} (Chưa đánh giá) - Tạo mới`,
          isExisting: false,
          periodNum: pNum
        });
      }
    });

    if (options.length > 0) {
      setLessonPeriodOptions(options.map(o => ({ value: o.value, label: o.label })));
      
      // Mặc định: Ưu tiên chọn cái "Chưa đánh giá" đầu tiên, hoặc cái "Đã đánh giá" đầu tiên
      const defaultOption = options.find(o => !o.isExisting) || options[0];
      setSelectedLessonPeriod(defaultOption.value);
      
      if (defaultOption.isExisting) {
        handleEditLessonReview(defaultOption.review);
      } else {
        // Reset form cho tạo mới
        setEditingEvaluationId(null);
        setLessonScore("");
        setLessonNote("");
      }
      
      setIsLessonReviewDialogOpen(true);
    } else {
      // Trường hợp không thấy trong TKB (dạy thay/ngoại lệ)
      setIsLessonReviewDialogOpen(true);
    }
  };

  const handleLessonPeriodSelect = (val) => {
    setSelectedLessonPeriod(val);
    if (val.toString().startsWith("new_")) {
      setEditingEvaluationId(null);
      setLessonScore("");
      setLessonNote("");
    } else {
      const review = lessonReviews.find(r => r.id === val);
      if (review) {
        handleEditLessonReview(review, false);
      }
    }
  };

  const handleEditLessonReview = (review, shouldOpenModal = true) => {
    setEditingEvaluationId(review.id);
    
    // Chuẩn hóa điểm số để khớp với Select options
    const rawScore = review.score || "";
    let normalizedScore = "";
    if (rawScore.includes("A")) normalizedScore = "A (Tốt)";
    else if (rawScore.includes("B")) normalizedScore = "B (Khá)";
    else if (rawScore.includes("C")) normalizedScore = "C (Trung bình)";
    else if (rawScore.includes("D")) normalizedScore = "D (Yếu)";
    
    setLessonScore(normalizedScore);
    setLessonNote(review.note);
    setIsDoublePeriod(review.isDoublePeriod || false);
    
    // Khôi phục đánh giá từng học sinh
    const restoredReviews = {};
    if (review.studentReports && review.studentReports.length > 0) {
      review.studentReports.forEach(report => {
        const sId = report.student_id || report.student_enrollment_id;
        if (!sId) return;
        
        if (!restoredReviews[sId]) {
          restoredReviews[sId] = {
            summary: report.summary || "",
            entries: [],
            totalPoints: 0
          };
        }
        
        // Chuyển đổi report từ BE sang entry FE
        const entry = {
          id: Date.now() + Math.random(),
          category: report.category,
          content: typeof report.content === 'string' ? { label: report.content, pts: report.points } : report.content,
          note: report.note || "",
          pts: report.points || 0
        };
        
        restoredReviews[sId].entries.push(entry);
        restoredReviews[sId].totalPoints += entry.pts;
      });
    }
    setStudentReviews(restoredReviews);
    if (shouldOpenModal) setIsLessonReviewDialogOpen(true);
  };

  const handleDeleteLessonReview = (evaluationId) => {
    setDeleteReviewId(evaluationId);
  };

  const handleBulkAttendance = (status) => {
    if (selectedStudentIds.size === 0) return;
    setStudentAttendance(prev => {
      const next = { ...prev };
      selectedStudentIds.forEach(id => {
        next[id] = status;
      });
      return next;
    });
    toast.info(`Đã điểm danh cho ${selectedStudentIds.size} học sinh`);
  };

  const handleConfirmDeleteLessonReview = async () => {
    console.log("[DELETE] deleteReviewId:", deleteReviewId);
    if (!deleteReviewId) return;
    try {
      console.log("[DELETE] Calling API with id:", deleteReviewId);
      const res = await teacherService.deleteLessonEvaluation({
        pathParams: { id: deleteReviewId }
      });
      console.log("[DELETE] Response:", res);
      if (res.success) {
        toast.success("Đã xóa đánh giá tiết học");
        setLessonReviews(prev => prev.filter(r => r.id !== deleteReviewId));
      }
    } catch (err) {
      console.error("Failed to delete evaluation:", err);
      toast.error("Không thể xóa đánh giá");
    } finally {
      setDeleteReviewId(null);
    }
  };

  const handleAddLessonReview = async (e) => {
    e.preventDefault();
    if (!lessonScore.trim() || !lessonNote.trim()) {
      toast.error("Vui lòng chọn xếp loại và nhập nhận xét");
      return;
    }
    
    // Thu thập toàn bộ đánh giá học sinh
    const studentReports = [];
    Object.keys(studentReviews).forEach(sId => {
      const student = students.find(s => s.id === parseInt(sId));
      if (!student || !(student.enrollmentId || student.enrollment_id)) return;

      const data = studentReviews[sId];
      if (data && data.entries) {
        data.entries.forEach(entry => {
          studentReports.push({
            studentEnrollmentId: student.enrollmentId || student.enrollment_id,
            category: entry.category,
            content: typeof entry.content === 'object' ? entry.content.label : entry.content,
            points: entry.pts,
            note: entry.note || ""
          });
        });
      }
    });

    console.log("=== COMPILING LESSON EVALUATION ===");
    console.log("Drafted studentReviews:", JSON.parse(JSON.stringify(studentReviews)));
    console.log("Compiled studentReports to send:", JSON.parse(JSON.stringify(studentReports)));

    const evaluationData = {
      classId: parseInt(classId),
      subjectAssignmentId: currentSchedule?.subject_assignment_id || null,
      periodId: currentSchedule?.periodId || currentSchedule?.id || null,
      lessonInstanceId: currentSchedule?.lessonInstanceId || null,
      schoolDayId: currentSchedule?.schoolDayId || null,
      dayOfWeek: currentSchedule?.dayOfWeek || null,
      evaluationDate: selectedHistoryDate,
      score: lessonScore.trim().toUpperCase(),
      note: lessonNote.trim(),
      presentCount: attendedToday,
      absentCount: absentToday,
      isDoublePeriod: isDoublePeriod,
      studentReports: studentReports
    };

    try {
      // Điểm danh: Lưu danh sách điểm danh cho tiết học thực tế này
      if (currentSchedule?.periodId || currentSchedule?.id) {
        await teacherService.saveAttendance({
          mock: false,
          body: {
            periodId: currentSchedule.periodId || currentSchedule.id,
            lessonInstanceId: currentSchedule.lessonInstanceId || null,
            date: selectedHistoryDate,
            attendances: students.map(s => ({
              studentEnrollmentId: s.enrollmentId || s.enrollment_id,
              status: studentAttendance[s.id] ? "present" : "absent"
            }))
          }
        });
      }

      let res;
      if (editingEvaluationId) {
        res = await teacherService.updateLessonEvaluation({
          pathParams: { id: editingEvaluationId },
          body: evaluationData
        });
      } else {
        res = await teacherService.saveLessonEvaluation({
          body: evaluationData
        });
      }

      if (res.success) {
        toast.success(editingEvaluationId ? "Đã cập nhật đánh giá" : "Đã lưu đánh giá tiết học");

        // Refresh history
        const dRes = await teacherService.getTeachingDays({
          mock: false,
          pathParams: { classId },
          params: { semesterId: resolvedSemester?.id }
        });
        if (dRes.success && Array.isArray(dRes.data)) {
          setTeachingDays(dRes.data);
        }

        // Lấy thời khóa biểu hôm nay để biết chính xác các tiết dạy
        const schRes = await teacherService.getClassSchedule({ 
          pathParams: { id: classId },
          params: { semesterId: resolvedSemester?.id }
        });
        if (schRes.success && schRes.data) {
          const todayDayOfWeek = new Date().getDay() + 1;
          const periodsToday = schRes.data.filter(s => s.dayOfWeek === todayDayOfWeek || s.day_of_week === todayDayOfWeek);
          setTodayPeriods(periodsToday);
        }

        const hRes = await teacherService.getLessonEvaluations({ 
          mock: false,
          pathParams: { classId } 
        });
        if (hRes.success && Array.isArray(hRes.data)) {
          const history = mapBackendHistory(hRes.data);
          setLessonReviews(history);
          // Force selectedHistoryDate to re-trigger the useEffect that loads studentReviews from the latest review
          setSelectedHistoryDate(selectedHistoryDate);
        }
        resetLessonForm();
      }
    } catch (err) {
      console.error("Failed to save evaluation:", err);
      toast.error("Lỗi khi lưu đánh giá");
    }
  };
  // Calendar Helpers
  const calendarMonthLabel = calendarViewDate.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });
  const firstOfMonth = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), 1);
  const daysInMonth = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 0).getDate();
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
  const calendarCells = Array.from({ length: 42 }, (_, idx) => {
    const dayOffset = idx - firstWeekday + 1;
    const dateObj = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), dayOffset);
    const dateKey = toDateKey(dateObj);
    const dayOfWeekInDB = dateObj.getDay() + 1;
    return {
      dateObj,
      dateKey,
      day: dateObj.getDate(),
      isCurrentMonth: dayOffset >= 1 && dayOffset <= daysInMonth,
      isSelected: dateKey === selectedHistoryDate,
      isToday: dateKey === toDateKey(new Date()),
      hasReview: availableReviewDateSet.has(dateKey),
      hasLesson: Array.isArray(teachingDays) && teachingDays.includes(dayOfWeekInDB),
    };
  });

  return (
    <div className="students-card">
      <div className="students-card-header">
        <h2 className="students-card-title">Danh sách & đánh giá</h2>
      </div>

      <LessonTimeline 
        currentLessonTime={currentLessonTime}
        onOpenLessonReview={handleOpenLessonReview}
        selectedHistoryDate={selectedHistoryDate}
        setSelectedHistoryDate={setSelectedHistoryDate}
        onToggleCalendar={() => setIsCalendarOpen(prev => !prev)}
        isCalendarOpen={isCalendarOpen}
        availableReviewDates={availableReviewDates}
        reviewsForSelectedDate={reviewsForSelectedDate}
        onTodayClick={handleBackToToday}
        onEditLessonReview={handleEditLessonReview}
        onDeleteLessonReview={handleDeleteLessonReview}
        readOnly={readOnly}
        calendarProps={{
          calendarMonthLabel,
          calendarViewDate,
          setCalendarViewDate,
          calendarCells,
          onSelectDate: (dateKey) => {
            setSelectedHistoryDate(dateKey);
            setIsCalendarOpen(false);
          }
        }}
      />

      <div className="students-card-actions-row">
        <div className="class-detail-search-box">
          <FiSearch className="class-detail-search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm học sinh..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        {selectedStudentIds.size > 0 && (
          <div className="bulk-actions-toolbar">
            <span className="selection-count">Đã chọn: <strong>{selectedStudentIds.size}</strong></span>
            <div className="bulk-btn-group">
              <button className="bulk-btn attend" onClick={() => handleBulkAttendance(true)}>Đi học loạt</button>
              <button className="bulk-btn absent" onClick={() => handleBulkAttendance(false)}>Vắng loạt</button>
              <button className="bulk-btn review" onClick={() => openReviewDialog(null)}>Đánh giá loạt</button>
            </div>
          </div>
        )}
      </div>

      <StudentReviewModal 
        student={reviewDialogStudent}
        onClose={closeReviewDialog}
        reviewCategory={reviewCategory}
        onCategoryChange={handleReviewCategoryChange}
        reviewContent={reviewContent}
        onContentChange={setReviewContent}
        reviewNote={reviewNote}
        setReviewNote={setReviewNote}
        reviewEntries={reviewEntries}
        onAddEntry={addReviewEntry}
        onRemoveEntry={removeReviewEntry}
        reviewTotalPoints={reviewTotalPoints}
        onSave={saveReview}
        readOnly={readOnly}
        bulkCount={isBulkReviewOpen ? selectedStudentIds.size : 0}
      />

      <LessonReviewModal 
        isOpen={isLessonReviewDialogOpen}
        onClose={resetLessonForm}
        onAddReview={handleAddLessonReview}
        currentLessonLabel={currentLessonLabel}
        currentLessonTime={currentLessonTime}
        attendedToday={attendedToday}
        absentToday={absentToday}
        lessonScore={lessonScore}
        setLessonScore={setLessonScore}
        lessonNote={lessonNote}
        setLessonNote={setLessonNote}
        isDoublePeriod={isDoublePeriod}
        setIsDoublePeriod={setIsDoublePeriod}
        periodOptions={lessonPeriodOptions}
        selectedPeriodId={selectedLessonPeriod}
        onPeriodSelect={handleLessonPeriodSelect}
        isEdit={!!editingEvaluationId}
      />

      <StudentsTable 
        students={paginatedStudents}
        studentAttendance={studentAttendance}
        onToggleAttendance={toggleAttendance}
        onOpenReview={openReviewDialog}
        effectivePage={effectivePage}
        itemsPerPage={ITEMS_PER_PAGE}
        readOnly={readOnly}
        selectedStudentIds={selectedStudentIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
      />

      <Pagination 
        effectivePage={effectivePage}
        totalPages={totalPages}
        onPrevPage={() => setCurrentPage(p => Math.max(1, p - 1))}
        onNextPage={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
      />

      <ConfirmationModal
        isOpen={deleteReviewId !== null}
        title="Xóa đánh giá"
        message="Bạn có chắc chắn muốn xóa đánh giá tiết học này?"
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleConfirmDeleteLessonReview}
        onCancel={() => setDeleteReviewId(null)}
      />
    </div>
  );
};

export default ClassStudentsSection;



