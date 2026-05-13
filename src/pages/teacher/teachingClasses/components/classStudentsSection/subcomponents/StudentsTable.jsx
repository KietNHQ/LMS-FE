import React from "react";
import { FiEdit3, FiEye } from "react-icons/fi";
import { formatDate } from "../../../utils/teachingClassesUtils";
import "./StudentsTable.css";

const StudentsTable = ({ 
  students, 
  studentAttendance, 
  onToggleAttendance, 
  onOpenReview, 
  effectivePage, 
  itemsPerPage,
  readOnly,
  selectedStudentIds,
  onToggleSelect,
  onSelectAll
}) => {
  const isAllSelected = students.length > 0 && students.every(s => selectedStudentIds.has(s.id));

  return (
    <div className="table-wrapper">
      <table className="students-table">
        <thead>
          <tr>
            <th className="select-cell">
              <input 
                type="checkbox" 
                checked={isAllSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>
            <th>STT</th>
            <th className="student-name-header">HỌC SINH</th>
            <th>NGÀY SINH</th>
            <th>PHỤ HUYNH</th>
            <th>SỐ ĐIỆN THOẠI</th>
            <th>ĐÁNH GIÁ</th>
            <th>ĐIỂM DANH</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.id} className={selectedStudentIds.has(student.id) ? "row-selected" : ""}>
              <td className="select-cell">
                <input 
                  type="checkbox" 
                  checked={selectedStudentIds.has(student.id)}
                  onChange={() => onToggleSelect(student.id)}
                />
              </td>
              <td className="student-index-cell">
                {(effectivePage - 1) * itemsPerPage + index + 1}
              </td>
              <td className="student-name-cell">
                <div className="student-main-info">
                  <span className="student-avatar">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="student-name">{student.name}</span>
                </div>
              </td>
              <td className="student-dob">{formatDate(student.dob)}</td>
              <td className="student-parent">{student.parentName}</td>
              <td className="student-phone">{student.parentPhone}</td>
              
              <td className="student-review-cell">
                <div className="review-display">
                  <button
                    type="button"
                    className="review-icon-btn"
                    onClick={() => onOpenReview(student)}
                    aria-label={`Xem đánh giá học sinh ${student.name}`}
                  >
                    {readOnly ? <FiEye /> : <FiEdit3 />}
                  </button>
                </div>
              </td>
              
              <td className="student-attendance-cell">
                <label className="attendance-checkbox">
                  <input
                    type="checkbox"
                    checked={!!studentAttendance[student.id]}
                    onChange={() => !readOnly && onToggleAttendance(student.id)}
                    disabled={readOnly}
                    aria-label={`Đi học ${student.name}`}
                  />
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsTable;




