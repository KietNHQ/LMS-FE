import React, { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import teacherService from "../../../../../services/pages/teacher/teacherService";
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

const ITEMS_PER_PAGE = 8;

const ClassStudentsSection = ({ classId, students, readOnly = false }) => {
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

  // Timeline & Calendar State
  const [todayLessonInfo, setTodayLessonInfo] = useState(() => getCurrentLessonInfo(new Date()));
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(() => toDateKey(new Date()));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(() => parseDateKey(toDateKey(new Date())));

  // --- Derived State ---
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const currentLessonLabel = currentSchedule ? `Tiết học thực tế (Tiết ${currentSchedule.id || "?"})` : `Tiết học dự kiến (${lessonReviews.length + 1})`;
  const currentLessonTime = currentSchedule 
    ? `${currentSchedule.start_time?.substring(0, 5)} - ${currentSchedule.end_time?.substring(0, 5)} - ${selectedDateLabel}`
    : `${todayLessonInfo?.periodLabel || "Tiết 1"} - ${selectedDateLabel}`;

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
    } else {
      // Nếu không có lịch sử cho ngày này, reset trạng thái để giáo viên điểm danh mới
      setStudentAttendance({});
      setStudentReviews({});
    }
    setCurrentPage(1);
  }, [selectedDateLatestReview]);

  useEffect(() => {
    setCalendarViewDate(parseDateKey(selectedHistoryDate));
  }, [selectedHistoryDate]);

  // Tải lịch sử đánh giá từ BE
  useEffect(() => {
    const fetchHistory = async () => {
      if (!classId) return;
      try {
        const res = await teacherService.getLessonEvaluations({
          mock: false,
          pathParams: { classId }
        });
        if (res.success && res.data) {
          const history = res.data.map(item => ({
            id: item.id,
            lessonLabel: `Tiết ${item.period_id || ""}`,
            lessonTime: `${item.start_time ? item.start_time.substring(0, 5) : ""} - ${new Date(item.evaluation_date).toLocaleDateString("vi-VN")}`,
            attended: item.present_count || 0,
            absent: item.absent_count || 0,
            score: item.score,
            note: item.note,
            studentReports: item.student_reports || [],
            reviewDate: toDateKey(new Date(item.evaluation_date)),
            createdAt: new Date(item.created_at).toLocaleString("vi-VN"),
          }));
          if (history.length > 0) {
            setLessonReviews(history);
          }
        }
      } catch (err) {
        console.error("Failed to fetch evaluations:", err);
      }
    };
    fetchHistory();
  }, [classId]);

  // Lấy TKB hiện tại dựa trên ngày đang chọn
  useEffect(() => {
    const fetchCurrentSchedule = async () => {
      if (!classId) return;
      try {
        const res = await teacherService.getCurrentSchedule({
          mock: false,
          pathParams: { classId },
          params: { date: selectedHistoryDate } // Gửi ngày đang chọn lên BE
        });
        if (res.success) {
          setCurrentSchedule(res.data || null);
        }
      } catch (err) {
        console.error("Failed to fetch current schedule:", err);
      }
    };
    fetchCurrentSchedule();
  }, [classId, selectedHistoryDate]);

  // Lấy các thứ có lịch dạy trong tuần
  useEffect(() => {
    const fetchTeachingDays = async () => {
      if (!classId) return;
      try {
        const res = await teacherService.getTeachingDays({
          mock: false,
          pathParams: { classId }
        });
        if (res.success && res.data) {
          setTeachingDays(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch teaching days:", err);
      }
    };
    fetchTeachingDays();
  }, [classId]);

  // --- Handlers ---
  const handleBackToToday = () => setSelectedHistoryDate(toDateKey(new Date()));

  const openReviewDialog = (student) => {
    setReviewDialogStudent(student);
    const existingReview = normalizeStoredReview(studentReviews[student.id]);

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
    setReviewCategory("Vi phạm: Chuyên cần");
    setReviewContent(REVIEW_CONTENT_MAPPING["Vi phạm: Chuyên cần"][0]);
    setReviewNote("");
    setReviewEntries([]);
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

  const saveReview = () => {
    if (!reviewDialogStudent) return;

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

    setStudentReviews((prev) => ({
      ...prev,
      [reviewDialogStudent.id]: {
        summary: reviewText,
        entries: entriesToSave,
        totalPoints,
      },
    }));
    closeReviewDialog();
  };

  const toggleAttendance = (studentId) => {
    setStudentAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleAddLessonReview = async (event) => {
    event.preventDefault();
    if (!lessonScore.trim() || !lessonNote.trim()) return;

    try {
      const reviewDateKey = selectedHistoryDate;
      
      // 1. Lưu điểm danh
      const attendanceData = (students || []).map(student => ({
        studentEnrollmentId: student.enrollmentId,
        status: studentAttendance[student.id] ? "present" : "absent",
        note: studentReviews[student.id]?.summary || ""
      }));

      await teacherService.saveAttendance({
        mock: false,
        body: {
          periodId: currentSchedule?.id || 1, 
          date: reviewDateKey,
          attendances: attendanceData
        }
      });

      // 3. Thu thập báo cáo chi tiết từng học sinh
      const studentReports = [];
      Object.keys(studentReviews).forEach(studentId => {
        const review = studentReviews[studentId];
        if (review && review.entries && review.entries.length > 0) {
          const student = (students || []).find(s => s.id.toString() === studentId.toString());
          if (student) {
            review.entries.forEach(entry => {
              studentReports.push({
                studentEnrollmentId: student.enrollmentId,
                category: entry.category,
                content: typeof entry.content === 'object' ? entry.content.label : entry.content,
                points: entry.pts,
                note: entry.note || ""
              });
            });
          }
        }
      });

      // 4. Lưu đánh giá tiết học & Ghi nhận chi tiết
      const evaluationRes = await teacherService.saveLessonEvaluation({
        mock: false,
        body: {
          classId: classId,
          periodId: currentSchedule?.id || 1,
          evaluationDate: reviewDateKey,
          score: lessonScore.trim().toUpperCase(),
          note: lessonNote.trim(),
          studentReports: studentReports
        }
      });

      if (evaluationRes.success) {
        toast.success("Đã lưu đánh giá và điểm danh thành công!");
        
        // Cập nhật local state
        const newReview = {
          id: evaluationRes.data.id || Date.now(),
          lessonLabel: currentLessonLabel,
          lessonTime: currentLessonTime,
          attended: attendedToday,
          absent: absentToday,
          score: lessonScore.trim().toUpperCase(),
          note: lessonNote.trim(),
          reviewDate: reviewDateKey,
          createdAt: new Date().toLocaleString("vi-VN"),
        };

        setLessonReviews((prev) => [newReview, ...prev]);
        setSelectedHistoryDate(reviewDateKey);
        setIsLessonReviewDialogOpen(false);
        setLessonScore("");
        setLessonNote("");
      }
    } catch (err) {
      console.error("Failed to save evaluation:", err);
      toast.error("Không thể lưu đánh giá. Vui lòng thử lại.");
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
      hasLesson: teachingDays.includes(dayOfWeekInDB),
    };
  });

  return (
    <div className="students-card">
      <div className="students-card-header">
        <h2 className="students-card-title">Danh sách & đánh giá</h2>
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
      </div>

      <LessonTimeline 
        currentLessonTime={currentLessonTime}
        onOpenLessonReview={() => setIsLessonReviewDialogOpen(true)}
        selectedHistoryDate={selectedHistoryDate}
        setSelectedHistoryDate={setSelectedHistoryDate}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        isCalendarOpen={isCalendarOpen}
        availableReviewDates={availableReviewDates}
        reviewsForSelectedDate={reviewsForSelectedDate}
        onTodayClick={handleBackToToday}
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
      />

      <LessonReviewModal 
        isOpen={isLessonReviewDialogOpen}
        onClose={() => setIsLessonReviewDialogOpen(false)}
        onAddReview={handleAddLessonReview}
        currentLessonLabel={currentLessonLabel}
        currentLessonTime={currentLessonTime}
        attendedToday={attendedToday}
        absentToday={absentToday}
        lessonScore={lessonScore}
        setLessonScore={setLessonScore}
        lessonNote={lessonNote}
        setLessonNote={setLessonNote}
      />

      <StudentsTable 
        students={paginatedStudents}
        studentAttendance={studentAttendance}
        onToggleAttendance={toggleAttendance}
        onOpenReview={openReviewDialog}
        effectivePage={effectivePage}
        itemsPerPage={ITEMS_PER_PAGE}
        readOnly={readOnly}
      />

      <Pagination 
        effectivePage={effectivePage}
        totalPages={totalPages}
        onPrevPage={() => setCurrentPage(p => Math.max(1, p - 1))}
        onNextPage={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
      />
    </div>
  );
};

export default ClassStudentsSection;



