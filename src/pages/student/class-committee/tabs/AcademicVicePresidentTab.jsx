import React from "react";
import ClassStudentsSection from "../../../teacher/teachingClasses/components/classStudentsSection/ClassStudentsSection";
import "./AcademicVicePresidentTab.css";

const MOCK_STUDENTS = [
  { id: 1, name: "Phạm Nam", dob: "20/04/2008", parentName: "Vũ Thị F", phone: "0993957973" },
  { id: 2, name: "Tạ Vấn", dob: "14/11/2009", parentName: "Nguyễn Văn A", phone: "0915756683" },
  { id: 3, name: "Đặng Hải", dob: "24/05/2008", parentName: "Bùi Thị H", phone: "0933430244" },
  { id: 4, name: "Bùi Quốc", dob: "07/07/2008", parentName: "Bùi Thị H", phone: "0918194519" },
  { id: 5, name: "Hoàng Yến", dob: "16/11/2009", parentName: "Vũ Thị F", phone: "0967455452" },
  { id: 6, name: "Nguyễn Linh", dob: "09/04/2008", parentName: "Đặng Văn G", phone: "0964397511" },
  { id: 7, name: "Lê Toàn", dob: "09/06/2008", parentName: "Đặng Văn G", phone: "0956383884" },
  { id: 8, name: "Phạm Nam", dob: "20/10/2009", parentName: "Tạ Thị K", phone: "0939159795" },
];

export default function AcademicVicePresidentTab() {
  return (
    <div className="academic-vice-president-tab tc-student-theme-override">
      <div className="avp-tracking">
        <ClassStudentsSection students={MOCK_STUDENTS} readOnly={true} />
      </div>
    </div>
  );
}

