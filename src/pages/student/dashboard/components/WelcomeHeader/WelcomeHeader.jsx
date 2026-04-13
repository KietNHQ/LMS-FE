export default function WelcomeHeader({ studentName, classNameLabel, schoolYear }) {
    return (
        <div className="student-dashboard-header">
            <h1>Xin chào, {studentName}!</h1>
            <p>
                Lớp: <span className="student-header-strong">{classNameLabel}</span>
                <span className="student-header-separator"> | </span>
                Năm học: <span className="student-header-strong">{schoolYear}</span>
            </p>
        </div>
    );
}

