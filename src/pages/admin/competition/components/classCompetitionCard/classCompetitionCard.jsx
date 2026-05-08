import React from "react";
import { FiTrendingUp, FiTrendingDown, FiMinus, FiChevronRight } from "react-icons/fi";
import "./classCompetitionCard.css";

const ClassCompetitionCard = ({ data, onAdjust }) => {
    const { className, teacher, totalPoints, rank, trend } = data;

    const renderTrendIcon = () => {
        switch (trend) {
            case "up": return <FiTrendingUp style={{ color: "#22c55e" }} />;
            case "down": return <FiTrendingDown style={{ color: "#ef4444" }} />;
            default: return <FiMinus style={{ color: "#94a3b8" }} />;
        }
    };

    return (
        <div className="class-competition-card clickable" onClick={onAdjust}>
            <div className="card-rank">Hạng {rank} Khối {className.substring(0, 2)}</div>
            
            <div className="card-body-wrapper">
                <div className="card-header">
                    <div>
                        <h3 className="class-name">{className}</h3>
                        <p className="teacher-name">GVCN: {teacher}</p>
                    </div>
                    <div className="trend-indicator">{renderTrendIcon()}</div>
                </div>

                <div className="card-main">
                    <div className="points-display">
                        <span className="current-points">{totalPoints}</span>
                        <span className="max-points">/100</span>
                    </div>
                    <div className="progress-bar-container">
                        <div 
                            className="progress-bar-fill"
                            style={{ 
                                width: `${totalPoints}%`,
                                background: totalPoints > 90 ? "#22c55e" : 
                                           totalPoints > 80 ? "#3b82f6" : 
                                           "#f59e0b"
                            }}
                        />
                    </div>
                </div>

                <div className="card-overlay">
                    <span>Xem chi tiết thi đua</span>
                    <FiChevronRight />
                </div>
            </div>
        </div>
    );
};

export default ClassCompetitionCard;

