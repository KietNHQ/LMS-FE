import React, { useState, useEffect } from "react";
import "./QuizManagementSection.css";
import { ClipboardList } from "lucide-react";
import WeekPicker from "../../../../../components/common/WeekPicker/WeekPicker";
import teacherService from "../../../../../services/pages/teacher/teacherService";
import { useSchoolYearTerm } from "../../../../../hooks/useSchoolYearTerm";

const getAcademicWeekForYear = (dateValue, schoolYear) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 1;

  const startYear = Number.parseInt(String(schoolYear || "").split("-")[0], 10) || date.getFullYear();
  const schoolYearStart = new Date(startYear, 7, 25);
  const diffDays = Math.max(0, Math.floor((date - schoolYearStart) / 86400000));
  return Math.max(1, Math.floor(diffDays / 7) + 1);
};

const QuizManagementSection = () => {
  const { selectedSchoolYear } = useSchoolYearTerm();
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [apiQuizzes, setApiQuizzes] = useState([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);

  const currentAcademicWeek = React.useMemo(
    () => getAcademicWeekForYear(new Date(), selectedSchoolYear),
    [selectedSchoolYear],
  );

  const getQuizWeek = (quiz) => {
    const sourceDate = quiz?.start_date || quiz?.end_date || quiz?.created_at;
    if (!sourceDate) return null;
    return getAcademicWeekForYear(sourceDate, selectedSchoolYear);
  };

  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoadingQuizzes(true);
      try {
        const response = await teacherService.listQuizzes({ mock: false });
        if (!response) return;

        const quizzesData = Array.isArray(response)
          ? response
          : Array.isArray(response?.data?.items)
            ? response.data.items
            : Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response?.items)
                ? response.items
                : [];
        setApiQuizzes(quizzesData);
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
      } finally {
        setIsLoadingQuizzes(false);
      }
    };
    fetchQuizzes();
  }, [selectedSchoolYear]);

  useEffect(() => {
    setSelectedWeek(currentAcademicWeek);
  }, [currentAcademicWeek]);

  // Map API data to UI structure
  const mappedApiQuizzes = apiQuizzes.map(q => ({
    id: q.id,
    title: q.title,
    class: q.class_name || q.className || q.class_teacher_subject?.classes?.class_name || "Lớp chung",
    duration: q.duration_minutes ? `${q.duration_minutes} phút` : "N/A",
    type: q.quiz_type === 'exam' ? 'Kiểm tra' : 'Luyện tập',
    week: getQuizWeek(q),
    status: (q.is_published ?? q.isPublished ?? q.status) ? 'active' : 'closed',
    statusText: (q.is_published ?? q.isPublished ?? q.status) ? 'Đang mở' : 'Đã đóng'
  }));

  const quizzes = mappedApiQuizzes;
  const maxQuizWeek = quizzes.reduce((maxWeek, quiz) => {
    return quiz.week && quiz.week > maxWeek ? quiz.week : maxWeek;
  }, currentAcademicWeek);

  const filteredQuizzes = quizzes.filter((q) => q.week == null || q.week === selectedWeek);

  return (
    <div className="teacher-dashboard-quiz">
      <div className="quiz-management-header">
        <p className="teacher-dashboard-title">Quản lý bài kiểm tra</p>
        <WeekPicker 
          value={selectedWeek} 
          onChange={setSelectedWeek} 
          label="Tuần" 
          totalWeeks={Math.max(35, maxQuizWeek)}
        />
      </div>

      <div className="quiz-list-scroll">
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz) => (
            <div className="teacher-dashboard-quiz-item" key={quiz.id}>
              <div className="quiz-left">
                <div className="quiz-icon">
                  <ClipboardList size={16} />
                </div>
                <div>
                  <p>{quiz.title}</p>
                  <span>
                    {quiz.class} • {quiz.type} • {quiz.duration}
                  </span>
                </div>
              </div>
              <span className={`status ${quiz.status}`}>
                {quiz.statusText}
              </span>
            </div>
          ))
        ) : isLoadingQuizzes ? (
          <div className="quiz-empty">
            <p>Đang tải bài kiểm tra...</p>
          </div>
        ) : (
          <div className="quiz-empty">
            <p>Không có bài kiểm tra nào trong tuần này.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizManagementSection;



