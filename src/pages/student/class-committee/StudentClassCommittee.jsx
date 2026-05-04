import { useMemo, useState } from "react";
import "./StudentClassCommittee.css";
import ClassPresidentTab from "./tabs/ClassPresidentTab";
import AcademicVicePresidentTab from "./tabs/AcademicVicePresidentTab";
import ClassSecretaryTab from "./tabs/ClassSecretaryTab";

const officerTabs = [
  {
    key: "class-president",
    label: "Lớp trưởng",
    shortLabel: "LT",
    role: "Điều phối lớp",
  },
  {
    key: "academic-vice-president",
    label: "Phó học tập",
    shortLabel: "PHT",
    role: "Hỗ trợ học tập",
  },
  {
    key: "class-secretary",
    label: "Bí thư",
    shortLabel: "BT",
    role: "Phong trào lớp",
  },
];

export default function StudentClassCommittee() {
  const [activeTab, setActiveTab] = useState("class-president");

  const activeOfficer = useMemo(
    () => officerTabs.find((item) => item.key === activeTab) ?? officerTabs[0],
    [activeTab]
  );

  return (
    <div className="student-class-committee-page">
      <div className="student-class-committee-header">
        <div className="student-class-committee-header__title">
          <h1>Ban cán sự lớp: {activeOfficer.label}</h1>
        </div>
      </div>

      <div className="student-class-committee-tabs" role="tablist" aria-label="Ban cán sự lớp">
        {officerTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`student-class-committee-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="student-class-committee-tab__icon">{tab.shortLabel}</span>
            <span className="student-class-committee-tab__text">
              <strong>{tab.label}</strong>
              <small>{tab.role}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="student-class-committee-content-area">
        {activeTab === "class-president" && <ClassPresidentTab />}
        {activeTab === "academic-vice-president" && <AcademicVicePresidentTab />}
        {activeTab === "class-secretary" && <ClassSecretaryTab />}
      </div>
    </div>
  );
}

