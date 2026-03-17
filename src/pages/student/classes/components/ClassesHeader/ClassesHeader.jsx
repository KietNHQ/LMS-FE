import "./ClassesHeader.css";

export default function ClassesHeader({ title }) {
    return (
        <header className="student-classes-header">
            <div className="student-classes-title-wrap">
                <h1>{title}</h1>
            </div>
        </header>
    );
}

