import React from "react"
import "./ChildOverviewSection.css"

export default function ChildOverviewSection({ cards }) {
    return (
        <div className="child-overview-grid">
            {cards.map((card, index) => (
                <div key={index} className={`overview-card ${card.type}`}>
                    <div className="overview-card-top">
                        <span>{card.title}</span>
                    </div>
                    <strong>{card.value}</strong>
                    <p>{card.subtitle}</p>
                </div>
            ))}
        </div>
    )
}