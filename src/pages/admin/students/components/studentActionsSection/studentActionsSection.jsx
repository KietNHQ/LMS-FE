import React from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import "./studentActionsSection.css";

export default function StudentActionsSection({
                                                  totalStudents,
                                                  searchTerm,
                                                  selectedClass,
                                                  classOptions,
                                                  selectedStatus,
                                                  statusOptions,
                                                  onSearchChange,
                                                  onClassChange,
                                                  onStatusChange,
                                                  onCreateStudentAccount,
                                              }) {
    const [isClassOpen, setIsClassOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const classRef = useRef(null);
    const statusRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (classRef.current && !classRef.current.contains(event.target)) {
                setIsClassOpen(false);
            }
            if (statusRef.current && !statusRef.current.contains(event.target)) {
                setIsStatusOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    return (
        <section className="student-actions-section">
            <div className="student-actions-top">
                <div className="student-actions-title-wrap">
                    <div className="student-actions-title-row">
                        <h1>Quản lý Học sinh</h1>
                        <div className="student-total-badge" aria-live="polite">
                            <span className="student-total-number">{totalStudents}</span>
                            <span className="student-total-label">học sinh</span>
                        </div>
                    </div>
                </div>

                <button className="student-btn-create" onClick={onCreateStudentAccount}>
                    Tạo tài khoản học sinh
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
                    <div className="student-custom-select" ref={classRef}>
                        <div 
                            className="student-custom-select-trigger" 
                            onClick={() => {
                                setIsClassOpen(!isClassOpen);
                                setIsStatusOpen(false);
                            }}
                        >
                            <span>{selectedClass}</span>
                            <FiChevronDown className={`student-select-icon ${isClassOpen ? 'open' : ''}`} />
                        </div>
                        {isClassOpen && (
                            <div className="student-custom-select-options">
                                {classOptions.map((item) => (
                                    <div 
                                        key={item} 
                                        className={`student-custom-select-option ${selectedClass === item ? 'active' : ''}`}
                                        onClick={() => {
                                            onClassChange(item);
                                            setIsClassOpen(false);
                                        }}
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="student-custom-select" ref={statusRef}>
                        <div 
                            className="student-custom-select-trigger" 
                            onClick={() => {
                                setIsStatusOpen(!isStatusOpen);
                                setIsClassOpen(false);
                            }}
                        >
                            <span>{selectedStatus}</span>
                            <FiChevronDown className={`student-select-icon ${isStatusOpen ? 'open' : ''}`} />
                        </div>
                        {isStatusOpen && (
                            <div className="student-custom-select-options">
                                {statusOptions.map((item) => (
                                    <div 
                                        key={item} 
                                        className={`student-custom-select-option ${selectedStatus === item ? 'active' : ''}`}
                                        onClick={() => {
                                            onStatusChange(item);
                                            setIsStatusOpen(false);
                                        }}
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}