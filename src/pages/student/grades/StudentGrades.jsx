import React, { useMemo, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { BiTrendingUp, BiTrendingDown, BiMinus } from "react-icons/bi";
import {
    FaSquareRootAlt,
    FaAtom,
    FaFlask,
    FaBookOpen,
    FaLanguage,
    FaGraduationCap,
} from "react-icons/fa";
import "./StudentGrades.css";

/* =========================
   GRADE CALCULATION HELPERS
========================= */
function round2(num) {
    return Number(num.toFixed(2));
}

function calculateSemesterAverage(semester) {
    const total =
        semester.oral1 +
        semester.oral2 +
        semester.test15_1 +
        semester.test15_2 +
        semester.midterm * 2 +
        semester.final * 3;

    return round2(total / 9);
}

function calculateYearAverage(hk1Avg, hk2Avg) {
    return round2((hk1Avg + hk2Avg * 2) / 3);
}

function getAcademicRank(avg) {
    if (avg >= 8) return "Excellent";
    if (avg >= 6.5) return "Good";
    if (avg >= 5) return "Average";
    return "Weak";
}

function getTrend(hk1Avg, hk2Avg) {
    if (hk2Avg > hk1Avg) return "up";
    if (hk2Avg < hk1Avg) return "down";
    return "same";
}

function getRankColorClass(rank) {
    if (rank === "Excellent") return "rank-good";
    if (rank === "Good") return "rank-fair";
    if (rank === "Average") return "rank-average";
    return "rank-weak";
}

function getSummaryColorClass(rank) {
    if (rank === "Excellent") return "green";
    if (rank === "Good") return "orange";
    if (rank === "Average") return "blue";
    return "red";
}

const subjectIconMap = {
    mathematics: FaSquareRootAlt,
    math: FaSquareRootAlt,
    physics: FaAtom,
    chemistry: FaFlask,
    literature: FaBookOpen,
    english: FaLanguage,
};

function getSubjectIcon(subjectName) {
    const normalizedName = subjectName.trim().toLowerCase();
    return subjectIconMap[normalizedName] || FaGraduationCap;
}

/* =========================
   RAW DATA
========================= */
const rawGradeData = {
    "10A1 - School Year 2024-2025": [
        {
            id: 1,
            name: "Mathematics",
            className: "Class 10A1",
            hk1: {
                oral1: 8,
                oral2: 9,
                test15_1: 8,
                test15_2: 7,
                midterm: 8,
                final: 9,
            },
            hk2: {
                oral1: 9,
                oral2: 8,
                test15_1: 8,
                test15_2: 9,
                midterm: 8,
                final: 9,
            },
        },
        {
            id: 2,
            name: "Physics",
            className: "Class 10A1",
            hk1: {
                oral1: 7,
                oral2: 8,
                test15_1: 7,
                test15_2: 8,
                midterm: 7,
                final: 8,
            },
            hk2: {
                oral1: 8,
                oral2: 8,
                test15_1: 8,
                test15_2: 7,
                midterm: 8,
                final: 8,
            },
        },
        {
            id: 3,
            name: "Chemistry",
            className: "Class 10A1",
            hk1: {
                oral1: 6,
                oral2: 7,
                test15_1: 6,
                test15_2: 7,
                midterm: 6,
                final: 7,
            },
            hk2: {
                oral1: 7,
                oral2: 7,
                test15_1: 7,
                test15_2: 7,
                midterm: 7,
                final: 7,
            },
        },
        {
            id: 4,
            name: "Literature",
            className: "Class 10A1",
            hk1: {
                oral1: 7,
                oral2: 7,
                test15_1: 7,
                test15_2: 7,
                midterm: 7,
                final: 7,
            },
            hk2: {
                oral1: 6,
                oral2: 7,
                test15_1: 6,
                test15_2: 7,
                midterm: 6,
                final: 7,
            },
        },
        {
            id: 5,
            name: "English",
            className: "Class 10A1",
            hk1: {
                oral1: 8,
                oral2: 9,
                test15_1: 8,
                test15_2: 9,
                midterm: 8,
                final: 9,
            },
            hk2: {
                oral1: 9,
                oral2: 10,
                test15_1: 9,
                test15_2: 9,
                midterm: 9,
                final: 9,
            },
        },
    ],

    "11A1 - School Year 2025-2026": [
        {
            id: 1,
            name: "Mathematics",
            className: "Class 11A1",
            hk1: {
                oral1: 8,
                oral2: 8,
                test15_1: 8,
                test15_2: 9,
                midterm: 8,
                final: 9,
            },
            hk2: {
                oral1: 9,
                oral2: 9,
                test15_1: 8,
                test15_2: 9,
                midterm: 9,
                final: 9,
            },
        },
        {
            id: 2,
            name: "Physics",
            className: "Class 11A1",
            hk1: {
                oral1: 8,
                oral2: 8,
                test15_1: 8,
                test15_2: 8,
                midterm: 8,
                final: 8,
            },
            hk2: {
                oral1: 8,
                oral2: 9,
                test15_1: 8,
                test15_2: 8,
                midterm: 8,
                final: 9,
            },
        },
        {
            id: 3,
            name: "Chemistry",
            className: "Class 11A1",
            hk1: {
                oral1: 7,
                oral2: 8,
                test15_1: 7,
                test15_2: 8,
                midterm: 8,
                final: 8,
            },
            hk2: {
                oral1: 8,
                oral2: 8,
                test15_1: 8,
                test15_2: 8,
                midterm: 8,
                final: 8,
            },
        },
        {
            id: 4,
            name: "Literature",
            className: "Class 11A1",
            hk1: {
                oral1: 7,
                oral2: 8,
                test15_1: 7,
                test15_2: 7,
                midterm: 7,
                final: 8,
            },
            hk2: {
                oral1: 8,
                oral2: 8,
                test15_1: 7,
                test15_2: 8,
                midterm: 8,
                final: 8,
            },
        },
        {
            id: 5,
            name: "English",
            className: "Class 11A1",
            hk1: {
                oral1: 9,
                oral2: 9,
                test15_1: 8,
                test15_2: 9,
                midterm: 9,
                final: 9,
            },
            hk2: {
                oral1: 9,
                oral2: 9,
                test15_1: 9,
                test15_2: 9,
                midterm: 9,
                final: 9,
            },
        },
    ],

    "12A1 - School Year 2026-2027": [
        {
            id: 1,
            name: "Mathematics",
            className: "Class 12A1",
            hk1: {
                oral1: 9,
                oral2: 9,
                test15_1: 8,
                test15_2: 9,
                midterm: 9,
                final: 9,
            },
            hk2: {
                oral1: 9,
                oral2: 10,
                test15_1: 9,
                test15_2: 9,
                midterm: 9,
                final: 10,
            },
        },
        {
            id: 2,
            name: "Physics",
            className: "Class 12A1",
            hk1: {
                oral1: 8,
                oral2: 9,
                test15_1: 8,
                test15_2: 8,
                midterm: 8,
                final: 9,
            },
            hk2: {
                oral1: 9,
                oral2: 9,
                test15_1: 8,
                test15_2: 9,
                midterm: 9,
                final: 9,
            },
        },
        {
            id: 3,
            name: "Chemistry",
            className: "Class 12A1",
            hk1: {
                oral1: 8,
                oral2: 8,
                test15_1: 8,
                test15_2: 8,
                midterm: 8,
                final: 8,
            },
            hk2: {
                oral1: 8,
                oral2: 9,
                test15_1: 8,
                test15_2: 8,
                midterm: 8,
                final: 9,
            },
        },
        {
            id: 4,
            name: "Literature",
            className: "Class 12A1",
            hk1: {
                oral1: 8,
                oral2: 8,
                test15_1: 7,
                test15_2: 8,
                midterm: 8,
                final: 8,
            },
            hk2: {
                oral1: 8,
                oral2: 8,
                test15_1: 8,
                test15_2: 8,
                midterm: 8,
                final: 8,
            },
        },
        {
            id: 5,
            name: "English",
            className: "Class 12A1",
            hk1: {
                oral1: 9,
                oral2: 9,
                test15_1: 9,
                test15_2: 9,
                midterm: 9,
                final: 9,
            },
            hk2: {
                oral1: 9,
                oral2: 10,
                test15_1: 9,
                test15_2: 10,
                midterm: 9,
                final: 10,
            },
        },
    ],
};

/* =========================
   COMPUTED DATA
========================= */
function buildComputedData(rawData) {
    const result = {};

    Object.entries(rawData).forEach(([classLabel, subjects]) => {
        const computedSubjects = subjects.map((subject) => {
            const hk1Avg = calculateSemesterAverage(subject.hk1);
            const hk2Avg = calculateSemesterAverage(subject.hk2);
            const yearAvg = calculateYearAverage(hk1Avg, hk2Avg);
            const rank = getAcademicRank(yearAvg);
            const trend = getTrend(hk1Avg, hk2Avg);

            return {
                ...subject,
                hk1Avg,
                hk2Avg,
                yearAvg,
                rank,
                trend,
            };
        });

        const classAverage =
            computedSubjects.reduce((sum, item) => sum + item.yearAvg, 0) /
            computedSubjects.length;

        const roundedClassAverage = round2(classAverage);

        result[classLabel] = {
            average: roundedClassAverage,
            conduct: getAcademicRank(roundedClassAverage),
            subjectCount: computedSubjects.length,
            subjects: computedSubjects,
        };
    });

    return result;
}

const gradeData = buildComputedData(rawGradeData);

export default function StudentGrades() {
    const classOptions = Object.keys(gradeData);
    const [selectedClass, setSelectedClass] = useState(classOptions[0]);
    const [openRowId, setOpenRowId] = useState(1);
    const [activeTab, setActiveTab] = useState("year");

    const currentData = useMemo(() => gradeData[selectedClass], [selectedClass]);

    const toggleRow = (id) => {
        setOpenRowId((prev) => (prev === id ? null : id));
    };

    const getDisplayedValue = (subject) => {
        if (activeTab === "hk1") return subject.hk1Avg.toFixed(2);
        if (activeTab === "hk2") return subject.hk2Avg.toFixed(2);
        return subject.yearAvg.toFixed(2);
    };

    return (
        <div className="grades-page">
            <h1 className="grades-title">Academic Results</h1>

            <div className="grades-toolbar">
                <div className="grades-filter">
                    <label htmlFor="classSelect">Select Class:</label>
                    <select
                        id="classSelect"
                        value={selectedClass}
                        onChange={(e) => {
                            setSelectedClass(e.target.value);
                            setOpenRowId(1);
                        }}
                    >
                        {classOptions.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grades-tabs">
                    <button
                        className={activeTab === "hk1" ? "active" : ""}
                        onClick={() => setActiveTab("hk1")}
                        type="button"
                    >
                        Semester 1
                    </button>

                    <button
                        className={activeTab === "hk2" ? "active" : ""}
                        onClick={() => setActiveTab("hk2")}
                        type="button"
                    >
                        Semester 2
                    </button>

                    <button
                        className={activeTab === "year" ? "active" : ""}
                        onClick={() => setActiveTab("year")}
                        type="button"
                    >
                        Full Year
                    </button>
                </div>
            </div>

            <div className="grades-stats">
                <div className="grades-card">
                    <h2 className="blue">{currentData.average.toFixed(2)}</h2>
                    <p>Year Average</p>
                </div>

                <div className="grades-card">
                    <h2 className={getSummaryColorClass(currentData.conduct)}>
                        {currentData.conduct}
                    </h2>
                    <p>Academic Rank</p>
                </div>

                <div className="grades-card">
                    <h2 className="green">{currentData.subjectCount}</h2>
                    <p>Subjects</p>
                </div>
            </div>

            <div className="grades-table">
                <div className="table-header">
                    <span>Subject</span>
                    <span>S1 Avg</span>
                    <span>S2 Avg</span>
                    <span>{activeTab === "year" ? "Year Avg" : "Displayed"}</span>
                    <span className="progress-header">Progress</span>
                    <span>Rank</span>
                    <span>Details</span>
                </div>

                {currentData.subjects.map((subject) => (
                    <React.Fragment key={`${selectedClass}-${subject.id}`}>
                        <div className="table-row">
                            <div className="subject">
                                <div className="subject-icon">
                                    {React.createElement(getSubjectIcon(subject.name))}
                                </div>
                                <div>
                                    <b>{subject.name}</b>
                                    <p>{subject.className}</p>
                                </div>
                            </div>

                            <span>{subject.hk1Avg.toFixed(2)}</span>
                            <span>{subject.hk2Avg.toFixed(2)}</span>
                            <span className="total">{getDisplayedValue(subject)}</span>

                            <span
                                className={`trend-cell ${
                                    subject.trend === "up"
                                        ? "up"
                                        : subject.trend === "down"
                                            ? "down"
                                            : "same"
                                }`}
                            >
                                {subject.trend === "up" ? (
                                    <BiTrendingUp />
                                ) : subject.trend === "down" ? (
                                    <BiTrendingDown />
                                ) : (
                                    <BiMinus />
                                )}
                            </span>

                            <span className={`rank ${getRankColorClass(subject.rank)}`}>
                                {subject.rank}
                            </span>

                            <button
                                className={`detail-toggle ${openRowId === subject.id ? "open" : ""}`}
                                onClick={() => toggleRow(subject.id)}
                                type="button"
                                aria-label="View details"
                            >
                                <FiChevronDown />
                            </button>
                        </div>

                        {openRowId === subject.id && (
                            <div className="table-detail-row">
                                <div className="detail-panels">
                                    <div className="detail-card">
                                        <h3>Semester 1</h3>

                                        <div className="detail-item">
                                            <span>Oral Test 1</span>
                                            <strong>{subject.hk1.oral1}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Oral Test 2</span>
                                            <strong>{subject.hk1.oral2}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>15-min Test 1</span>
                                            <strong>{subject.hk1.test15_1}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>15-min Test 2</span>
                                            <strong>{subject.hk1.test15_2}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Midterm</span>
                                            <strong>{subject.hk1.midterm}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Final Exam</span>
                                            <strong>{subject.hk1.final}</strong>
                                        </div>

                                        <div className="detail-divider" />

                                        <div className="detail-item detail-average">
                                            <span>Semester 1 Average</span>
                                            <strong>{subject.hk1Avg.toFixed(2)}</strong>
                                        </div>
                                    </div>

                                    <div className="detail-card">
                                        <h3>Semester 2</h3>

                                        <div className="detail-item">
                                            <span>Oral Test 1</span>
                                            <strong>{subject.hk2.oral1}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Oral Test 2</span>
                                            <strong>{subject.hk2.oral2}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>15-min Test 1</span>
                                            <strong>{subject.hk2.test15_1}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>15-min Test 2</span>
                                            <strong>{subject.hk2.test15_2}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Midterm</span>
                                            <strong>{subject.hk2.midterm}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Final Exam</span>
                                            <strong>{subject.hk2.final}</strong>
                                        </div>

                                        <div className="detail-divider" />

                                        <div className="detail-item detail-average">
                                            <span>Semester 2 Average</span>
                                            <strong>{subject.hk2Avg.toFixed(2)}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="year-summary-card">
                                    <div className="year-summary-item">
                                        <span>Full-Year Average</span>
                                        <strong>{subject.yearAvg.toFixed(2)}</strong>
                                    </div>

                                    <div className="year-summary-item">
                                        <span>Academic Rank</span>
                                        <strong>{subject.rank}</strong>
                                    </div>

                                    <div className="year-summary-item">
                                        <span>Formula</span>
                                        <strong>(S1 Avg + S2 Avg × 2) / 3</strong>
                                    </div>
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}