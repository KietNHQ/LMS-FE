import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { FiArrowLeft, FiActivity, FiAward } from "react-icons/fi";
import VpDisciplineCompetition from "../competition/VpDisciplineCompetition";
import VpDisciplineAttendance from "../attendance/VpDisciplineAttendance";
import VpDisciplineConduct from "../conduct/VpDisciplineConduct";
import "./VpDisciplineCockpit.css";

const TABS = [
    { id: "attendance", label: "Chuyên cần lớp", icon: <FiActivity />, component: VpDisciplineAttendance },
    { id: "conduct", label: "Đánh giá hạnh kiểm", icon: <FiAward />, component: VpDisciplineConduct },
];

export default function VpDisciplineCockpit() {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedClass = searchParams.get("class");
    const selectedClassName = searchParams.get("className") || selectedClass;
    const activeTab = searchParams.get("tab") || "attendance";
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    const buildDetailParams = (overrides = {}) => {
        const params = Object.fromEntries(searchParams.entries());
        return {
            ...params,
            class: selectedClass,
            ...overrides,
        };
    };

    const setTab = (tab) => {
        setSearchParams(buildDetailParams({ tab }));
    };

    return (
        <div className="vp-cockpit vp-discipline-layout">
            <PageHeader
                title={
                    <div className="cockpit-title-row">
                        {selectedClass && (
                            <button className="btn-back-square-title" onClick={() => setSearchParams({})}>
                                <FiArrowLeft />
                            </button>
                        )}
                        <span>{selectedClass ? `Lớp ${selectedClassName}` : "Tổng Hợp Thi Đua & Nề Nếp"}</span>
                    </div>
                }
                actions={
                    <DisciplineHeaderActions
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            {!selectedClass ? (
                    <div className="cockpit-ranking-view animate-fade-in">
                        <VpDisciplineCompetition 
                            isEmbedded={true} 
                            onClassClick={(classRef, periodParams = {}) => setSearchParams({
                                class: String(classRef),
                                tab: "attendance",
                                ...periodParams,
                            })}
                        />
                    </div>
                ) : (
                    <div className="cockpit-detail-view animate-slide-up">
                        <div className="cockpit-hub__tabs">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`cockpit-hub__tab ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setTab(tab.id)}
                                >
                                    <span className="tab-icon">{tab.icon}</span>
                                    <span className="tab-label">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="cockpit-tab-content">
                            {activeTab === 'attendance' ? (
                                <div className="animate-fade-in">
                                    <VpDisciplineAttendance isEmbedded={true} />
                                </div>
                            ) : (
                                <div className="animate-fade-in">
                                    <VpDisciplineConduct isEmbedded={true} />
                                </div>
                            )}
                        </div>
                    </div>
            )}
        </div>
    );
}
