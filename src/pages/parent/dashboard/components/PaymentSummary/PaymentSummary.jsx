import "./PaymentSummary.css";

export default function PaymentSummary({ selectedChild, yearAvg }) { 
  const name = selectedChild?.name || "Chưa có thông tin";
  const initials = name.charAt(0).toUpperCase();
  const className = selectedChild?.className || selectedChild?.class_name || "---";
  const teacherName = selectedChild?.homeroomTeacher || "---";
  const studentCode = selectedChild?.studentCode || selectedChild?.id || "---";

  return ( 
    <div className="payment-summary">
      <div className="student-info">
        <div className="avatar">{initials}</div>

        <div className="info">
          <h3>{name}</h3>
          <p>Lớp {className} • GVCN: {teacherName}</p>
          <span>{selectedChild?.schoolYear || "Năm học ---"} • Mã HS: {studentCode}</span>
        </div>
      </div>

      {/* ✅ CHỈ SỬA CHỖ NÀY */}
      <div className="gpa">
        <h2>{yearAvg}</h2>
        <span>ĐTB cả năm</span>
      </div>

    </div>
  );
}
