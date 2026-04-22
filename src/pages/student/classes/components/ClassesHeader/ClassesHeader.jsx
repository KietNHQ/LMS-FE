import "./ClassesHeader.css";

export default function ClassesHeader({ title, actions = null }) {
    return (
        <header className="student-classes-header">
            <div className="student-classes-title-wrap">
                <h1>{title}</h1>
            </div>

            {actions ? <div className="student-classes-header__actions">{actions}</div> : null}
        </header>
    );
}

