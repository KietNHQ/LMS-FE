import React from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import "./studentActionsSection.css";

export default function StudentActionsSection({
                                                  totalStudents,
                                                  searchTerm,
                                                  selectedClass,
                                                  classOptions,
                                                  onSearchChange,
                                                  onClassChange,
                                                  onCreateStudentAccount,
                                              }) {
    return (
        <section className="student-actions-section">
            <div className="student-actions-top">
                <div className="student-actions-title-wrap">
                    <h1>Quản lý Học sinh</h1>
                    <p>{totalStudents} học sinh đang theo học</p>
                </div>

                <button className="student-create-account-btn" onClick={onCreateStudentAccount}>
                    <span>Tạo tài khoản học sinh</span>
                </button>
            </div>

            <div className="student-toolbar-card">
                <div className="student-search-box">
                    <FiSearch className="student-search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm học sinh..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="student-filter-wrap">
                    <div className="student-select-wrap">
                        <select
                            value={selectedClass}
                            onChange={(e) => onClassChange(e.target.value)}
                        >
                            {classOptions.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                        <FiChevronDown className="student-select-icon" />
                    </div>
                </div>
            </div>
        </section>
    );
}