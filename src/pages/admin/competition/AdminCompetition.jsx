import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import CompetitionFilterSection from "./components/competitionFilterSection/competitionFilterSection";
import ClassCompetitionCard from "./components/classCompetitionCard/classCompetitionCard";
import CompetitionRulesModal from "./components/competitionRulesModal/competitionRulesModal";
import { FiSettings, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
    adminCompetitionService,
    DEFAULT_COMPETITION_RULES,
} from "../../../services/pages/admin/competition";
import "./AdminCompetition.css";

const AdminCompetition = () => {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const navigate = useNavigate();

    const [selectedGrade, setSelectedGrade] = useState("Tất cả khối");
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
    const [competitionData, setCompetitionData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState("");

    const [competitionRules, setCompetitionRules] = useState(DEFAULT_COMPETITION_RULES);
    const [rulesMapping, setRulesMapping] = useState({});

    const ITEMS_PER_PAGE = 6;

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedGrade, searchQuery]);

    // Reset week when semester changes
    useEffect(() => {
        setSelectedWeek(selectedTerm === "hk1" ? 1 : 19);
    }, [selectedTerm]);

    useEffect(() => {
        let isMounted = true;

        const fetchRanking = async () => {
            setIsLoading(true);
            setLoadError("");

            try {
                const rows = await adminCompetitionService.getClassRankings({
                    schoolYear: selectedSchoolYear,
                    term: selectedTerm,
                    week: selectedWeek,
                });

                if (!isMounted) return;
                setCompetitionData(rows);
            } catch (error) {
                if (!isMounted) return;
                setCompetitionData([]);
                setLoadError(error?.response?.data?.message || "Khong the tai du lieu thi dua.");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchRanking();

        return () => {
            isMounted = false;
        };
    }, [selectedSchoolYear, selectedTerm, selectedWeek]);

    useEffect(() => {
        let isMounted = true;

        const fetchPointConfig = async () => {
            try {
                const result = await adminCompetitionService.getPointConfig();
                if (!isMounted) return;
                setCompetitionRules(result.rules || DEFAULT_COMPETITION_RULES);
                setRulesMapping(result.mapping || {});
            } catch (_error) {
                if (!isMounted) return;
                setCompetitionRules(DEFAULT_COMPETITION_RULES);
                setRulesMapping({});
            }
        };

        fetchPointConfig();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSaveRules = async (nextRules) => {
        setCompetitionRules(nextRules);

        try {
            await adminCompetitionService.updatePointConfig(nextRules, rulesMapping);
        } catch (error) {
            window.alert(error?.response?.data?.message || "Khong the luu cau hinh diem len he thong.");
        }
    };

    const filteredData = useMemo(() => {
        return competitionData.filter(item => {
            const matchesGrade = selectedGrade === "Tất cả khối" || item.grade === selectedGrade.replace("Khối ", "");
            const matchesSearch = item.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.teacher.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesGrade && matchesSearch;
        });
    }, [competitionData, selectedGrade, searchQuery]);

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
                {isLoading && <div className="competition-empty-state">Dang tai du lieu thi dua...</div>}
                {!isLoading && loadError && <div className="competition-empty-state">{loadError}</div>}
                {!isLoading && !loadError && paginatedData.map(item => (
                    <ClassCompetitionCard
                        key={item.id}
                        data={item}
                        onAdjust={() => navigate(`/admin/competition/${item.id}`)}
                    />
                ))}
                {!isLoading && !loadError && paginatedData.length === 0 && (
                    <div className="competition-empty-state">Khong co du lieu phu hop bo loc.</div>
                )}
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
                    onSave={handleSaveRules}
                />
            )}
        </div>
    );
};

export default AdminCompetition;
