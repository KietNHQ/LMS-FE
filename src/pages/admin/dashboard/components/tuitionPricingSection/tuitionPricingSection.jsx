import "./tuitionPricingSection.css";
import { Check, Edit2, Minus, Plus } from "lucide-react";
import { useState } from "react";

const PRICE_STEP = 100000;

const TuitionPricingSection = ({ selectedSchoolYear, selectedTerm, tuitionData, onUpdateTuition }) => {
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState(0);

  const gradeRows = [
    { key: "10", label: "Khối 10" },
    { key: "11", label: "Khối 11" },
    { key: "12", label: "Khối 12" },
  ];

  const handleEditStart = (key, value) => {
    setEditingKey(key);
    setEditValue(Number(value) || 0);
  };

  const handleStepValue = (delta) => {
    setEditValue((prev) => Math.max(0, prev + delta * PRICE_STEP));
  };

  const handleEditSave = (grade) => {
    if (Number.isFinite(editValue)) {
      onUpdateTuition(grade, Math.max(0, editValue));
    }

    setEditingKey(null);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const termNumber = selectedTerm === "hk1" ? "1" : "2";
  const termLabel = `Học kỳ ${termNumber}`;

  return (
    <div className="admin-dashboard__card admin-dashboard__card--pricing">
      <div className="admin-dashboard__card-header">
        <h3>
          Giá tiền học kỳ <span className="admin-dashboard__pricing-term-number">{termNumber}</span>
        </h3>
        <div className="admin-dashboard__pricing-meta">
          <span className="admin-dashboard__pricing-year">Năm học {selectedSchoolYear}</span>
        </div>
      </div>

      <div className="admin-dashboard__pricing-list">
        {gradeRows.map((grade) => (
          <div className="admin-dashboard__pricing-row" key={grade.key}>
            <div className="admin-dashboard__pricing-info">
              <p className="admin-dashboard__pricing-label">{grade.label}</p>
            </div>

            <div className="admin-dashboard__pricing-value">
              {editingKey === grade.key ? (
                <div className="admin-dashboard__pricing-edit">
                  <button
                    type="button"
                    className="admin-dashboard__pricing-step-btn"
                    onClick={() => handleStepValue(-1)}
                    aria-label={`Giảm 100 nghìn cho ${grade.label}`}
                  >
                    <Minus size={14} />
                  </button>

                  <span className="admin-dashboard__pricing-edit-value">{formatCurrency(editValue)}</span>

                  <button
                    type="button"
                    className="admin-dashboard__pricing-step-btn"
                    onClick={() => handleStepValue(1)}
                    aria-label={`Tăng 100 nghìn cho ${grade.label}`}
                  >
                    <Plus size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditSave(grade.key)}
                    className="admin-dashboard__pricing-btn--save"
                    aria-label={`Lưu giá ${grade.label}`}
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <span>{formatCurrency(tuitionData[grade.key])}</span>
                  <button
                    onClick={() => handleEditStart(grade.key, tuitionData[grade.key])}
                    className="admin-dashboard__pricing-btn--edit"
                    type="button"
                    aria-label={`Cập nhật giá ${grade.label}`}
                  >
                    <Edit2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TuitionPricingSection;

