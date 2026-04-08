import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import CompetitionFilterSection from "./components/competitionFilterSection/competitionFilterSection";
import ClassCompetitionCard from "./components/classCompetitionCard/classCompetitionCard";
import CompetitionRulesModal from "./components/competitionRulesModal/competitionRulesModal";
import { FiSettings, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./AdminCompetition.css";

const MOCK_COMPETITION_DATA = [
    { id: 1, className: "10A1", teacher: "Cô Hoa", totalPoints: 95, rank: 1, trend: "up", grade: "10" },
    { id: 2, className: "10A2", teacher: "Thầy Bình", totalPoints: 88, rank: 3, trend: "stable", grade: "10" },
    { id: 3, className: "10A3", teacher: "Cô Cúc", totalPoints: 92, rank: 2, trend: "down", grade: "10" },
    { id: 4, className: "11B1", teacher: "Cô Đào", totalPoints: 85, rank: 5, trend: "up", grade: "11" },
    { id: 5, className: "11B2", teacher: "Thầy Hùng", totalPoints: 90, rank: 4, trend: "stable", grade: "11" },
    { id: 6, className: "12C1", teacher: "Thầy Minh", totalPoints: 98, rank: 1, trend: "up", grade: "12" },
    { id: 7, className: "10A4", teacher: "Cô Lan", totalPoints: 82, rank: 6, trend: "down", grade: "10" },
    { id: 8, className: "10A5", teacher: "Thầy Tuấn", totalPoints: 87, rank: 4, trend: "up", grade: "10" },
    { id: 9, className: "11B3", teacher: "Cô Mai", totalPoints: 91, rank: 3, trend: "stable", grade: "11" },
    { id: 10, className: "11B4", teacher: "Thầy Nam", totalPoints: 84, rank: 6, trend: "down", grade: "11" },
    { id: 11, className: "12C2", teacher: "Cô Thu", totalPoints: 96, rank: 2, trend: "up", grade: "12" },
    { id: 12, className: "12C3", teacher: "Thầy Quân", totalPoints: 89, rank: 4, trend: "stable", grade: "12" },
    { id: 13, className: "10A6", teacher: "Cô Yến", totalPoints: 93, rank: 2, trend: "up", grade: "10" },
    { id: 14, className: "11B5", teacher: "Thầy Long", totalPoints: 86, rank: 5, trend: "down", grade: "11" },
];

const AdminCompetition = () => {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const navigate = useNavigate();

    const [selectedGrade, setSelectedGrade] = useState("Tất cả khối");
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
    
    const [competitionRules, setCompetitionRules] = useState({
        standardPoint: 100,
        attendance_violation: { unexcused: -15, late: -5, skip_class: -50, skip_period: -10 },
        discipline_violation: { uniform: -10, disorder: -20, swearing: -15, phone: -5, eating: -3, fighting: -25, bullying: -30 },
        property_violation: { damage: -20, vandalism: -10, littering: -3, no_electricity: -2 },
        academic_violation: { no_homework: -2, no_materials: -2, cheating: -50, no_extracurricular: -5 },
        attendance_reward: { month: 20, semester: 50, no_late_semester: 10 },
        academic_reward: { school: 30, province: 50, national: 100, improvement: 20, high_avg: 15 },
        activity_reward: { first_school: 20, second_school: 15, first_province: 50, national: 100, volunteer: 15, club: 10 },
        positive_reward: { found_lost: 20, report_risk: 5, role_model: 20, help_peers: 10, report_violation: 15 }
    });

    const ITEMS_PER_PAGE = 6;

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedGrade, searchQuery]);

    // Reset week when semester changes
    useEffect(() => {
        setSelectedWeek(selectedTerm === "hk1" ? 1 : 19);
    }, [selectedTerm]);

    const filteredData = useMemo(() => {
        return MOCK_COMPETITION_DATA.filter(item => {
            const matchesGrade = selectedGrade === "Tất cả khối" || item.grade === selectedGrade.replace("Khối ", "");
            const matchesSearch = item.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.teacher.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesGrade && matchesSearch;
        });
    }, [selectedGrade, searchQuery]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    return (
        <div className="admin-competition-page">
            <PageHeader
                title="Điểm Thi Đua Lớp Học"
                eyebrow="Quản lý nề nếp & thi đua"
                actions={
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <button className="config-rules-btn" onClick={() => setIsRulesModalOpen(true)}>
                            <FiSettings /> <span>Cấu hình điểm</span>
                        </button>
                        <SchoolYearTermSelector
                            selectedSchoolYear={selectedSchoolYear}
                            selectedTerm={selectedTerm}
                            onYearChange={handleYearArrow}
                            onTermChange={handleTermChange}
                        />
                    </div>
                }
            />

            <CompetitionFilterSection
                selectedGrade={selectedGrade}
                onGradeChange={setSelectedGrade}
                selectedTerm={selectedTerm}
                selectedWeek={selectedWeek}
                onWeekChange={setSelectedWeek}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <div className="competition-cards-grid">
                {paginatedData.map(item => (
                    <ClassCompetitionCard
                        key={item.id}
                        data={item}
                        onAdjust={() => navigate(`/admin/competition/${item.id}`)}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="admin-competition-pagination-row">
                    <div className="admin-competition-pagination">
                        <button
                            type="button"
                            className="admin-competition-page-btn"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage <= 1}
                        >
                            <FiChevronLeft />
                        </button>

                        <p className="admin-competition-page-indicator">
                            <span>{currentPage}</span>
                            <small>/ {totalPages}</small>
                        </p>

                        <button
                            type="button"
                            className="admin-competition-page-btn"
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage >= totalPages}
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
            )}

            {isRulesModalOpen && (
                <CompetitionRulesModal 
                    isOpen={isRulesModalOpen}
                    onClose={() => setIsRulesModalOpen(false)}
                    rules={competitionRules}
                    onSave={setCompetitionRules}
                />
            )}
        </div>
    );
};

export default AdminCompetition;
