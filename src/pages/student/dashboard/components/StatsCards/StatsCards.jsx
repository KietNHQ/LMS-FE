import { useNavigate } from "react-router-dom";

export default function StatsCards({ cards }) {
    const navigate = useNavigate();

    return (
        <div className="student-stats-grid">
            {cards.map((card) => (
                <div 
                    key={card.id} 
                    className={`student-stat-card ${card.path ? "clickable" : ""}`}
                    onClick={() => card.path && navigate(card.path)}
                >
                    <div className="student-stat-body">
                        <p className="student-stat-title">{card.title}</p>
                        <h2 className="student-stat-value">{card.value}</h2>

                        {card.subtitle ? (
                            <div className="student-stat-subtitle">{card.subtitle}</div>
                        ) : null}

                        {typeof card.progressPercent === "number" ? (
                            <div className="student-stat-progress-wrap">
                                <div className="student-stat-progress">
                                    <div
                                        className="student-stat-progress-fill"
                                        style={{ width: `${card.progressPercent}%` }}
                                    />
                                </div>
                                <span className="student-stat-progress-text">
                                    {card.progressPercent}% tiến độ
                                </span>
                            </div>
                        ) : (
                            <div className="student-stat-progress-placeholder" />
                        )}
                    </div>

                    <div className={`student-stat-icon ${card.color}`}>
                        <card.icon />
                    </div>
                </div>
            ))}
        </div>
    );
}


