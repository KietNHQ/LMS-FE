import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import {
    BiTrendingUp,
    BiTrendingDown,
    BiMinus,
    BiBook,
    BiWorld,
    BiLeaf,
} from "react-icons/bi";
import {
    FaSquareRootAlt,
    FaAtom,
    FaFlask,
    FaBookOpen,
    FaLanguage,
    FaGraduationCap,
    FaLaptopCode,
    FaGlobeAsia,
    FaDumbbell,
    FaPalette,
    FaMusic,
    FaMicroscope,
} from "react-icons/fa";
import "./StudentGrades.css";
import GradesHeader from "./components/GradesHeader/GradesHeader";

/* =========================
   HÀM HỖ TRỢ TÍNH ĐIỂM
========================= */
function round2(num) {
    return Number(num.toFixed(2));
}

function calculateSemesterAverage(semester) {
    const midtermScore = semester.midterm ?? 0;
    const test45Score = semester.test45 ?? midtermScore;

    const total =
        semester.oral1 +
        semester.oral2 +
        semester.test15_1 +
        semester.test15_2 +
        test45Score +
        midtermScore * 2 +
        semester.final * 3;

    return round2(total / 10);
}

function calculateYearAverage(hk1Avg, hk2Avg) {
    return round2((hk1Avg + hk2Avg * 2) / 3);
}

function getAcademicRank(avg) {
    if (avg >= 8) return "Giỏi";
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
    if (rank === "Giỏi") return "rank-good";
    if (rank === "Khá") return "rank-fair";
    if (rank === "Trung bình") return "rank-average";
    return "rank-weak";
}

function getSummaryColorClass(rank) {
    if (rank === "Giỏi") return "green";
    if (rank === "Khá") return "orange";
    if (rank === "Trung bình") return "blue";
    return "red";
}

const subjectIconMap = {
    toán: FaSquareRootAlt,
    "vật lý": FaAtom,
    "hóa học": FaFlask,
    "ngữ văn": FaBookOpen,
    "tiếng anh": FaLanguage,
    "sinh học": FaMicroscope,
    "lịch sử": BiBook,
    "địa lý": FaGlobeAsia,
    "tin học": FaLaptopCode,
    "giáo dục công dân": BiWorld,
    "thể dục": FaDumbbell,
    "mỹ thuật": FaPalette,
    "âm nhạc": FaMusic,
    "công nghệ": BiLeaf,
};

function getSubjectIcon(subjectName) {
    const normalizedName = subjectName.trim().toLowerCase();
    return subjectIconMap[normalizedName] || FaGraduationCap;
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
            hk1: { oral1: 8, oral2: 9, test15_1: 8, test15_2: 7, midterm: 8, final: 9 },
            hk2: { oral1: 9, oral2: 8, test15_1: 8, test15_2: 9, midterm: 8, final: 9 },
        },
        {
            id: 2,
            name: "Vật lý",
            className: "Lớp 10A1",
            hk1: { oral1: 7, oral2: 8, test15_1: 7, test15_2: 8, midterm: 7, final: 8 },
            hk2: { oral1: 8, oral2: 8, test15_1: 8, test15_2: 7, midterm: 8, final: 8 },
        },
        {
            id: 3,
            name: "Hóa học",
            className: "Lớp 10A1",
            hk1: { oral1: 6, oral2: 7, test15_1: 6, test15_2: 7, midterm: 6, final: 7 },
            hk2: { oral1: 7, oral2: 7, test15_1: 7, test15_2: 7, midterm: 7, final: 7 },
        },
        {
            id: 4,
            name: "Ngữ văn",
            className: "Lớp 10A1",
            hk1: { oral1: 7, oral2: 7, test15_1: 7, test15_2: 7, midterm: 7, final: 7 },
            hk2: { oral1: 6, oral2: 7, test15_1: 6, test15_2: 7, midterm: 6, final: 7 },
        },
        {
            id: 5,
            name: "Tiếng Anh",
            className: "Lớp 10A1",
            hk1: { oral1: 8, oral2: 9, test15_1: 8, test15_2: 9, midterm: 8, final: 9 },
            hk2: { oral1: 9, oral2: 10, test15_1: 9, test15_2: 9, midterm: 9, final: 9 },
        },
        {
            id: 6,
            name: "Sinh học",
            className: "Lớp 10A1",
            hk1: { oral1: 7, oral2: 8, test15_1: 7, test15_2: 8, midterm: 7, final: 8 },
            hk2: { oral1: 8, oral2: 8, test15_1: 8, test15_2: 8, midterm: 8, final: 8 },
        },
        {
            id: 7,
            name: "Lịch sử",
            className: "Lớp 10A1",
            hk1: { oral1: 8, oral2: 8, test15_1: 7, test15_2: 8, midterm: 8, final: 8 },
            hk2: { oral1: 8, oral2: 9, test15_1: 8, test15_2: 8, midterm: 8, final: 9 },
        },
        {
            id: 8,
            name: "Địa lý",
            className: "Lớp 10A1",
            hk1: { oral1: 7, oral2: 7, test15_1: 8, test15_2: 8, midterm: 7, final: 8 },
            hk2: { oral1: 8, oral2: 8, test15_1: 8, test15_2: 9, midterm: 8, final: 8 },
        },
        {
            id: 9,
            name: "Tin học",
            className: "Lớp 10A1",
            hk1: { oral1: 8, oral2: 9, test15_1: 9, test15_2: 8, midterm: 8, final: 9 },
            hk2: { oral1: 9, oral2: 9, test15_1: 9, test15_2: 9, midterm: 9, final: 9 },
        },
    ],

    "11A1 - Năm học 2025-2026": [
        {
            id: 1,
            name: "Toán",
            className: "Lớp 11A1",
            hk1: { oral1: 8, oral2: 8, test15_1: 8, test15_2: 9, midterm: 8, final: 9 },
            hk2: { oral1: 9, oral2: 9, test15_1: 8, test15_2: 9, midterm: 9, final: 9 },
        },
        {
            id: 2,
            name: "Vật lý",
            className: "Lớp 11A1",
            hk1: { oral1: 8, oral2: 8, test15_1: 8, test15_2: 8, midterm: 8, final: 8 },
            hk2: { oral1: 8, oral2: 9, test15_1: 8, test15_2: 8, midterm: 8, final: 9 },
        },
        {
            id: 3,
            name: "Hóa học",
            className: "Lớp 11A1",
            hk1: { oral1: 7, oral2: 8, test15_1: 7, test15_2: 8, midterm: 8, final: 8 },
            hk2: { oral1: 8, oral2: 8, test15_1: 8, test15_2: 8, midterm: 8, final: 8 },
        },
        {
            id: 4,
            name: "Ngữ văn",
            className: "Lớp 11A1",
            hk1: { oral1: 7, oral2: 8, test15_1: 7, test15_2: 7, midterm: 7, final: 8 },
            hk2: { oral1: 8, oral2: 8, test15_1: 7, test15_2: 8, midterm: 8, final: 8 },
        },
        {
            id: 5,
            name: "Tiếng Anh",
            className: "Lớp 11A1",
            hk1: { oral1: 9, oral2: 9, test15_1: 8, test15_2: 9, midterm: 9, final: 9 },
            hk2: { oral1: 9, oral2: 9, test15_1: 9, test15_2: 9, midterm: 9, final: 9 },
        },
        {
            id: 6,
            name: "Sinh học",
            className: "Lớp 11A1",
            hk1: { oral1: 8, oral2: 8, test15_1: 7, test15_2: 8, midterm: 8, final: 8 },
            hk2: { oral1: 8, oral2: 9, test15_1: 8, test15_2: 9, midterm: 8, final: 9 },
        },
        {
            id: 7,
            name: "Lịch sử",
            className: "Lớp 11A1",
            hk1: { oral1: 7, oral2: 8, test15_1: 8, test15_2: 7, midterm: 8, final: 8 },
            hk2: { oral1: 8, oral2: 8, test15_1: 8, test15_2: 8, midterm: 8, final: 8 },
        },
        {
            id: 8,
            name: "Địa lý",
            className: "Lớp 11A1",
            hk1: { oral1: 7, oral2: 8, test15_1: 7, test15_2: 8, midterm: 7, final: 8 },
            hk2: { oral1: 8, oral2: 8, test15_1: 8, test15_2: 8, midterm: 8, final: 8 },
        },
        {
            id: 9,
            name: "Tin học",
            className: "Lớp 11A1",
            hk1: { oral1: 9, oral2: 8, test15_1: 8, test15_2: 9, midterm: 8, final: 9 },
            hk2: { oral1: 9, oral2: 9, test15_1: 9, test15_2: 9, midterm: 9, final: 9 },
        },
    ],

    "12A1 - Năm học 2026-2027": [
        {
            id: 1,
            name: "Toán",
            className: "Lớp 12A1",
            hk1: { oral1: 9, oral2: 9, test15_1: 8, test15_2: 9, midterm: 9, final: 9 },
            hk2: { oral1: 9, oral2: 10, test15_1: 9, test15_2: 9, midterm: 9, final: 10 },
        },
        {
            id: 2,
            name: "Vật lý",
            className: "Lớp 12A1",
            hk1: { oral1: 8, oral2: 9, test15_1: 8, test15_2: 8, midterm: 8, final: 9 },
            hk2: { oral1: 9, oral2: 9, test15_1: 8, test15_2: 9, midterm: 9, final: 9 },
        },
        {
            id: 3,
            name: "Hóa học",
            className: "Lớp 12A1",
            hk1: { oral1: 8, oral2: 8, test15_1: 8, test15_2: 8, midterm: 8, final: 8 },
            hk2: { oral1: 8, oral2: 9, test15_1: 8, test15_2: 8, midterm: 8, final: 9 },
        },
        {
            id: 4,
            name: "Ngữ văn",
            className: "Lớp 12A1",
            hk1: { oral1: 8, oral2: 8, test15_1: 7, test15_2: 8, midterm: 8, final: 8 },
            hk2: { oral1: 8, oral2: 8, test15_1: 8, test15_2: 8, midterm: 8, final: 8 },
        },
        {
            id: 5,
            name: "Tiếng Anh",
            className: "Lớp 12A1",
            hk1: { oral1: 9, oral2: 9, test15_1: 9, test15_2: 9, midterm: 9, final: 9 },
            hk2: { oral1: 9, oral2: 10, test15_1: 9, test15_2: 10, midterm: 9, final: 10 },
        },
        {
            id: 6,
            name: "Sinh học",
            className: "Lớp 12A1",
            hk1: { oral1: 8, oral2: 8, test15_1: 8, test15_2: 9, midterm: 8, final: 8 },
            hk2: { oral1: 9, oral2: 9, test15_1: 9, test15_2: 9, midterm: 9, final: 9 },
        },
        {
            id: 7,
            name: "Lịch sử",
            className: "Lớp 12A1",
            hk1: { oral1: 8, oral2: 8, test15_1: 8, test15_2: 8, midterm: 8, final: 9 },
            hk2: { oral1: 9, oral2: 8, test15_1: 9, test15_2: 9, midterm: 8, final: 9 },
        },
        {
            id: 8,
            name: "Địa lý",
            className: "Lớp 12A1",
            hk1: { oral1: 8, oral2: 8, test15_1: 7, test15_2: 8, midterm: 8, final: 8 },
            hk2: { oral1: 8, oral2: 9, test15_1: 8, test15_2: 9, midterm: 8, final: 9 },
        },
        {
            id: 9,
            name: "Tin học",
            className: "Lớp 12A1",
            hk1: { oral1: 9, oral2: 9, test15_1: 9, test15_2: 8, midterm: 9, final: 9 },
            hk2: { oral1: 10, oral2: 9, test15_1: 9, test15_2: 10, midterm: 9, final: 10 },
        },
    ],
};

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
    const [activeTab, setActiveTab] = useState("hk1");
    const [classDropdownOpen, setClassDropdownOpen] = useState(false);

    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setClassDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const currentData = useMemo(() => gradeData[selectedClass], [selectedClass]);

    const summaryAverage = useMemo(() => {
        if (!currentData?.subjects?.length) return 0;

        const total = currentData.subjects.reduce((sum, subject) => {
            if (activeTab === "hk1") return sum + subject.hk1Avg;
            if (activeTab === "hk2") return sum + subject.hk2Avg;
            return sum + subject.yearAvg;
        }, 0);

        return round2(total / currentData.subjects.length);
    }, [currentData, activeTab]);

    const summaryAverageLabel =
        activeTab === "hk1"
            ? "Điểm trung bình học kỳ 1"
            : activeTab === "hk2"
                ? "Điểm trung bình học kỳ 2"
                : "Điểm trung bình cả năm";

    const toggleRow = (id) => {
        setOpenRowId((prev) => (prev === id ? null : id));
    };

    const getDisplayedValue = (subject) => {
        if (activeTab === "hk1") return subject.hk1Avg.toFixed(2);
        if (activeTab === "hk2") return subject.hk2Avg.toFixed(2);
        return subject.yearAvg.toFixed(2);
    };

    const getDisplayedLabel = () => {
        if (activeTab === "hk1") return "TB HK1";
        if (activeTab === "hk2") return "TB HK2";
        return "TB cả năm";
    };

    return (
        <div className="grades-page">
            <GradesHeader title="Kết quả học tập" />

            <div className="grades-toolbar">
                <div className="grades-filter">
                    <div className="filter-box">
                        <label>Chọn lớp học</label>

                        <div className="custom-dropdown" ref={dropdownRef}>
                            <button
                                type="button"
                                className={`custom-dropdown-trigger ${classDropdownOpen ? "open" : ""}`}
                                onClick={() => setClassDropdownOpen((prev) => !prev)}
                            >
                                <span>{selectedClass}</span>
                                <FiChevronDown className="dropdown-arrow" />
                            </button>

                            <div className={`custom-dropdown-menu ${classDropdownOpen ? "show" : ""}`}>
                                {classOptions.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        className={`custom-dropdown-item ${selectedClass === item ? "active" : ""}`}
                                        onClick={() => {
                                            setSelectedClass(item);
                                            setOpenRowId(1);
                                            setClassDropdownOpen(false);
                                        }}
                                    >
                                        <span>{item}</span>
                                        {selectedClass === item && <FiCheck />}
                                    </button>
                                ))}
                            </div>
                        </div>
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
            </div>

            <div className="grades-stats">
                <div className="grades-card">
                    <h2 className="blue">{summaryAverage.toFixed(2)}</h2>
                    <p>{summaryAverageLabel}</p>
                </div>

                <div className="grades-card">
                    <h2 className={getSummaryColorClass(currentData.conduct)}>
                        {currentData.conduct}
                    </h2>
                    <p>Xếp loại học lực</p>
                </div>

                <div className="grades-card">
                    <h2 className="green">{currentData.subjectCount}</h2>
                    <p>Số môn học</p>
                </div>
            </div>

            <div className="grades-table">
                <div className="table-header">
                    <span>Môn học</span>
                    <span>TB HK1</span>
                    <span>TB HK2</span>
                    <span>{getDisplayedLabel()}</span>
                    <span className="progress-header">Tiến độ</span>
                    <span>Xếp loại</span>
                    <span>Chi tiết</span>
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
                                aria-label="Xem chi tiết"
                            >
                                <FiChevronDown />
                            </button>
                        </div>

                        <div className={`detail-collapse ${openRowId === subject.id ? "expanded" : ""}`}>
                            <div className="table-detail-row">
                                <div className="detail-panels">
                                    <div className="detail-card">
                                        <h3>Học kỳ 1</h3>

                                        <div className="detail-item">
                                            <span>Điểm miệng 1</span>
                                            <strong>{subject.hk1.oral1}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Điểm miệng 2</span>
                                            <strong>{subject.hk1.oral2}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>15 phút lần 1</span>
                                            <strong>{subject.hk1.test15_1}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>15 phút lần 2</span>
                                            <strong>{subject.hk1.test15_2}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>1 tiết</span>
                                            <strong>{subject.hk1.test45 ?? subject.hk1.midterm}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Giữa kỳ</span>
                                            <strong>{subject.hk1.midterm}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Cuối kỳ</span>
                                            <strong>{subject.hk1.final}</strong>
                                        </div>

                                        <div className="detail-divider" />

                                        <div className="detail-item detail-average">
                                            <span>Điểm trung bình học kỳ 1</span>
                                            <strong>{subject.hk1Avg.toFixed(2)}</strong>
                                        </div>
                                    </div>

                                    <div className="detail-card">
                                        <h3>Học kỳ 2</h3>

                                        <div className="detail-item">
                                            <span>Điểm miệng 1</span>
                                            <strong>{subject.hk2.oral1}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Điểm miệng 2</span>
                                            <strong>{subject.hk2.oral2}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>15 phút lần 1</span>
                                            <strong>{subject.hk2.test15_1}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>15 phút lần 2</span>
                                            <strong>{subject.hk2.test15_2}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>1 tiết</span>
                                            <strong>{subject.hk2.test45 ?? subject.hk2.midterm}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Giữa kỳ</span>
                                            <strong>{subject.hk2.midterm}</strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Cuối kỳ</span>
                                            <strong>{subject.hk2.final}</strong>
                                        </div>

                                        <div className="detail-divider" />

                                        <div className="detail-item detail-average">
                                            <span>Điểm trung bình học kỳ 2</span>
                                            <strong>{subject.hk2Avg.toFixed(2)}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="year-summary-card">
                                    <div className="year-summary-item">
                                        <span>Điểm trung bình cả năm</span>
                                        <strong>{subject.yearAvg.toFixed(2)}</strong>
                                    </div>

                                    <div className="year-summary-item">
                                        <span>Xếp loại học lực</span>
                                        <strong>{subject.rank}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}