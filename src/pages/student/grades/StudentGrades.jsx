import React, { useMemo, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import "./StudentGrades.css";

/* =========================
   HÀM TÍNH ĐIỂM CHUẨN
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
    if (avg >= 8) return "Tốt";
    if (avg >= 6.5) return "Khá";
    if (avg >= 5) return "Trung bình";
    return "Yếu";
}

function getTrend(hk1Avg, hk2Avg) {
    if (hk2Avg > hk1Avg) return "up";
    if (hk2Avg < hk1Avg) return "down";
    return "same";
}

function getRankColorClass(rank) {
    if (rank === "Tốt") return "rank-good";
    if (rank === "Khá") return "rank-fair";
    if (rank === "Trung bình") return "rank-average";
    return "rank-weak";
}

function getSummaryColorClass(rank) {
    if (rank === "Tốt") return "green";
    if (rank === "Khá") return "orange";
    if (rank === "Trung bình") return "blue";
    return "red";
}

/* =========================
   DỮ LIỆU GỐC
========================= */
const rawGradeData = {
    "10A1 - Năm học 2024-2025": [
        {
            id: 1,
            name: "Toán",
            className: "Lớp 10A1",
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
            name: "Vật lý",
            className: "Lớp 10A1",
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
            name: "Hóa học",
            className: "Lớp 10A1",
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
            name: "Ngữ văn",
            className: "Lớp 10A1",
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
            name: "Tiếng Anh",
            className: "Lớp 10A1",
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

    "11A1 - Năm học 2025-2026": [
        {
            id: 1,
            name: "Toán",
            className: "Lớp 11A1",
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
            name: "Vật lý",
            className: "Lớp 11A1",
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
            name: "Hóa học",
            className: "Lớp 11A1",
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
            name: "Ngữ văn",
            className: "Lớp 11A1",
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
            name: "Tiếng Anh",
            className: "Lớp 11A1",
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

    "12A1 - Năm học 2026-2027": [
        {
            id: 1,
            name: "Toán",
            className: "Lớp 12A1",
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
            name: "Vật lý",
            className: "Lớp 12A1",
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
            name: "Hóa học",
            className: "Lớp 12A1",
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
            name: "Ngữ văn",
            className: "Lớp 12A1",
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
            name: "Tiếng Anh",
            className: "Lớp 12A1",
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
   CHUẨN HÓA DỮ LIỆU
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
            <h1 className="grades-title">Kết quả học tập</h1>

            <div className="grades-note">
                <p>
                    Công thức tính TBHK:{" "}
                    <strong>
                        (Miệng 1 + Miệng 2 + 15p 1 + 15p 2 + Giữa kỳ × 2 + Cuối kỳ × 3) / 9
                    </strong>
                </p>
                <p>
                    Công thức tính TBCN: <strong>(TBHK1 + TBHK2 × 2) / 3</strong>
                </p>
            </div>

            <div className="grades-filter">
                <label htmlFor="classSelect">Chọn lớp:</label>
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

            <div className="grades-stats">
                <div className="grades-card">
                    <h2 className="blue">{currentData.average.toFixed(2)}</h2>
                    <p>Điểm trung bình cả năm</p>
                </div>

                <div className="grades-card">
                    <h2 className={getSummaryColorClass(currentData.conduct)}>
                        {currentData.conduct}
                    </h2>
                    <p>Học lực</p>
                </div>

                <div className="grades-card">
                    <h2 className="green">{currentData.subjectCount}</h2>
                    <p>Môn học</p>
                </div>
            </div>

            <div className="grades-tabs">
                <button
                    className={activeTab === "hk1" ? "active" : ""}
                    onClick={() => setActiveTab("hk1")}
                    type="button"
                >
                    Học kỳ 1
                </button>

                <button
                    className={activeTab === "hk2" ? "active" : ""}
                    onClick={() => setActiveTab("hk2")}
                    type="button"
                >
                    Học kỳ 2
                </button>

                <button
                    className={activeTab === "year" ? "active" : ""}
                    onClick={() => setActiveTab("year")}
                    type="button"
                >
                    Cả năm
                </button>
            </div>

            <div className="grades-table">
                <div className="table-header">
                    <span>Môn học</span>
                    <span>TBHK1</span>
                    <span>TBHK2</span>
                    <span>{activeTab === "year" ? "TBCN" : "Hiển thị"}</span>
                    <span>Tiến độ</span>
                    <span>Học lực</span>
                    <span>Chi tiết</span>
                </div>

                {currentData.subjects.map((subject) => (
                    <React.Fragment key={`${selectedClass}-${subject.id}`}>
                        <div className="table-row">
                            <div className="subject">
                                <div className="subject-icon">{subject.name[0]}</div>
                                <div>
                                    <b>{subject.name}</b>
                                    <p>{subject.className}</p>
                                </div>
                            </div>

                            <span>{subject.hk1Avg.toFixed(2)}</span>
                            <span>{subject.hk2Avg.toFixed(2)}</span>
                            <span className="total">{getDisplayedValue(subject)}</span>

                            <span
                                className={
                                    subject.trend === "up"
                                        ? "up"
                                        : subject.trend === "down"
                                            ? "down"
                                            : "same"
                                }
                            >
                {subject.trend === "up"
                    ? "↗"
                    : subject.trend === "down"
                        ? "↘"
                        : "→"}
              </span>

                            <span className={`rank ${getRankColorClass(subject.rank)}`}>
                {subject.rank}
              </span>

                            <button
                                className={`detail-toggle ${openRowId === subject.id ? "open" : ""}`}
                                onClick={() => toggleRow(subject.id)}
                                type="button"
                                aria-label="Xem chi tiết"
                            >
                                <FiChevronDown />
                            </button>
                        </div>

                        {openRowId === subject.id && (
                            <div className="table-detail-row">
                                <div className="detail-panels">
                                    <div className="detail-card">
                                        <h3>Học kỳ 1</h3>

                                        <div className="detail-item">
                                            <span>Miệng 1</span>
                                            <strong>{subject.hk1.oral1}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Miệng 2</span>
                                            <strong>{subject.hk1.oral2}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>15 phút 1</span>
                                            <strong>{subject.hk1.test15_1}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>15 phút 2</span>
                                            <strong>{subject.hk1.test15_2}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Giữa kỳ 1</span>
                                            <strong>{subject.hk1.midterm}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Cuối kỳ 1</span>
                                            <strong>{subject.hk1.final}</strong>
                                        </div>

                                        <div className="detail-divider" />

                                        <div className="detail-item detail-average">
                                            <span>TBHK1</span>
                                            <strong>{subject.hk1Avg.toFixed(2)}</strong>
                                        </div>
                                    </div>

                                    <div className="detail-card">
                                        <h3>Học kỳ 2</h3>

                                        <div className="detail-item">
                                            <span>Miệng 1</span>
                                            <strong>{subject.hk2.oral1}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Miệng 2</span>
                                            <strong>{subject.hk2.oral2}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>15 phút 1</span>
                                            <strong>{subject.hk2.test15_1}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>15 phút 2</span>
                                            <strong>{subject.hk2.test15_2}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Giữa kỳ 2</span>
                                            <strong>{subject.hk2.midterm}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Cuối kỳ 2</span>
                                            <strong>{subject.hk2.final}</strong>
                                        </div>

                                        <div className="detail-divider" />

                                        <div className="detail-item detail-average">
                                            <span>TBHK2</span>
                                            <strong>{subject.hk2Avg.toFixed(2)}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="year-summary-card">
                                    <div className="year-summary-item">
                                        <span>Điểm cả năm</span>
                                        <strong>{subject.yearAvg.toFixed(2)}</strong>
                                    </div>

                                    <div className="year-summary-item">
                                        <span>Học lực</span>
                                        <strong>{subject.rank}</strong>
                                    </div>

                                    <div className="year-summary-item">
                                        <span>Công thức</span>
                                        <strong>(TBHK1 + TBHK2 × 2) / 3</strong>
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