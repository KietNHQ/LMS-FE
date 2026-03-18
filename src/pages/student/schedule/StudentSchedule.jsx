import React, { useEffect, useMemo, useRef, useState } from "react";
import "./StudentSchedule.css";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import ScheduleHeader from "./components/ScheduleHeader/ScheduleHeader";
import ScheduleToolbar from "./components/ScheduleToolbar/ScheduleToolbar";
import ScheduleGrid from "./components/ScheduleGrid/ScheduleGrid";

const days = [
    { key: "Monday", label: "THỨ 2" },
    { key: "Tuesday", label: "THỨ 3" },
    { key: "Wednesday", label: "THỨ 4" },
    { key: "Thursday", label: "THỨ 5" },
    { key: "Friday", label: "THỨ 6" },
];

const periods = [
    { period: 1, start: "07:00", end: "07:45", session: "Sáng" },
    { period: 2, start: "07:50", end: "08:35", session: "Sáng" },
    { period: 3, start: "08:45", end: "09:30", session: "Sáng" },
    { period: 4, start: "09:40", end: "10:25", session: "Sáng" },
    { period: 5, start: "10:35", end: "11:20", session: "Sáng" },
    { period: 6, start: "13:00", end: "13:45", session: "Chiều" },
    { period: 7, start: "13:50", end: "14:35", session: "Chiều" },
    { period: 8, start: "14:45", end: "15:30", session: "Chiều" },
    { period: 9, start: "15:40", end: "16:25", session: "Chiều" },
    { period: 10, start: "16:35", end: "17:20", session: "Chiều" },
];

const periodMap = periods.reduce((map, item) => {
    map[item.period] = item;
    return map;
}, {});

function makeLesson(day, period, subject, teacher, room, color, lessonTopic, activity, assessment) {
    const slot = periodMap[period];
    return {
        day,
        period,
        subject,
        teacher,
        room,
        start: slot.start,
        end: slot.end,
        color,
        lessonTopic,
        activity,
        assessment,
    };
}

const weekTemplates = [
    {
        title: "Tuần nền tảng",
        summary: "Trọng tâm: Học kiến thức mới và kiểm tra miệng nhẹ.",
        lessons: [
            makeLesson("Monday", 1, "Mathematics", "Nguyen Van A", "R.101", "mathematics", "Quadratic Function Basics", "Learn a new concept", "Oral check"),
            makeLesson("Monday", 2, "Physics", "Tran Van B", "R.102", "physics", "Newton's Second Law", "Guided practice", "No assessment"),
            makeLesson("Monday", 6, "Chemistry", "Le Van C", "Lab.1", "chemistry", "Oxidation and Reduction", "Mini experiment", "15-minute quiz"),
            makeLesson("Monday", 7, "English", "Sarah Johnson", "R.103", "english", "Unit 6 - Listening", "Listening workshop", "Oral check"),
            makeLesson("Tuesday", 1, "Biology", "Dr. Hoang", "Lab.2", "biology", "Cell Structure", "Microscope observation", "No assessment"),
            makeLesson("Tuesday", 3, "History", "Mr. Duc", "R.201", "history", "Ancient Civilizations", "Documentary watch", "Oral check"),
            makeLesson("Tuesday", 4, "Geography", "Ms. Linh", "R.202", "geography", "Climate Zones", "Map analysis", "No assessment"),
            makeLesson("Tuesday", 8, "Literature", "Pham Thi D", "R.101", "literature", "Short Story Analysis", "Group discussion", "No assessment"),
            makeLesson("Wednesday", 2, "Informatics", "Vu Minh", "Lab.3", "informatics", "Python Basics", "Coding practice", "15-minute quiz"),
            makeLesson("Wednesday", 5, "Art", "Ms. Hoa", "R.301", "art", "Color Theory", "Painting exercise", "No assessment"),
            makeLesson("Wednesday", 9, "Physical Education", "Coach Tung", "Gym", "pe", "Badminton Basics", "Skill drill", "Practical test"),
            makeLesson("Thursday", 1, "Mathematics", "Nguyen Van A", "R.101", "mathematics", "Function Graphs", "Problem-solving", "No assessment"),
            makeLesson("Thursday", 3, "Physics", "Tran Van B", "Lab.2", "physics", "Work and Power", "Experiment", "Oral check"),
            makeLesson("Thursday", 4, "English", "Sarah Johnson", "R.103", "english", "Unit 6 - Speaking", "Pair speaking", "No assessment"),
            makeLesson("Thursday", 6, "Music", "Mr. Nam", "Music Room", "music", "Classical Music", "Listening session", "No assessment"),
            makeLesson("Thursday", 10, "Civic Education", "Ms. Huong", "R.203", "civic", "Human Rights", "Case study", "One-period test"),
            makeLesson("Friday", 1, "Chemistry", "Le Van C", "Lab.1", "chemistry", "Balancing Equations", "Review activity", "Oral check"),
            makeLesson("Friday", 2, "Biology", "Dr. Hoang", "Lab.2", "biology", "Photosynthesis", "Lab work", "No assessment"),
            makeLesson("Friday", 5, "History", "Mr. Duc", "R.201", "history", "Modern History", "Timeline building", "No assessment"),
            makeLesson("Friday", 7, "Geography", "Ms. Linh", "R.202", "geography", "Population Studies", "Data analysis", "15-minute quiz"),
            makeLesson("Friday", 8, "Informatics", "Vu Minh", "Lab.3", "informatics", "Web Design", "HTML/CSS", "No assessment"),
            makeLesson("Friday", 10, "Art", "Ms. Hoa", "R.301", "art", "Sculpture", "3D modeling", "Project presentation"),
        ],
    },
    {
        title: "Tuần đánh giá",
        summary: "Trọng tâm: Tăng cường kiểm tra và bài kiểm tra 1 tiết.",
        lessons: [
            makeLesson("Monday", 1, "Mathematics", "Nguyen Van A", "R.101", "mathematics", "Trigonometric Functions", "New lesson + exercises", "15-minute quiz"),
            makeLesson("Monday", 2, "English", "Sarah Johnson", "R.103", "english", "Unit 7 - Reading", "Reading strategies", "Oral check"),
            makeLesson("Monday", 3, "History", "Mr. Duc", "R.201", "history", "Ancient Egypt", "Lecture + discussion", "No assessment"),
            makeLesson("Monday", 6, "Physics", "Tran Van B", "Lab.2", "physics", "AC Circuits", "Lab simulation", "One-period test"),
            makeLesson("Monday", 8, "Chemistry", "Le Van C", "Lab.1", "chemistry", "Reaction Rate", "Practice questions", "No assessment"),
            makeLesson("Monday", 9, "Biology", "Dr. Hoang", "Lab.2", "biology", "Genetics", "Punnett squares", "Oral check"),
            makeLesson("Tuesday", 1, "Literature", "Pham Thi D", "R.101", "literature", "Poetry Writing", "Creative writing", "Project review"),
            makeLesson("Tuesday", 4, "Geography", "Ms. Linh", "R.202", "geography", "Urbanization", "Case studies", "15-minute quiz"),
            makeLesson("Tuesday", 5, "Informatics", "Vu Minh", "Lab.3", "informatics", "Database Design", "SQL practice", "No assessment"),
            makeLesson("Tuesday", 7, "Music", "Mr. Nam", "Music Room", "music", "Modern Jazz", "Genre exploration", "No assessment"),
            makeLesson("Tuesday", 10, "Art", "Ms. Hoa", "R.301", "art", "Digital Art", "Software tutorial", "Portfolio review"),
            makeLesson("Wednesday", 2, "Mathematics", "Nguyen Van A", "R.101", "mathematics", "Calculus Intro", "Limit concepts", "No assessment"),
            makeLesson("Wednesday", 3, "Physical Education", "Coach Tung", "Gym", "pe", "Basketball", "Game practice", "Practical test"),
            makeLesson("Wednesday", 4, "Civic Education", "Ms. Huong", "R.203", "civic", "Social Justice", "Debate", "One-period test"),
            makeLesson("Wednesday", 6, "Chemistry", "Le Van C", "Lab.1", "chemistry", "Organic Basics", "New lesson", "Oral check"),
            makeLesson("Wednesday", 8, "History", "Mr. Duc", "R.201", "history", "Industrial Revolution", "Primary sources", "No assessment"),
            makeLesson("Thursday", 1, "Biology", "Dr. Hoang", "Lab.2", "biology", "Evolution", "Comparative study", "15-minute quiz"),
            makeLesson("Thursday", 2, "English", "Sarah Johnson", "R.103", "english", "Unit 7 - Vocabulary", "Word games", "Oral check"),
            makeLesson("Thursday", 5, "Geography", "Ms. Linh", "R.202", "geography", "Ecosystems", "Field notes review", "No assessment"),
            makeLesson("Thursday", 7, "Informatics", "Vu Minh", "Lab.3", "informatics", "Cybersecurity", "Security principles", "No assessment"),
            makeLesson("Thursday", 9, "Physics", "Tran Van B", "R.102", "physics", "Quantum Physics", "Lecture", "One-period test"),
            makeLesson("Friday", 1, "Mathematics", "Nguyen Van A", "R.101", "mathematics", "Vectors", "Vector operations", "No assessment"),
            makeLesson("Friday", 3, "Literature", "Pham Thi D", "R.101", "literature", "Novel Analysis", "Book discussion", "No assessment"),
            makeLesson("Friday", 4, "Music", "Mr. Nam", "Music Room", "music", "Composition", "Create simple pieces", "Portfolio check"),
            makeLesson("Friday", 6, "Art", "Ms. Hoa", "R.301", "art", "Art History", "Historical movements", "Essay review"),
            makeLesson("Friday", 8, "Civic Education", "Ms. Huong", "R.203", "civic", "Environmental Ethics", "Case analysis", "No assessment"),
            makeLesson("Friday", 10, "Physical Education", "Coach Tung", "Gym", "pe", "Volleyball", "Team sport", "Practical test"),
        ],
    },
    {
        title: "Tuần củng cố",
        summary: "Trọng tâm: Ôn tập tổng hợp và hoàn thành nhiệm vụ cuối kỳ.",
        lessons: [
            makeLesson("Monday", 1, "English", "Sarah Johnson", "R.103", "english", "Unit 7 - Writing", "Guided writing", "No assessment"),
            makeLesson("Monday", 2, "Physics", "Tran Van B", "Lab.2", "physics", "Mixed Problem Solving", "Team challenge", "No assessment"),
            makeLesson("Monday", 3, "Chemistry", "Le Van C", "Lab.1", "chemistry", "Lab Safety Review", "Review session", "15-minute quiz"),
            makeLesson("Monday", 5, "History", "Mr. Duc", "R.201", "history", "Century Review", "Timeline summary", "No assessment"),
            makeLesson("Monday", 7, "Geography", "Ms. Linh", "R.202", "geography", "World Atlas", "Map review", "Oral check"),
            makeLesson("Monday", 10, "Biology", "Dr. Hoang", "Lab.2", "biology", "Biosphere Review", "Comprehensive review", "One-period test"),
            makeLesson("Tuesday", 1, "Mathematics", "Nguyen Van A", "R.101", "mathematics", "Equation Systems", "Problem review", "No assessment"),
            makeLesson("Tuesday", 2, "Literature", "Pham Thi D", "R.101", "literature", "Genre Review", "All genres", "No assessment"),
            makeLesson("Tuesday", 4, "Informatics", "Vu Minh", "Lab.3", "informatics", "Project Showcase", "Final projects", "Portfolio review"),
            makeLesson("Tuesday", 6, "Music", "Mr. Nam", "Music Room", "music", "Year in Review", "Student performances", "Performance test"),
            makeLesson("Tuesday", 8, "Art", "Ms. Hoa", "R.301", "art", "Gallery Walk", "Student exhibition", "Exhibition review"),
            makeLesson("Tuesday", 9, "Physical Education", "Coach Tung", "Gym", "pe", "Sports Day Prep", "Multi-sport", "Practical test"),
            makeLesson("Wednesday", 1, "Chemistry", "Le Van C", "Lab.1", "chemistry", "Chapter Summary", "Comprehensive review", "Oral check"),
            makeLesson("Wednesday", 3, "English", "Sarah Johnson", "R.103", "english", "Listening Consolidation", "Audio practice", "15-minute quiz"),
            makeLesson("Wednesday", 4, "Civic Education", "Ms. Huong", "R.203", "civic", "Rights & Duties", "Summary", "No assessment"),
            makeLesson("Wednesday", 5, "History", "Mr. Duc", "R.201", "history", "Modern Era", "Period summary", "No assessment"),
            makeLesson("Wednesday", 7, "Geography", "Ms. Linh", "R.202", "geography", "Global Challenges", "Discussion", "One-period test"),
            makeLesson("Wednesday", 10, "Mathematics", "Nguyen Van A", "R.101", "mathematics", "Advanced Exercises", "In-class drill", "No assessment"),
            makeLesson("Thursday", 1, "Biology", "Dr. Hoang", "Lab.2", "biology", "Practical Skills", "Lab techniques", "No assessment"),
            makeLesson("Thursday", 2, "Physics", "Tran Van B", "Lab.2", "physics", "Force & Motion Review", "Worksheet review", "Oral check"),
            makeLesson("Thursday", 6, "Informatics", "Vu Minh", "Lab.3", "informatics", "Career in IT", "Industry talk", "No assessment"),
            makeLesson("Thursday", 8, "Music", "Mr. Nam", "Music Room", "music", "Concert Review", "Listen & discuss", "No assessment"),
            makeLesson("Thursday", 9, "Art", "Ms. Hoa", "R.301", "art", "Future Projects", "Goal setting", "No assessment"),
            makeLesson("Friday", 1, "Literature", "Pham Thi D", "R.101", "literature", "Reading Reflection", "Personal essay", "Essay review"),
            makeLesson("Friday", 3, "English", "Sarah Johnson", "R.103", "english", "Speaking Final", "Presentations", "One-period test"),
            makeLesson("Friday", 4, "Civic Education", "Ms. Huong", "R.203", "civic", "Community Service", "Planning session", "No assessment"),
            makeLesson("Friday", 5, "History", "Mr. Duc", "R.201", "history", "Project Presentations", "Student projects", "Project review"),
            makeLesson("Friday", 7, "Geography", "Ms. Linh", "R.202", "geography", "Research Showcase", "Final presentations", "Presentation review"),
            makeLesson("Friday", 10, "Physical Education", "Coach Tung", "Gym", "pe", "Annual Sports Day", "All sports", "Practical test"),
        ],
    },
];

function getStartOfIsoWeek(date) {
    const result = new Date(date);
    const day = result.getDay() || 7;
    result.setHours(0, 0, 0, 0);
    result.setDate(result.getDate() - day + 1);
    return result;
}

function toWeekInputValue(mondayDate) {
    const date = getStartOfIsoWeek(mondayDate);
    const thursday = new Date(date);
    thursday.setDate(date.getDate() + 3);

    const firstThursday = new Date(thursday.getFullYear(), 0, 4);
    const firstWeekStart = getStartOfIsoWeek(firstThursday);
    const week =
        1 + Math.round((thursday.getTime() - firstWeekStart.getTime()) / 604800000);

    return `${thursday.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function formatDate(date) {
    return date.toLocaleDateString("vi-VN");
}

function getMonthLabel(mondayDate, fridayDate) {
    const startMonth = mondayDate.toLocaleString("vi-VN", { month: "long" });
    const endMonth = fridayDate.toLocaleString("vi-VN", { month: "long" });
    const startYear = mondayDate.getFullYear();
    const endYear = fridayDate.getFullYear();

    if (startMonth === endMonth && startYear === endYear) {
        return `${startMonth} ${startYear}`;
    }
    if (startYear === endYear) {
        return `${startMonth} – ${endMonth} ${startYear}`;
    }
    return `${startMonth} ${startYear} – ${endMonth} ${endYear}`;
}

function getTemplateForWeek(weekValue) {
    const weekNumber = Number(weekValue.split("-W")[1]);
    const index = Number.isNaN(weekNumber)
        ? 0
        : (weekNumber - 1) % weekTemplates.length;

    return weekTemplates[index];
}

function getWeeksForMonth(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let monday = getStartOfIsoWeek(firstDay);
    const weeks = [];
    while (monday <= lastDay) {
        weeks.push(new Date(monday));
        monday = new Date(monday);
        monday.setDate(monday.getDate() + 7);
    }
    return weeks;
}

function shouldShowAssessmentAlert(assessment) {
    const normalized = (assessment || "").trim().toLowerCase();

    return (
        normalized === "45-minute test" ||
        normalized === "45-min test" ||
        normalized === "one-period test" ||
        normalized === "kiểm tra 45 phút" ||
        normalized === "kiểm tra 1 tiết" ||
        normalized === "midterm" ||
        normalized === "final exam"
    );
}

function getAssessmentIcon(assessment) {
    if (!shouldShowAssessmentAlert(assessment)) {
        return null;
    }
    return <AssignmentRoundedIcon className="assessment-icon" />;
}

export default function StudentSchedule() {
    const [selectedWeekStart, setSelectedWeekStart] = useState(
        () => getStartOfIsoWeek(new Date())
    );
    const [pickerOpen, setPickerOpen] = useState(false);
    const [viewMonth, setViewMonth] = useState(() => {
        const now = getStartOfIsoWeek(new Date());
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const pickerWrapperRef = useRef(null);

    // Close picker when clicking outside
    useEffect(() => {
        if (!pickerOpen) return;
        const handler = (e) => {
            if (pickerWrapperRef.current && !pickerWrapperRef.current.contains(e.target)) {
                setPickerOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [pickerOpen]);

    // Sync viewMonth when navigating with Prev/Next buttons
    useEffect(() => {
        const next = new Date(selectedWeekStart.getFullYear(), selectedWeekStart.getMonth(), 1);
        setViewMonth(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedWeekStart.getFullYear(), selectedWeekStart.getMonth()]);

    const changeViewMonth = (offset) => {
        setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const selectedWeek = useMemo(
        () => toWeekInputValue(selectedWeekStart),
        [selectedWeekStart]
    );

    const { monday, friday, monthLabel } = useMemo(() => {
        const mondayDate = getStartOfIsoWeek(selectedWeekStart);
        const fridayDate = new Date(mondayDate);
        fridayDate.setDate(mondayDate.getDate() + 4);

        return {
            monday: formatDate(mondayDate),
            friday: formatDate(fridayDate),
            monthLabel: getMonthLabel(mondayDate, fridayDate),
        };
    }, [selectedWeekStart]);

    const weekTemplate = useMemo(
        () => getTemplateForWeek(selectedWeek),
        [selectedWeek]
    );

    const changeWeek = (offset) => {
        setSelectedWeekStart((prev) => {
            const next = new Date(prev);
            next.setDate(next.getDate() + offset * 7);
            return getStartOfIsoWeek(next);
        });
    };

    const getLesson = (day, period) =>
        weekTemplate.lessons.find((item) => item.day === day && item.period === period);

    return (
        <div className="student-schedule-page">
            <ScheduleHeader />

            <ScheduleToolbar
                monthLabel={monthLabel}
                monday={monday}
                friday={friday}
                pickerOpen={pickerOpen}
                pickerWrapperRef={pickerWrapperRef}
                setPickerOpen={setPickerOpen}
                changeWeek={changeWeek}
                changeViewMonth={changeViewMonth}
                viewMonth={viewMonth}
                selectedWeekStart={selectedWeekStart}
                getWeeksForMonth={getWeeksForMonth}
                toWeekInputValue={toWeekInputValue}
                getStartOfIsoWeek={getStartOfIsoWeek}
                setSelectedWeekStart={setSelectedWeekStart}
                setViewMonth={setViewMonth}
            />

            <ScheduleGrid
                days={days}
                periods={periods}
                getLesson={getLesson}
                getAssessmentIcon={getAssessmentIcon}
            />
        </div>
    );
}