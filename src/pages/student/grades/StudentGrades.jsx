import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiChevronDown } from "react-icons/fi";
import {
    BiTrendingUp,
    BiTrendingDown,
    BiMinus,
    BiBook,
    BiWorld,
    BiLeaf,
    BiTrophy,
    BiMedal,
    BiBarChartAlt2,
    BiSearch,
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
import GradeDetail from "./components/GradeDetail/GradeDetail";
import { Button, Select } from "../../../components/ui";
import { LoadingSpinner } from "../../../components/common";
import { studentService } from "../../../services/pages/student/studentService";

/* =========================
   HÀM HỖ TRỢ TÍNH ĐIỂM
========================= */
function round2(num) {
    return Number(num.toFixed(2));
}

function calculateSemesterAverage(semester) {
    if (!semester) return 0;
    if (typeof semester.averageScore === "number") {
        return semester.averageScore;
    }
    // Chấp nhận cả cấu trúc API phẳng hoặc lồng nhau
    const oral1 = semester.oral1 || semester.oral || 0;
    const oral2 = semester.oral2 || 0;
    const test15_1 = semester.test15_1 || semester.test15 || 0;
    const test15_2 = semester.test15_2 || 0;
    const midterm = semester.midterm || 0;
    const test45 = semester.test45 || midterm;
    const final = semester.final || 0;

    const total =
        oral1 +
        oral2 +
        test15_1 +
        test15_2 +
        test45 +
        midterm * 2 +
        final * 3;

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
    const normalizedName = subjectName?.trim().toLowerCase() || "";
    return subjectIconMap[normalizedName] || FaGraduationCap;
}

export default function StudentGrades() {
    const [openRowId, setOpenRowId] = useState(null);
    const [activeTab, setActiveTab] = useState("hk1");
    const [selectedSchoolYear, setSelectedSchoolYear] = useState(null);

    const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
    const studentId = storedUser?.profile?.id;

    // Fetch school years
    const { data: schoolYears = [] } = useQuery({
        queryKey: ["school-years"],
        queryFn: async () => {
            try {
                const response = await studentService.getSchoolYears({ mock: false });
                if (response.success && response.data) {
                    return response.data;
                }
            } catch (error) {
                console.warn("Failed to fetch school years");
            }
            return [{ id: 1, name: "2025-2026" }, { id: 2, name: "2024-2025" }];
        },
        staleTime: 60 * 60 * 1000,
    });

    useEffect(() => {
        if (schoolYears.length > 0 && !selectedSchoolYear) {
            setSelectedSchoolYear(schoolYears[0].id);
        }
    }, [schoolYears, selectedSchoolYear]);

    const selectedSchoolYearLabel = useMemo(() => {
        const matched = schoolYears.find((sy) => sy.id === selectedSchoolYear);
        return matched?.name || matched?.school_year_name || matched?.schoolYearName || matched?.year || "năm học này";
    }, [schoolYears, selectedSchoolYear]);

    // Use TanStack Query for grades
    const { data: gradesData = [], isLoading } = useQuery({
        queryKey: ["student-grades", studentId, selectedSchoolYear],
        queryFn: async () => {
            if (!studentId) return [];
            try {
                const response = await studentService.getStudentGradeSummary({ 
                    pathParams: { id: studentId },
                    mock: false,
                    params: { schoolYear: selectedSchoolYear },
                });
                
                if (response.success && response.data) {
                    return processGradesData(response.data);
                }
            } catch (error) {
                console.warn("Failed to fetch grades, using empty state.");
            }
            return [];
        },
        enabled: !!studentId && !!selectedSchoolYear,
        staleTime: 10 * 60 * 1000,
    });

    function processGradesData(data) {
            if (Array.isArray(data)) {
            return data.map(subject => {
                const hk1Avg = calculateSemesterAverage(subject.hk1);
                const hk2Avg = calculateSemesterAverage(subject.hk2);
                const yearAvg = calculateYearAverage(hk1Avg, hk2Avg);
                return {
                    ...subject,
                    hk1Avg,
                    hk2Avg,
                        yearAvg,
                    rank: getAcademicRank(yearAvg),
                    trend: getTrend(hk1Avg, hk2Avg)
                };
            });
        }
        if (Array.isArray(data.subjects)) {
            return data.subjects.map((subject) => {
                const hk1Avg = calculateSemesterAverage(subject.hk1);
                const hk2Avg = calculateSemesterAverage(subject.hk2);
                    const yearAvg = Number.isFinite(subject.yearAvg)
                        ? subject.yearAvg
                        : calculateYearAverage(hk1Avg, hk2Avg);
                    const yearIsComplete = subject.yearIsComplete === undefined ? (subject.year && subject.year.isComplete) : subject.yearIsComplete;

                return {
                    id: subject.id,
                    name: subject.name,
                    className: subject.className,
                    hk1: subject.hk1 || {},
                    hk2: subject.hk2 || {},
                    hk1Avg,
                    hk2Avg,
                        yearAvg,
                        yearIsComplete,
                    rank: getAcademicRank(yearAvg),
                    trend: getTrend(hk1Avg, hk2Avg),
                };
            });
        }
        return [];
    }

    const summaryStats = useMemo(() => {
        if (gradesData.length === 0) return { avg: 0, rank: "—", count: 0 };

        const total = gradesData.reduce((sum, s) => {
            if (activeTab === "hk1") return sum + (s.hk1Avg || 0);
            if (activeTab === "hk2") return sum + (s.hk2Avg || 0);
            return sum + (s.yearAvg || 0);
        }, 0);

        const avg = round2(total / gradesData.length);
        return {
            avg,
            rank: getAcademicRank(avg),
            count: gradesData.length
        };
    }, [gradesData, activeTab]);

    return (
        <div className="grades-page">
            <GradesHeader title="Kết quả học tập" />

            {isLoading ? (
                <div className="layout-loading-wrapper" style={{ minHeight: "400px" }}>
                    <LoadingSpinner size="lg" label="Đang tải bảng điểm..." role="student" />
                </div>
            ) : (
                <>
                    <div className="grades-toolbar">
                        <div className="grades-filter">
                            <Select
                                variant="custom"
                                className="grades-class-select"
                                label="Năm học"
                                value={selectedSchoolYear}
                                options={schoolYears.map(sy => ({ value: sy.id, label: sy.name || sy.school_year_name || sy.schoolYearName || sy.year }))}
                                onChange={(e) => setSelectedSchoolYear(Number(e.target.value))}
                            />
                        </div>

                        <div className="grades-tabs">
                            {["hk1", "hk2", "year"].map((tab) => (
                                <Button
                                    key={tab}
                                    variant={activeTab === tab ? "primary" : "secondary"}
                                    className={`grades-tab-btn ${activeTab === tab ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab === "hk1" ? "Học kỳ 1" : tab === "hk2" ? "Học kỳ 2" : "Cả năm"}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="grades-stats">
                        <div className="grades-card">
                            <div className="grades-card-icon icon-blue">
                                <BiBarChartAlt2 />
                            </div>
                            <div className="grades-card-content">
                                <h2 className="blue">{summaryStats.avg.toFixed(2)}</h2>
                                <p>{activeTab === "year" ? "TB Cả năm" : `TB Học kỳ ${activeTab === "hk1" ? "1" : "2"}`}</p>
                            </div>
                        </div>

                        <div className="grades-card">
                            <div className={`grades-card-icon ${summaryStats.rank === "Giỏi" ? "icon-gold" : "icon-silver"}`}>
                                {summaryStats.rank === "Giỏi" ? <BiTrophy /> : <BiMedal />}
                            </div>
                            <div className="grades-card-content">
                                <h2 className={summaryStats.rank === "Giỏi" ? "rank-good-text" : "rank-fair-text"}>
                                    {summaryStats.rank}
                                </h2>
                                <p>Xếp loại học lực</p>
                            </div>
                        </div>

                        <div className="grades-card">
                            <div className="grades-card-icon icon-green">
                                <BiBook />
                            </div>
                            <div className="grades-card-content">
                                <h2 className="green">{summaryStats.count}</h2>
                                <p>Số môn học</p>
                            </div>
                        </div>
                    </div>

                    <div className="grades-table">
                        <div className="table-header">
                            <span>Môn học</span>
                            <span>TB HK1</span>
                            <span>TB HK2</span>
                            <span>TB Tổng</span>
                            <span className="progress-header">Xu hướng</span>
                            <span>Xếp loại</span>
                            <span>Chi tiết</span>
                        </div>

                        {gradesData.length > 0 ? gradesData.map((subject) => (
                            <React.Fragment key={subject.id}>
                                <div className="table-row">
                                    <div className="subject">
                                        <div className="subject-icon">
                                            {React.createElement(getSubjectIcon(subject.name))}
                                        </div>
                                        <div>
                                            <b>{subject.name}</b>
                                            <p>{subject.className || "Lớp học"}</p>
                                        </div>
                                    </div>
                                    <span>{(subject.hk1Avg || 0).toFixed(2)}</span>
                                    <span>{(subject.hk2Avg || 0).toFixed(2)}</span>
                                    <span className="total">
                                        {(activeTab === "hk1" ? subject.hk1Avg : activeTab === "hk2" ? subject.hk2Avg : subject.yearAvg).toFixed(2)}
                                        {activeTab === "year" && subject.yearIsComplete === false && (
                                            <small style={{ marginLeft: 8, color: '#888' }}>(Tạm tính)</small>
                                        )}
                                    </span>
                                    <span className={`trend-cell ${subject.trend}`}>
                                        {subject.trend === "up" ? <BiTrendingUp /> : subject.trend === "down" ? <BiTrendingDown /> : <BiMinus />}
                                    </span>
                                    <span className={`rank rank-${subject.rank === "Giỏi" ? "good" : "fair"}`}>
                                        {subject.rank}
                                    </span>
                                    <button
                                        className={`detail-toggle ${openRowId === subject.id ? "open" : ""}`}
                                        onClick={() => setOpenRowId(openRowId === subject.id ? null : subject.id)}
                                    >
                                        <FiChevronDown />
                                    </button>
                                </div>
                                
                                {openRowId === subject.id && (
                                    <div className="detail-collapse expanded">
                                        <GradeDetail subject={subject} />
                                    </div>
                                )}
                            </React.Fragment>
                        )) : (
                            <div className="empty-table-state">
                                <div className="empty-state-icon">
                                    <BiSearch />
                                </div>
                                <div className="empty-state-content">
                                    <h3>Không có dữ liệu điểm</h3>
                                    <p>Bạn chưa có dữ liệu điểm trong {selectedSchoolYearLabel}.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

