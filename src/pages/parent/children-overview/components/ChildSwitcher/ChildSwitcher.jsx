import React from "react"
import "./ChildSwitcher.css"

export default function ChildSwitcher({ children, selectedId, onSelect }) {
    return (
        <div className="child-switcher">
            <div className="child-switcher-list">
                {children.map((child) => (
                    <button
                        key={child.id}
                        type="button"
                        className={`child-switcher-item${selectedId === child.id ? " active" : ""}`}
                        onClick={() => onSelect(child.id)}
                    >
                        <div className="child-switcher-avatar" style={{ background: child.avatarColor }}>
                            {child.avatarLetter}
                        </div>
                        <div className="child-switcher-info">
                            <span className="child-switcher-name">{child.name}</span>
                            <span className="child-switcher-class">Lớp {child.className} · {child.schoolYear}</span>
                        </div>
                        {selectedId === child.id && (
                            <span className="child-switcher-active-dot" aria-hidden="true" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}

