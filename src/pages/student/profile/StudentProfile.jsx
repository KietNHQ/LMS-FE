import "./StudentProfile.css";

export default function StudentProfile() {

  const student = {
    name: "Nguyễn Minh Tuấn",
    avatar: "https://i.pravatar.cc/150?img=12",
    role: "Học sinh",
    studentId: "HS1024",
    class: "10A1",
    school: "THPT EduVN",
    dob: "12/03/2008",
    gender: "Nam",
    phone: "0988888888",
    email: "tuan.nguyen@student.edu.vn",
    address: "Quận 7, TP.HCM"
  };

  return (
    <div className="profile-page">

      {/* CARD TRÊN */}

      <div className="card profile-top">

        <img
          src={student.avatar}
          alt="avatar"
          className="profile-avatar"
        />

        <div className="profile-info">

          <h2>{student.name}</h2>

          <p className="profile-role">
            {student.role} - Lớp {student.class}
          </p>

          <hr />

          <p className="profile-desc">
            Học sinh tại {student.school}. Có tinh thần học tập tốt,
            tích cực tham gia các hoạt động học thuật và ngoại khóa.
            Luôn cố gắng phát triển kỹ năng tư duy và làm việc nhóm.
          </p>

        </div>

      </div>


      {/* 3 CARD DƯỚI */}

      <div className="profile-bottom">

        {/* THÔNG TIN */}

        <div className="card">

          <h3>THÔNG TIN CÁ NHÂN</h3>

          <p><b>Mã học sinh:</b> {student.studentId}</p>
          <p><b>Ngày sinh:</b> {student.dob}</p>
          <p><b>Giới tính:</b> {student.gender}</p>
          <p><b>SĐT:</b> {student.phone}</p>
          <p><b>Email:</b> {student.email}</p>
          <p><b>Địa chỉ:</b> {student.address}</p>

        </div>


        {/* HỌC TẬP */}

        <div className="card">

          <h3>HỌC TẬP</h3>

          <p><b>{student.school}</b></p>
          <p>Lớp {student.class}</p>

          <ul>
            <li>Học lực: Giỏi</li>
            <li>Hạnh kiểm: Tốt</li>
            <li>Tham gia CLB Tin học</li>
          </ul>

        </div>


        {/* THÀNH TÍCH */}

        <div className="card">

          <h3>THÀNH TÍCH</h3>

          <p><b>2024</b></p>
          <p>Học sinh giỏi cấp trường môn Tin học</p>

          <p><b>2023</b></p>
          <p>Tham gia cuộc thi STEM cấp trường</p>

        </div>

      </div>

    </div>
  );
}