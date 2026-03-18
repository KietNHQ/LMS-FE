import "./PaymentSummary.css";

export default function PaymentSummary({ yearAvg }) { 

  return ( 
    <div className="payment-summary">

      <div className="student-info">
        <div className="avatar">N</div>

        <div className="info">
          <h3>Nguyễn Minh Tuấn</h3>
          <p>Lớp 10A1 • GVCN: Trần Thị Hương</p>
          <span>Năm học 2024-2025 • Mã HS: HS001</span>
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