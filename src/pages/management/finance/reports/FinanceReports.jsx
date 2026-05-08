import { PageHeader, SchoolYearTermSelector } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { useMemo, useState } from "react";
import { FiPieChart, FiFileText, FiShield } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import "./FinanceReports.css";

// Components
import ReportsAnalytics from "./components/ReportsAnalytics";
import InvoiceCenter from "./components/InvoiceCenter";
import ComplianceBooks from "./components/ComplianceBooks";

const TABS = [
    { id: "analytics", label: "Phân tích nội bộ", icon: <FiPieChart /> },
    { id: "invoices", label: "Quản lý Hóa đơn", icon: <FiFileText /> },
    { id: "compliance", label: "Sổ sách chuẩn TT24", icon: <FiShield /> },
];

const SOURCE_BREAKDOWN = [
    { id: "tuition", name: "Học phí chính", percent: 62, amount: 8125000000, color: "#2563eb" },
    { id: "boarding", name: "Dịch vụ bán trú", percent: 23, amount: 3015000000, color: "#16a34a" },
    { id: "service", name: "Thu hộ - hoạt động", percent: 15, amount: 1960000000, color: "#f59e0b" },
];

const PERFORMANCE_ITEMS = [
    { id: "tuition-core", name: "Học phí chính quy", category: "tuition", collected: 10000000000, debt: 350000000, dueSoon: 120000000, collectionRate: 97 },
    { id: "facility", name: "Phí cơ sở vật chất", category: "tuition", collected: 1450000000, debt: 180000000, dueSoon: 75000000, collectionRate: 89 },
    { id: "boarding", name: "Dịch vụ bán trú", category: "boarding", collected: 2870000000, debt: 320000000, dueSoon: 140000000, collectionRate: 90 },
    { id: "transport", name: "Dịch vụ xe đưa đón", category: "service", collected: 980000000, debt: 230000000, dueSoon: 91000000, collectionRate: 81 },
    { id: "clubs", name: "Câu lạc bộ ngoại khóa", category: "service", collected: 760000000, debt: 145000000, dueSoon: 64000000, collectionRate: 84 },
];

const CASHFLOW_ITEMS = [
    { month: "Th08", inflow: 1500000000, outflow: 710000000 },
    { month: "Th09", inflow: 1680000000, outflow: 890000000 },
    { month: "Th10", inflow: 1320000000, outflow: 780000000 },
    { month: "Th11", inflow: 1240000000, outflow: 960000000 },
    { month: "Th12", inflow: 1080000000, outflow: 1180000000 },
    { month: "Th01", inflow: 1430000000, outflow: 840000000 },
];

const RISK_ITEMS = [
    {
        id: "risk-overdue-group12",
        issue: "Khối 12 có nợ quá hạn tăng 14%",
        impact: "Mức rủi ro cao",
        action: "Kích hoạt nhắc nợ nhiều kênh và ưu tiên đối soát học sinh nợ từ 2 kỳ.",
        owner: "Tổ công nợ học vụ",
        status: "danger",
    },
    {
        id: "risk-cashflow-dec",
        issue: "Dòng tiền ròng tháng 12 âm",
        impact: "Cần theo dõi",
        action: "Rà soát kế hoạch chi, lùi các khoản chưa cấp thiết sang đầu kỳ sau.",
        owner: "Kế toán trưởng",
        status: "warning",
    },
    {
        id: "risk-service-gap",
        issue: "Nhóm dịch vụ có tỷ lệ thu thấp",
        impact: "Mức trung bình",
        action: "Bổ sung thông báo nhắc đóng theo từng lớp và mốc đến hạn.",
        owner: "Nhân sự phụ trách thu phí",
        status: "neutral",
    },
];

const CATEGORY_OPTIONS = [
    { id: "all", label: "Tất cả khoản thu" },
    { id: "tuition", label: "Nhóm học phí" },
    { id: "boarding", label: "Nhóm bán trú" },
    { id: "service", label: "Nhóm dịch vụ" },
];

const SORT_OPTIONS = [
    { id: "debt", label: "Sắp xếp theo công nợ" },
    { id: "collected", label: "Sắp xếp theo đã thu" },
    { id: "rate", label: "Sắp xếp theo tỷ lệ thu" },
];

const formatCurrency = (value) => `${value.toLocaleString("vi-VN")} ₫`;

const formatCompact = (value) => {
    if (Math.abs(value) >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)} tỷ`;
    }
    if (Math.abs(value) >= 1000000) {
        return `${Math.round(value / 1000000)} triệu`;
    }
    return `${value.toLocaleString("vi-VN")} ₫`;
};

export default function FinanceReports() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "analytics";
    const [scope, setScope] = useState("all");
    const [sortBy, setSortBy] = useState("debt");
    const [searchQuery, setSearchQuery] = useState("");

    const handleTabChange = (tabId) => {
        setSearchParams({ tab: tabId });
    };

    const filteredPerformance = useMemo(() => {
        const normalizedSearch = searchQuery.trim().toLowerCase();

        const baseList = PERFORMANCE_ITEMS.filter((item) => {
            const matchesScope = scope === "all" || item.category === scope;
            const matchesSearch = normalizedSearch.length === 0 || item.name.toLowerCase().includes(normalizedSearch);
            return matchesScope && matchesSearch;
        });

        const sorters = {
            debt: (a, b) => b.debt - a.debt,
            collected: (a, b) => b.collected - a.collected,
            rate: (a, b) => b.collectionRate - a.collectionRate,
        };

        return [...baseList].sort(sorters[sortBy] || sorters.debt);
    }, [scope, searchQuery, sortBy]);

    const totals = useMemo(() => {
        const totalRevenue = SOURCE_BREAKDOWN.reduce((sum, item) => sum + item.amount, 0);
        const totalCollected = PERFORMANCE_ITEMS.reduce((sum, item) => sum + item.collected, 0);
        const totalDebt = PERFORMANCE_ITEMS.reduce((sum, item) => sum + item.debt, 0);
        const dueSoon = PERFORMANCE_ITEMS.reduce((sum, item) => sum + item.dueSoon, 0);
        const avgRate = Math.round(PERFORMANCE_ITEMS.reduce((sum, item) => sum + item.collectionRate, 0) / PERFORMANCE_ITEMS.length);

        return { totalRevenue, totalCollected, totalDebt, dueSoon, avgRate };
    }, []);

    const doughnutStops = useMemo(() => {
        let start = 0;
        return SOURCE_BREAKDOWN.map((item) => {
            const end = start + item.percent;
            const stop = `${item.color} ${start}% ${end}%`;
            start = end;
            return stop;
        }).join(", ");
    }, []);

    const maxCashFlow = useMemo(() => {
        const maxValue = CASHFLOW_ITEMS.reduce((max, item) => Math.max(max, item.inflow, item.outflow), 0);
        return maxValue <= 0 ? 1 : maxValue;
    }, []);

    return (
        <div className="fin-reports">
            <PageHeader
                title="Báo Cáo & Công Khai Tài Chính"
                eyebrow="Quản lý hóa đơn điện tử và các mẫu biểu kế toán nhà nước"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="fin-reports__tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        className={`fin-reports__tab ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>


            <div className="fin-reports__content report-content">
                {activeTab === "analytics" && (
                    <ReportsAnalytics
                        totals={totals}
                        sourceBreakdown={SOURCE_BREAKDOWN}
                        doughnutStops={doughnutStops}
                        filteredPerformance={filteredPerformance}
                        categoryOptions={CATEGORY_OPTIONS}
                        cashFlow={CASHFLOW_ITEMS}
                        maxCashFlow={maxCashFlow}
                        riskItems={RISK_ITEMS}
                        scope={scope}
                        sortBy={sortBy}
                        searchQuery={searchQuery}
                        onScopeChange={setScope}
                        onSortByChange={setSortBy}
                        onSearchChange={setSearchQuery}
                        sortOptions={SORT_OPTIONS}
                        formatCurrency={formatCurrency}
                        formatCompact={formatCompact}
                    />
                )}

                {activeTab === "invoices" && <InvoiceCenter />}
                {activeTab === "compliance" && <ComplianceBooks />}
            </div>
        </div>
    );
}


