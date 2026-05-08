export default function WelcomeHeader({ studentName, classNameLabel, studentCode, homeroomTeacher }) {
    return (
        <div className="student-dashboard-header">
            <h1>Xin chào, {studentName}!</h1>
            <p>
                Lớp: <span className="student-header-strong">{classNameLabel}</span>
                <span className="student-header-separator"> | </span>
                Mã HS: <span className="student-header-strong">{studentCode}</span>
                <span className="student-header-separator"> | </span>
                GVCN: <span className="student-header-strong">{homeroomTeacher}</span>
            </p>
        </div>
    );
}


