import { useState } from "react";
import "./StudentProfile.css";

export default function StudentProfile() {

  const [showDialog, setShowDialog] = useState(true);

  const [student, setStudent] = useState({
    name: "Nguyễn Minh Tuấn",
    avatar: "https://i.pravatar.cc/300?img=12",
    role: "Học sinh",
    studentId: "HS1024",
    class: "10A1",
    school: "THPT EduVN",
    year: "2025-2026",
    dob: "12/03/2008",
    gender: "Nam",
    phone: "0988888888",
    email: "tuan.nguyen@student.edu.vn",
    address: "505/66, Quốc lộ 13, Quận 7, TP.HCM",

    achievements: [
      "- Học sinh giỏi năm 2024 - 2025",
      "- Giải Nhất Toán cấp trường",
      "-Top 5 Olympic Tin học",
      "- Danh hiệu Học sinh tiêu biểu"
    ],

    parents: [
      {
        name: "Nguyễn Văn A",
        relation: "Cha",
        contacts: [
          { type: "Điện thoại", value: "0909999999" },
          { type: "Email", value: "vana@gmail.com" }
        ]
      },
      {
        name: "Trần Thị B",
        relation: "Mẹ",
        contacts: [
          { type: "Điện thoại", value: "0911111111" },
          { type: "Email", value: "thib@gmail.com" }
        ]
      }
    ]
  });

  const changeAvatar = (e) => {
    const file = e.target.files[0];

    if (file) {
      const url = URL.createObjectURL(file);

      setStudent({
        ...student,
        avatar: url
      });
    }
  };

  if (!showDialog) return null;

  return (
    <div className="dialog-overlay">

      <div className="dialog">

        <button
          className="close-btn"
          onClick={() => setShowDialog(false)}
        >
          ✕
        </button>

        <div className="student-card">

          {/* LEFT SIDE */}

          <div className="avatar-section">

            <div className="avatar-wrapper">

              <img
                src={student.avatar}
                alt="avatar"
                className="avatar"
              />

              <label className="avatar-overlay">
                📷
                <input
                  type="file"
                  accept="image/*"
                  onChange={changeAvatar}
                  hidden
                />
              </label>

            </div>

            {/* ACHIEVEMENTS */}

            <div className="achievement-box">

              <h3>🏆 Thành tích</h3>

              <ul>
                {student.achievements.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

            </div>

          </div>


          {/* RIGHT SIDE */}

          <div className="student-info">

            <h2>{student.name}</h2>

            <p className="student-role">
              {student.role} - Lớp {student.class}
            </p>

            <div className="info-grid">

              <p><b>Mã HS:</b> {student.studentId}</p>
              <p><b>Năm học:</b> {student.year}</p>

              <p><b>Ngày sinh:</b> {student.dob}</p>
              <p><b>Giới tính:</b> {student.gender}</p>

              <p><b>SĐT:</b> {student.phone}</p>
              <p><b>Email:</b> {student.email}</p>

              <p><b>Địa chỉ:</b> {student.address}</p>

            </div>


            {/* PARENT */}

            <div className="parent-box">

              <h3>Phụ huynh</h3>

              <div className="parent-grid">

                {student.parents.map((parent, index) => (

                  <div className="parent-card" key={index}>

                    <p>
                      <b>{parent.relation}:</b> {parent.name}
                    </p>

                    {parent.contacts.map((contact, i) => (
                      <p key={i}>
                        <b>{contact.type}:</b> {contact.value}
                      </p>
                    ))}

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}