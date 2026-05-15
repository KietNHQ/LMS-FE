import React from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import "./paymentActionsSection.css";

export default function PaymentActionsSection({
    searchTerm,
    selectedGrade,
    gradeOptions,
    onSearchChange,
    onGradeChange,
}) {
    return (
        <section className="payment-actions-card">
            <div className="payment-grade-buttons">
                {gradeOptions.map((grade) => (
                    <button
                        key={grade}
                        className={`payment-grade-btn ${selectedGrade === grade ? "active" : ""}`}
                        onClick={() => onGradeChange(grade)}
                    >
                        {grade}
                    </button>
                ))}
            </div>
        </section>
    );
}


