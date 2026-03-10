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

      <div className="profile-container">

        {/* LEFT SIDE */}

        <div className="profile-left">

          <div className="profile-card">

            <div className="profile-banner">
              <img src={student.avatar} alt="" className="profile-avatar"/>
            </div>

             <h3>{student.name}</h3>
             <p className="role">{student.role}</p>

          </div>


          {/* PERSONAL INFO */}

          <div className="personal-card">

            <h4>Thông tin cá nhân</h4>

            <div className="personal-info">
              <p><b>Mã học sinh:</b> {student.studentId}</p>
              <p><b>Lớp:</b> {student.class}</p>
              <p><b>Trường:</b> {student.school}</p>
              <p><b>Ngày sinh:</b> {student.dob}</p>
              <p><b>Giới tính:</b> {student.gender}</p>
              <p><b>SĐT:</b> {student.phone}</p>
              <p><b>Email:</b> {student.email}</p>
              <p><b>Địa chỉ:</b> {student.address}</p>
            </div>

          </div>

        </div>


        {/* RIGHT SIDE */}

        <div className="profile-right">

          <div className="profile-details">

            <h2>Profile Details</h2>

            <p className="sub-text">
              Bạn có thể chỉnh sửa thông tin cá nhân tại đây.
            </p>


            {/* AVATAR */}

            <div className="avatar-section">

              <div>
                <h4>Your avatar</h4>
                <p className="small-text">
                  PNG hoặc JPG tối đa 800px
                </p>
              </div>

            </div>


            {/* FORM */}

            <div className="profile-form">

              <div className="form-grid">

                <div className="form-group">
                  <label>Username</label>
                  <input type="text" value="minhtuan10a1"/>
                </div>

                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={student.name}/>
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" value={student.phone}/>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input type="text" value={student.email}/>
                </div>

              </div>


              <div className="form-group">
                <label>Địa chỉ</label>
                <input type="text" value={student.address}/>
              </div>


              <div className="form-buttons">
                <button className="password-btn">
                  Change Password
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}