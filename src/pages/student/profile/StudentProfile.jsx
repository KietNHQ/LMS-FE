import { useState } from "react";
import "./StudentProfile.css";
import {
  X,
  Star,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  IdCard
} from "lucide-react";

export default function StudentProfile({ onClose }) {

  const [student] = useState({
    name: "Nguyễn Minh Tuấn",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    role: "Học sinh",
    class: "10A1",
    studentId: "HS1024",
    schoolYear: "2025-2026",
    dob: "12/03/2008",
    gender: "Nam",
    phone: "0988888888",
    email: "tuan.nguyen@student.edu.vn",
    address: "505/66B, Quốc lộ 13, Quận 7, TP.HCM",

    achievements: [
      "Học sinh giỏi năm 2024 - 2025",
      "Giải Nhất Toán cấp trường",
      "Top 5 Olympic Tin học",
      "Danh hiệu Học sinh tiêu biểu"
    ],

    parents: [
      {
        relation: "Cha",
        name: "Nguyễn Văn A",
        phone: "0909999999",
        email: "vana@gmail.com"
      },
      {
        relation: "Mẹ",
        name: "Trần Thị B",
        phone: "0911111111",
        email: "thib@gmail.com"
      }
    ]
  });

  return (
    <div className="profile-overlay">

      <div className="profile-dialog">

        {/* Close button */}
        <button className="profile-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="profile-layout">

          {/* LEFT SIDE */}

          <div className="profile-left">

            <img
              src={student.avatar}
              alt="avatar"
              className="profile-avatar"
            />

            <div className="achievement-box">

              <h3>
                <Star size={18} /> Thành tích
              </h3>

              <ul>
                {student.achievements.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

            </div>

          </div>


          {/* RIGHT SIDE */}

          <div className="profile-right">

            {/* Header */}

            <div className="profile-header">

              <h2>{student.name}</h2>

              <p className="profile-role">
                {student.role} • Lớp {student.class}
              </p>

            </div>


            {/* Student info */}

            <div className="info-grid">

              <p>
                <IdCard size={16} />
                <b>Mã HS:</b> {student.studentId}
              </p>

              <p>
                <Calendar size={16} />
                <b>Năm học:</b> {student.schoolYear}
              </p>

              <p>
                <Calendar size={16} />
                <b>Ngày sinh:</b> {student.dob}
              </p>

              <p>
                <b>Giới tính:</b> {student.gender}
              </p>

              <p>
                <Phone size={16} />
                <b>SĐT:</b> {student.phone}
              </p>

              <p>
                <Mail size={16} />
                <b>Email:</b> {student.email}
              </p>

              <p className="address">
                <MapPin size={16} />
                <b>Địa chỉ:</b> {student.address}
              </p>

            </div>


            {/* Parent section */}

            <div className="parent-section">

              <h3>
                <Users size={18} /> Phụ huynh
              </h3>

              <div className="parent-grid">

                {student.parents.map((p, index) => (
                  <div className="parent-card" key={index}>

                    <p><b>{p.relation}:</b> {p.name}</p>
                    <p>
                      <Phone size={14} /> {p.phone}
                    </p>
                    <p>
                      <Mail size={14} /> {p.email}
                    </p>

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