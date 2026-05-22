import { useMemo, useState, useEffect } from "react";
import studentService from "../../../services/pages/student/studentService";
import "./StudentClassCommittee.css";
import ClassPresidentTab from "./tabs/ClassPresidentTab";
import AcademicVicePresidentTab from "./tabs/AcademicVicePresidentTab";
import ClassSecretaryTab from "./tabs/ClassSecretaryTab";

// Map officer_role từ DB → tab key
const ROLE_TO_TAB = {
  "monitor": "class-president",
  "vice_monitor_academic": "academic-vice-president",
  "secretary": "class-secretary",
};

const officerTabs = [
  {
    key: "class-president",
    label: "Lớp trưởng",
    shortLabel: "LT",
    role: "Điều phối lớp",
    officerRole: "monitor",
  },
  {
    key: "academic-vice-president",
    label: "Phó học tập",
    shortLabel: "PHT",
    role: "Hỗ trợ học tập",
    officerRole: "vice_monitor_academic",
  },
  {
    key: "class-secretary",
    label: "Bí thư",
    shortLabel: "BT",
    role: "Phong trào lớp",
    officerRole: "secretary",
  },
];

export default function StudentClassCommittee() {
  const [classId, setClassId] = useState(null);
  const [className, setClassName] = useState("");
  const [officerRole, setOfficerRole] = useState(null); // student's own officer_role
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mặc định show tab của role mình, fallback tab đầu
  const myTabKey = ROLE_TO_TAB[officerRole] || null;
  const [activeTab, setActiveTab] = useState("class-president");

  useEffect(() => {
    const fetchContext = async () => {
      try {
        setIsLoading(true);
        const res = await studentService.getClassCommitteeContext({ mock: false });
        if (res?.success && res?.data) {
          setClassId(res.data.classId);
          setClassName(res.data.className || "");
          setOfficerRole(res.data.officerRole || null);

          // Tự động chuyển đến tab của mình
          const myTab = ROLE_TO_TAB[res.data.officerRole];
          if (myTab) setActiveTab(myTab);
        } else {
          setError("Không lấy được thông tin lớp.");
        }
      } catch (err) {
        console.error("Failed to fetch class committee context:", err);
        setError("Lỗi kết nối. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchContext();
  }, []);

  const activeOfficer = useMemo(
    () => officerTabs.find((item) => item.key === activeTab) ?? officerTabs[0],
    [activeTab]
  );

  if (isLoading) {
    return (
      <div className="student-class-committee-page">
        <div className="loading-container" style={{ padding: "60px", textAlign: "center" }}>
          <div style={{ fontSize: "18px", color: "#888" }}>Đang tải thông tin ban cán sự...</div>
        </div>
      </div>
    );
  }

  // Student không phải BCS
  if (!officerRole) {
    return (
      <div className="student-class-committee-page">
        <div className="student-class-committee-header">
          <div className="student-class-committee-header__title">
            <h1>Ban cán sự lớp</h1>
          </div>
        </div>
        <div className="committee-not-officer">
          <div className="committee-not-officer__icon">🏫</div>
          <h2>Bạn chưa được phân công chức vụ</h2>
          <p>Giáo viên chủ nhiệm sẽ phân công các chức vụ Lớp trưởng, Phó học tập và Bí thư.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-class-committee-page">
      <div className="student-class-committee-header">
        <div className="student-class-committee-header__title">
          <h1>Ban cán sự lớp{className ? `: ${className}` : ""}</h1>
          <p className="officer-role-badge">
            Vai trò của bạn: <strong>{activeOfficer.label}</strong>
          </p>
        </div>
      </div>

      <div className="student-class-committee-tabs" role="tablist" aria-label="Ban cán sự lớp">
        {officerTabs.map((tab) => {
          const isMyTab = tab.officerRole === officerRole;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={!isMyTab}
              title={!isMyTab ? `Chức năng dành cho ${tab.label}` : undefined}
              className={`student-class-committee-tab ${isActive ? "active" : ""} ${!isMyTab ? "disabled" : ""}`}
              onClick={() => isMyTab && setActiveTab(tab.key)}
            >
              <span className="student-class-committee-tab__icon">{tab.shortLabel}</span>
              <span className="student-class-committee-tab__text">
                <strong>{tab.label}</strong>
                <small>{isMyTab ? tab.role : "Không phải chức vụ của bạn"}</small>
              </span>
              {isMyTab && <span className="tab-my-role-dot" aria-label="Chức vụ của bạn" />}
            </button>
          );
        })}
      </div>

      <div className="student-class-committee-content-area">
        {activeTab === "class-president" && <ClassPresidentTab classId={classId} />}
        {activeTab === "academic-vice-president" && <AcademicVicePresidentTab classId={classId} />}
        {activeTab === "class-secretary" && <ClassSecretaryTab classId={classId} />}
      </div>
    </div>
  );
}
