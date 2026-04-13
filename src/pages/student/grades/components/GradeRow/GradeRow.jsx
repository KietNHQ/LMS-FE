import React from "react";
import { FiChevronDown } from "react-icons/fi";
import { BiTrendingUp, BiTrendingDown, BiMinus } from "react-icons/bi";
import GradeDetail from "../GradeDetail/GradeDetail";

export default function GradeRow({
    selectedClass,
    subject,
    openRowId,
    onToggleRow,
    getSubjectIcon,
    getDisplayedValue,
    getRankColorClass,
}) {
    return (
        <React.Fragment key={`${selectedClass}-${subject.id}`}>
            <div className="table-row">
                <div className="subject">
                    <div className="subject-icon">
                        {React.createElement(getSubjectIcon(subject.name))}
                    </div>
                    <div>
                        <b>{subject.name}</b>
                        <p>{subject.className}</p>
                    </div>
                </div>

                <span>{subject.hk1Avg.toFixed(2)}</span>
                <span>{subject.hk2Avg.toFixed(2)}</span>
                <span className="total">{getDisplayedValue(subject)}</span>

                <span
                    className={`trend-cell ${
                        subject.trend === "up"
                            ? "up"
                            : subject.trend === "down"
                              ? "down"
                              : "same"
                    }`}
                >
                    {subject.trend === "up" ? (
                        <BiTrendingUp />
                    ) : subject.trend === "down" ? (
                        <BiTrendingDown />
                    ) : (
                        <BiMinus />
                    )}
                </span>

                <span className={`rank ${getRankColorClass(subject.rank)}`}>{subject.rank}</span>

                <button
                    className={`detail-toggle ${openRowId === subject.id ? "open" : ""}`}
                    onClick={() => onToggleRow(subject.id)}
                    type="button"
                    aria-label="View details"
                >
                    <FiChevronDown />
                </button>
            </div>

            {openRowId === subject.id && <GradeDetail subject={subject} />}
        </React.Fragment>
    );
}


