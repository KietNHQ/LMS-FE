import React, { useState } from "react";
import { FiSettings, FiArrowLeft } from "react-icons/fi";
import { SchoolYearTermSelector } from "../../../../components/common";
import PointConfigModal from "./PointConfigModal";
import "./DisciplineHeaderActions.css";

const DisciplineHeaderActions = ({
  selectedSchoolYear,
  selectedTerm,
  onYearChange,
  onTermChange,
  isClassView = false,
  onBack,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="discipline-header-actions">
      <button 
        className="btn-config-points-header" 
        onClick={() => setIsModalOpen(true)}
        title="Cấu hình điểm thi đua & nề nếp"
      >
        <FiSettings />
        <span>Cấu hình điểm</span>
      </button>

      <SchoolYearTermSelector
        selectedSchoolYear={selectedSchoolYear}
        selectedTerm={selectedTerm}
        onYearChange={onYearChange}
        onTermChange={onTermChange}
      />

      <PointConfigModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default DisciplineHeaderActions;
