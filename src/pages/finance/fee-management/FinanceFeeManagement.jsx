import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { useSearchParams } from "react-router-dom";
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

            <div className="fin-fee__content">
                <ActiveComponent 
                    schoolYear={selectedSchoolYear}
                    term={selectedTerm}
                />
            </div>
        </div>
    );
}

