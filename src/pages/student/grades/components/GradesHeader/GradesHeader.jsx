import "./GradesHeader.css";

export default function GradesHeader({ title, actions = null }) {
    return (
        <div className="grades-header">
            <h1 className="grades-title">{title}</h1>
            {actions ? <div className="grades-header__actions">{actions}</div> : null}
        </div>
    );
}


