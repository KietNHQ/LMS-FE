import "./ClassDetailHeader.css";

export default function ClassDetailHeader({ classNameLabel, title }) {
    return (
        <div className="student-class-detail-header-card">
            <div className="student-class-detail-title-row">
                <span className="student-class-detail-tag">{classNameLabel}</span>
                <h1>{title}</h1>
            </div>
        </div>
    );
}


