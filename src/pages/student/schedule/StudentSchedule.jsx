import React, { useEffect, useMemo, useRef, useState } from "react";
import "./StudentSchedule.css";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import WbTwilightRoundedIcon from "@mui/icons-material/WbTwilightRounded";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

const days = [
    { key: "Monday", label: "MON" },
    { key: "Tuesday", label: "TUE" },
    { key: "Wednesday", label: "WED" },
    { key: "Thursday", label: "THU" },
    { key: "Friday", label: "FRI" },
];

const periods = [
    { period: 1, start: "07:00", end: "07:45", session: "Morning" },
    { period: 2, start: "07:50", end: "08:35", session: "Morning" },
    { period: 3, start: "08:45", end: "09:30", session: "Morning" },
    { period: 4, start: "09:40", end: "10:25", session: "Morning" },
    { period: 5, start: "10:35", end: "11:20", session: "Morning" },
    { period: 6, start: "13:00", end: "13:45", session: "Afternoon" },
    { period: 7, start: "13:50", end: "14:35", session: "Afternoon" },
    { period: 8, start: "14:45", end: "15:30", session: "Afternoon" },
    { period: 9, start: "15:40", end: "16:25", session: "Afternoon" },
    { period: 10, start: "16:35", end: "17:20", session: "Afternoon" },
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
        title: "Foundation Week",
        summary: "Focus: New concepts with light oral checks.",
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
        title: "Assessment Week",
        summary: "Focus: Frequent checks and one-period tests.",
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
        title: "Consolidation Week",
        summary: "Focus: Review sessions and final wrap-up tasks.",
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
    return date.toLocaleDateString("en-GB");
}

function getMonthLabel(mondayDate, fridayDate) {
    const startMonth = mondayDate.toLocaleString("en-US", { month: "long" });
    const endMonth = fridayDate.toLocaleString("en-US", { month: "long" });
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

    const { monday, friday, monthLabel, weekNumber } = useMemo(() => {
        const mondayDate = getStartOfIsoWeek(selectedWeekStart);
        const fridayDate = new Date(mondayDate);
        fridayDate.setDate(mondayDate.getDate() + 4);

        const wn = Number(toWeekInputValue(mondayDate).split("-W")[1]);

        return {
            monday: formatDate(mondayDate),
            friday: formatDate(fridayDate),
            monthLabel: getMonthLabel(mondayDate, fridayDate),
            weekNumber: wn,
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
            <div className="schedule-page-header">
                <div className="schedule-title-row">
                    <h1>Class Schedule</h1>
                    <p className="schedule-inline-subtitle">
                        Weekly timetable for <span className="schedule-class-name">Grade 10A1</span>
                    </p>
                </div>
            </div>

            <div className="schedule-week-bar">
                <div className="schedule-week-info">
                    <CalendarMonthRoundedIcon className="week-icon" />
                    <div className="week-info-text">
                        <span className="week-month-label">{monthLabel}</span>
                        <span className="week-date-range">
                            {monday} – {friday} • Grade 10A1
                        </span>
                    </div>
                </div>

                <div className="schedule-week-picker">
                    <label htmlFor="weekPicker">Select week</label>
                    <div className="schedule-week-controls">
                        <button type="button" onClick={() => changeWeek(-1)}>
                            <FiChevronLeft /> Previous
                        </button>

                        <div
                            className={`week-input-wrapper${pickerOpen ? " open" : ""}`}
                            ref={pickerWrapperRef}
                            onClick={() => setPickerOpen(prev => !prev)}
                        >
                            <CalendarMonthRoundedIcon className="week-input-cal-icon" />
                            <span className="week-input-week">Week {weekNumber}</span>
                            <span className="week-input-sep">·</span>
                            <span className="week-input-month">{monthLabel}</span>

                            {pickerOpen && (
                                <div className="week-picker-popup" onClick={e => e.stopPropagation()}>
                                    <div className="week-picker-header">
                                        <button type="button" className="week-picker-nav" aria-label="Previous month" onClick={() => changeViewMonth(-1)}>
                                            <MdChevronLeft />
                                        </button>
                                        <span className="week-picker-title">
                                            {viewMonth.toLocaleString("en-US", { month: "long" })} {viewMonth.getFullYear()}
                                        </span>
                                        <button type="button" className="week-picker-nav" aria-label="Next month" onClick={() => changeViewMonth(1)}>
                                            <MdChevronRight />
                                        </button>
                                    </div>

                                    <div className="week-picker-day-names">
                                        <span>Wk</span>
                                        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => (
                                            <span key={d}>{d}</span>
                                        ))}
                                    </div>

                                    {getWeeksForMonth(viewMonth.getFullYear(), viewMonth.getMonth()).map((weekMon) => {
                                        const weekDays = Array.from({ length: 7 }, (_, i) => {
                                            const d = new Date(weekMon);
                                            d.setDate(weekMon.getDate() + i);
                                            return d;
                                        });
                                        const wn = Number(toWeekInputValue(weekMon).split("-W")[1]);
                                        const isSelected = weekMon.getTime() === getStartOfIsoWeek(selectedWeekStart).getTime();
                                        const todayStr = new Date().toDateString();

                                        return (
                                            <div
                                                key={weekMon.toISOString()}
                                                className={`week-picker-row${isSelected ? " selected" : ""}`}
                                                onClick={() => {
                                                    setSelectedWeekStart(new Date(weekMon));
                                                    setPickerOpen(false);
                                                }}
                                            >
                                                <span className="week-picker-wn">{wn}</span>
                                                {weekDays.map((d, i) => (
                                                    <span
                                                        key={i}
                                                        className={[
                                                            "week-picker-day-num",
                                                            d.getMonth() !== viewMonth.getMonth() ? "other" : "",
                                                            d.toDateString() === todayStr ? "today" : "",
                                                        ].filter(Boolean).join(" ")}
                                                    >
                                                        {d.getDate()}
                                                    </span>
                                                ))}
                                            </div>
                                        );
                                    })}

                                    <div className="week-picker-footer">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const now = getStartOfIsoWeek(new Date());
                                                setSelectedWeekStart(now);
                                                setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                                                setPickerOpen(false);
                                            }}
                                        >
                                            This week
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button type="button" onClick={() => changeWeek(1)}>
                            Next <FiChevronRight />
                        </button>
                    </div>
                </div>
            </div>


            <div className="schedule-board-wrapper">
            <div className="schedule-board-scroller">
            <div className="schedule-board">
                <div className="schedule-grid schedule-grid-header">
                    <div className="grid-head time-head">PERIOD / DAY</div>
                    {days.map((day) => (
                        <div key={day.key} className="grid-head">
                            {day.label}
                        </div>
                    ))}
                </div>

                {periods.map((p, idx) => {
                    const isFirstMorning =
                        p.session === "Morning" &&
                        (idx === 0 || periods[idx - 1].session !== "Morning");
                    const isFirstAfternoon =
                        p.session === "Afternoon" &&
                        (idx === 0 || periods[idx - 1].session === "Morning");

                    return (
                        <React.Fragment key={p.period}>
                            {isFirstMorning && (
                                <div className="schedule-session-divider morning-divider">
                                    <div className="session-div-line" />
                                    <div className="session-div-chip morning-chip">
                                        <WbSunnyRoundedIcon className="session-div-icon" />
                                        <span className="session-div-label">Morning</span>
                                        <span className="session-div-badge">Periods 1–5</span>
                                    </div>
                                    <div className="session-div-line" />
                                </div>
                            )}
                            {isFirstAfternoon && (
                                <div className="schedule-session-divider afternoon-divider">
                                    <div className="session-div-line afternoon-line" />
                                    <div className="session-div-chip afternoon-chip">
                                        <WbTwilightRoundedIcon className="session-div-icon" />
                                        <span className="session-div-label">Afternoon</span>
                                        <span className="session-div-badge">Periods 6–10</span>
                                    </div>
                                    <div className="session-div-line afternoon-line" />
                                </div>
                            )}

                            <div className={`schedule-grid schedule-grid-row ${p.session === "Morning" ? "session-morning" : "session-afternoon"}`}>
                                <div className="time-cell">
                                    <div className="period-label">Period {p.period}</div>
                                    <div className="period-time">
                                        {p.start} - {p.end}
                                    </div>
                                </div>

                                {days.map((day) => {
                                    const lesson = getLesson(day.key, p.period);

                                    return (
                                        <div className="lesson-cell" key={`${day.key}-${p.period}`}>
                                            {lesson ? (
                                                <div className={`lesson-pill ${lesson.color}`}>
                                                    <div className="lesson-header">
                                                        <div className="lesson-subject">{lesson.subject}</div>
                                                        {getAssessmentIcon(lesson.assessment)}
                                                    </div>
                                                    <div className="lesson-room">{lesson.room}</div>

                                                    <div className="lesson-extra">
                                                        <span>
                                                            <SchoolRoundedIcon />
                                                            {lesson.teacher}
                                                        </span>
                                                        <span>
                                                            <AccessTimeRoundedIcon />
                                                            {lesson.start} - {lesson.end}
                                                        </span>
                                                    </div>

                                                    <div className="lesson-tooltip">
                                                        <p>
                                                            <strong>Topic:</strong> {lesson.lessonTopic}
                                                        </p>
                                                        <p>
                                                            <strong>Class activity:</strong> {lesson.activity}
                                                        </p>
                                                        <p>
                                                            <strong>Assessment:</strong> {lesson.assessment}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="lesson-empty">-</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
            </div>
            </div>
        </div>
    );
}