import React from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import "./parentActionsSection.css";

export default function ParentActionsSection({
    totalParents,
    searchTerm,
    selectedStatus,
    selectedClass,
    statusOptions,
    classOptions,
    onSearchChange,
    onStatusChange,
    onClassChange,
    onCreateParentAccount
}) {
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isClassOpen, setIsClassOpen] = useState(false);
    const statusRef = useRef(null);
    const classRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (statusRef.current && !statusRef.current.contains(event.target)) {
                setIsStatusOpen(false);
            }
            if (classRef.current && !classRef.current.contains(event.target)) {
                setIsClassOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <section className="parent-actions-section">
            <div className="parent-actions-top">
                <div className="parent-actions-title-wrap">
                    <div className="parent-actions-title-row">
                        <h1>Quản lý Phụ huynh</h1>
                        <div className="parent-total-badge" aria-live="polite">
                            <span className="parent-total-number">{totalParents}</span>
                            <span className="parent-total-label">phụ huynh</span>
                        </div>
                    </div>
                </div>

                <button className="parent-btn-create" onClick={onCreateParentAccount}>
                    Tạo tài khoản phụ huynh
                </button>
            </div>

            <div className="parent-toolbar-card">
                <div className="parent-search-box">
                    <FiSearch className="parent-search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email, SĐT..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="parent-filter-wrap">
                    <div className="parent-custom-select" ref={statusRef}>
                        <div 
                            className="parent-custom-select-trigger" 
                            onClick={() => {
                                setIsStatusOpen(!isStatusOpen);
                                setIsClassOpen(false);
                            }}
                        >
                            <span>{selectedStatus}</span>
                            <FiChevronDown className={`parent-select-icon ${isStatusOpen ? 'open' : ''}`} />
                        </div>
                        {isStatusOpen && (
                            <div className="parent-custom-select-options">
                                {statusOptions.map((item) => (
                                    <div 
                                        key={item} 
                                        className={`parent-custom-select-option ${selectedStatus === item ? 'active' : ''}`}
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

                    <div className="parent-custom-select" ref={classRef}>
                        <div 
                            className="parent-custom-select-trigger" 
                            onClick={() => {
                                setIsClassOpen(!isClassOpen);
                                setIsStatusOpen(false);
                            }}
                        >
                            <span>{selectedClass}</span>
                            <FiChevronDown className={`parent-select-icon ${isClassOpen ? 'open' : ''}`} />
                        </div>
                        {isClassOpen && (
                            <div className="parent-custom-select-options">
                                {classOptions.map((item) => (
                                    <div 
                                        key={item} 
                                        className={`parent-custom-select-option ${selectedClass === item ? 'active' : ''}`}
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
                </div>
            </div>
        </section>
    );
}
