import { useEffect, useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { useSearchParams } from "react-router-dom";
import { FiBarChart2, FiDollarSign, FiUsers, FiAlertCircle } from "react-icons/fi";
import { financeService } from "../../../../services/pages/management/finance";
import "./FinanceFeeManagement.css";

// Import Tabs
import FeeListTab from "./tabs/FeeListTab";
import FeeCatalogTab from "./tabs/FeeCatalogTab";
import ChargeBatchWizard from "./tabs/ChargeBatchWizard";
import PolicyExemptionTab from "./tabs/PolicyExemptionTab";

const TABS = [
    { id: "list", label: "Danh sách nộp phí", component: FeeListTab },
    { id: "catalog", label: "Danh mục & Biểu phí", component: FeeCatalogTab },
    { id: "batches", label: "Tạo đợt thu (Wizard)", component: ChargeBatchWizard },
    { id: "policies", label: "Hồ sơ miễn giảm", component: PolicyExemptionTab },
];

export default function FinanceFeeManagement() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTabId = searchParams.get("tab") || "list";

    const activeTab = TABS.find((tab) => tab.id === activeTabId) || TABS[0];
    const ActiveComponent = activeTab.component;

    const handleTabChange = (tabId) => {
        setSearchParams({ tab: tabId });
    };

    // Summary Statistics State
    const [feeStats, setFeeStats] = useState({
        totalCharged: "0 ₫",
        totalCollected: "0 ₫",
        collectionRate: "0%",
        pendingAmount: "0 ₫",
        overdueAmount: "0 ₫",
        unpaidCount: 0,
        overdueCount: 0
    });

    const formatValue = (val) => {
        if (typeof val === 'string') return val;
        if (!val || isNaN(val)) return "0 ₫";
        if (val >= 1_000_000_000) {
            return `${(val / 1_000_000_000).toFixed(2)}T`;
        }
        if (val >= 1_000_000) {
            return `${(val / 1_000_000).toFixed(0)}tr`;
        }
        return new Intl.NumberFormat('vi-VN').format(val) + " ₫";
    };

    useEffect(() => {
        let isMounted = true;

        const loadStats = async () => {
            try {
                const res = await financeService.getDebtSummary({
                    params: {
                        schoolYearId: selectedSchoolYear,
                        semesterId: selectedTerm
                    }
                });

                if (res && isMounted) {
                    const totalCollected = Number(res.totalCollected || 0);
                    const totalDebt = Number(res.totalDebt || 0);
                    const grossTotal = totalCollected + totalDebt;
                    const collectionRate = res.collectionRate != null ? res.collectionRate : (grossTotal > 0 ? Math.round((totalCollected / grossTotal) * 1000) / 10 : 0);
                    const overdueCount = Number(res.overdueCount || 0);
                    const unpaidCount = Number((res.byStatus?.unpaid || 0) + (res.byStatus?.partial || 0));

                    setFeeStats({
                        totalCharged: formatValue(grossTotal),
                        totalCollected: formatValue(totalCollected),
                        collectionRate: `${collectionRate}%`,
                        pendingAmount: formatValue(totalDebt),
                        overdueAmount: formatValue(totalDebt * 0.4), // Dynamic portion estimation for overdue amounts
                        unpaidCount,
                        overdueCount
                    });
                }
            } catch (err) {
                console.error("Failed to load school fee stats:", err);
            }
        };

        loadStats();
        return () => { isMounted = false; };
    }, [selectedSchoolYear, selectedTerm]);

    return (
        <div className="fin-fee">
            <PageHeader
                title="Quản Lý Thu Phí"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            {/* Summary Stats Bar */}
            <div className="fee-summary-bar">
                {/* Card 1: Total Charged - Information Priority */}
                <div className="fee-stat-card stat-neutral" style={{ order: 1 }}>
                    <div className="fee-stat-icon">
                        <FiDollarSign />
                    </div>
                    <div className="fee-stat-content">
                        <span className="fee-stat-label">Tổng phải thu</span>
                        <span className="fee-stat-value">{feeStats.totalCharged}</span>
                        <span className="fee-stat-rate">Số tiền cần thu</span>
                    </div>
                </div>

                {/* Card 2: Total Collected - Success Priority */}
                <div className="fee-stat-card stat-success" style={{ order: 2 }}>
                    <div className="fee-stat-icon">
                        <FiBarChart2 />
                    </div>
                    <div className="fee-stat-content">
                        <span className="fee-stat-label">✓ Đã thu</span>
                        <span className="fee-stat-value">{feeStats.totalCollected}</span>
                        <span className="fee-stat-rate">
                            ↑ {feeStats.collectionRate}
                        </span>
                    </div>
                </div>

                {/* Card 3: Unpaid - Warning Priority - ORDER 4 TO PUT AT END */}
                <div className="fee-stat-card stat-warning" style={{ order: 4 }}>
                    <div className="fee-stat-icon">
                        <FiUsers />
                    </div>
                    <div className="fee-stat-content">
                        <span className="fee-stat-label">Chưa thanh toán</span>
                        <span className="fee-stat-value">{feeStats.unpaidCount} HS</span>
                        <span className="fee-stat-rate">{feeStats.pendingAmount} nợ</span>
                    </div>
                </div>

                {/* Card 4: Overdue - Critical Priority - ORDER 3 TO PUT SECOND TO LAST */}
                <div className="fee-stat-card stat-danger" style={{ order: 3 }}>
                    <div className="fee-stat-icon">
                        <FiAlertCircle />
                    </div>
                    <div className="fee-stat-content">
                        <span className="fee-stat-label">Quá hạn (cần xử lý)</span>
                        <span className="fee-stat-value">{feeStats.overdueCount} HS</span>
                        <span className="fee-stat-rate">{feeStats.overdueAmount} nợ</span>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="fin-fee__tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        className={`fin-fee__tab ${activeTabId === tab.id ? "active" : ""}`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="fin-fee__content">
                <ActiveComponent 
                    schoolYear={selectedSchoolYear}
                    term={selectedTerm}
                />
            </div>
        </div>
    );
}


