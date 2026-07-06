import { useEffect, useState, useCallback } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { useSearchParams } from "react-router-dom";
import { FiBarChart2, FiDollarSign, FiUsers, FiAlertCircle } from "react-icons/fi";
import { financeService } from "../../../../services/pages/management/finance";
import "./FinanceFeeManagement.css";

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

const formatCurrency = (v) =>
    typeof v === "number" ? v.toLocaleString("vi-VN") : parseFloat(v || 0).toLocaleString("vi-VN");

const formatCompact = (v) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)} tỷ`;
    if (v >= 1_000_000) return `${Math.round(v / 1_000_000)} triệu`;
    return `${formatCurrency(v)} đ`;
};

export default function FinanceFeeManagement() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTabId = searchParams.get("tab") || "list";

    const activeTab = TABS.find((tab) => tab.id === activeTabId) || TABS[0];
    const ActiveComponent = activeTab.component;

    const handleTabChange = (tabId) => {
        setSearchParams({ tab: tabId });
    };

    const [stats, setStats] = useState({
        totalCharged: "0 đ",
        totalCollected: "0 đ",
        collectionRate: "0%",
        pendingAmount: "0 đ",
        overdueAmount: "0 đ",
        unpaidCount: 0,
        overdueCount: 0,
    });
    const [isLoading, setIsLoading] = useState(false);

    const loadStats = useCallback(async () => {
        setIsLoading(true);
        try {
            console.log("[FinanceFeeMgmt] loadStats called with:", { schoolYearId: selectedSchoolYear, semesterId: selectedTerm });
            const res = await financeService.getDebtSummary({
                params: {
                    schoolYearId: selectedSchoolYear,
                    semesterId: selectedTerm,
                },
            });
            console.log("[FinanceFeeMgmt] summaryRes:", JSON.stringify(res, null, 2));

            const d = res?.data || {};
            const totalAmount = parseFloat(d.totalAmount || d.totalDebt || 0);
            const totalCollected = parseFloat(d.totalCollected || 0);
            const overdueAmount = parseFloat(d.overdueDebtAmount || d.overdueAmount || 0);
            const overdueCount = Number(d.overdueCount || 0);
            const byStatus = d.byStatus || {};
            const unpaidCount = Number(byStatus.unpaid || 0) + Number(byStatus.partial || 0);

            setStats({
                totalCharged: formatCompact(totalAmount),
                totalCollected: formatCompact(totalCollected),
                collectionRate: `${d.collectionRate || 0}%`,
                pendingAmount: formatCompact(totalAmount - totalCollected),
                overdueAmount: formatCompact(overdueAmount),
                unpaidCount,
                overdueCount,
            });
        } catch (err) {
            console.error("[FinanceFeeManagement] loadStats error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedSchoolYear, selectedTerm]);

    useEffect(() => { loadStats(); }, [loadStats]);

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
                <div className="fee-stat">
                    <div className="fee-stat__icon"><FiDollarSign /></div>
                    <div className="fee-stat__content">
                        <span>Tổng phải thu</span>
                        <strong>{stats.totalCharged}</strong>
                        <p>Số tiền cần thu</p>
                    </div>
                </div>

                <div className="fee-stat stat-success">
                    <div className="fee-stat__icon"><FiBarChart2 /></div>
                    <div className="fee-stat__content">
                        <span>✓ Đã thu</span>
                        <strong>{stats.totalCollected}</strong>
                        <p>↑ {stats.collectionRate}</p>
                    </div>
                </div>

                <div className="fee-stat stat-warning">
                    <div className="fee-stat__icon"><FiAlertCircle /></div>
                    <div className="fee-stat__content">
                        <span>Quá hạn (cần xử lý)</span>
                        <strong>{stats.overdueCount} HS</strong>
                        <p>{stats.overdueAmount} nợ</p>
                    </div>
                </div>

                <div className="fee-stat stat-danger">
                    <div className="fee-stat__icon"><FiUsers /></div>
                    <div className="fee-stat__content">
                        <span>Chưa thanh toán</span>
                        <strong>{stats.unpaidCount} HS</strong>
                        <p>{stats.pendingAmount} nợ</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="fee-tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        className={`fee-tab ${activeTabId === tab.id ? "active" : ""}`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="fee-content">
                <ActiveComponent
                    schoolYear={selectedSchoolYear}
                    term={selectedTerm}
                />
            </div>
        </div>
    );
}
