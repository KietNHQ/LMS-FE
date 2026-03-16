import React from "react"
import "./ChildOverviewSection.css"

export default function ChildOverviewSection({ cards, onCardClick }) {
    return (
        <div className="child-overview-grid">
            {cards.map((card, index) => {
                const isClickable = Boolean(card.semesterKey && onCardClick)
                const CardTag = isClickable ? "button" : "div"

                return (
                    <CardTag
                        key={index}
                        className={`overview-card ${card.type} ${isClickable ? "clickable" : ""}`}
                        {...(isClickable
                            ? {
                                type: "button",
                                onClick: () => onCardClick(card.semesterKey)
                            }
                            : {})}
                    >
                        <div className="overview-card-top">
                            <span>{card.title}</span>
                        </div>
                        <strong>{card.value}</strong>
                        {card.subtitle ? <p>{card.subtitle}</p> : null}
                    </CardTag>
                )
            })}
        </div>
    )
}