import React from "react";
import "./GradesSection.css";

function getRank(average) {
    const score = Number(average);

    if (score >= 8.5) return "Xuất sắc";
    if (score >= 7.0) return "Tốt";
    if (score >= 5.5) return "Khá";
    if (score >= 4.0) return "Trung bình";
    return "Yếu";
}

function getRankClass(rank) {
    return rank.toLowerCase().replace(/\s+/g, "-");
}

export default function GradesSection({ grades, compact = false }) {
    return (
        <div className={`grades-card ${compact ? "compact" : ""}`}>
            <div className="section-heading">
                <div className="section-heading-text">
                    <h3>Điểm số</h3>
                    <p>Điểm các môn học và tóm tắt thành tích học tập.</p>
                </div>
            </div>

            <div className="grades-table-wrapper">
                <table className="grades-table">
                    <thead>
                    <tr>
                        <th>Môn học</th>
                        <th>Miệng</th>
                        <th>15 phút</th>
                        <th>Giữa kỳ</th>
                        <th>Cuối kỳ</th>
                        <th>Trung bình</th>
                        <th>Xếp loại</th>
                    </tr>
                    </thead>

                    <tbody>
                    {grades.map((item, index) => {
                        const rank = getRank(item.average);

                        return (
                            <tr key={index}>
                                <td>{item.subject}</td>
                                <td>{item.oral}</td>
                                <td>{item.test15}</td>
                                <td>{item.midterm}</td>
                                <td>{item.final}</td>
                                <td>{item.average}</td>
                                <td>
                    <span className={`grade-status ${getRankClass(rank)}`}>
                      {rank}
                    </span>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>


        </div>
    );
}