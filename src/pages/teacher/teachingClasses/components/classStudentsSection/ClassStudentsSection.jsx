import React, { useState } from "react";
import { FiCheck, FiEdit3, FiSearch, FiX } from "react-icons/fi";
import "./ClassStudentsSection.css";

const ClassStudentsSection = ({ students }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentReviews, setStudentReviews] = useState({});
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [reviewDraft, setReviewDraft] = useState("");
  const ITEMS_PER_PAGE = 8;

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedStudents = filteredStudents.slice(
    (effectivePage - 1) * ITEMS_PER_PAGE,
    effectivePage * ITEMS_PER_PAGE
  );

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const goPrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const startEditReview = (student) => {
    setEditingStudentId(student.id);
    setReviewDraft(studentReviews[student.id] || "");
  };

  const cancelEditReview = () => {
    setEditingStudentId(null);
    setReviewDraft("");
  };

  const saveReview = (studentId) => {
    setStudentReviews((prev) => ({
      ...prev,
      [studentId]: reviewDraft.trim(),
    }));
    setEditingStudentId(null);
    setReviewDraft("");
  };

  return (
    <div className="students-card">
      <div className="students-card-header">
        <h2 className="students-card-title">Danh sách học sinh</h2>
        <div className="class-detail-search-box">
          <FiSearch className="class-detail-search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm học sinh..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="students-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>HỌC SINH</th>
              <th>NGÀY SINH</th>
              <th>PHỤ HUYNH</th>
              <th>SỐ ĐIỆN THOẠI</th>
              <th>ĐÁNH GIÁ</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.map((student, index) => (
              <tr key={student.id}>
                <td className="student-index-cell">
                  {(effectivePage - 1) * ITEMS_PER_PAGE + index + 1}
                </td>
                <td>
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
                  {editingStudentId === student.id ? (
                    <div className="review-editor">
                      <textarea
                        value={reviewDraft}
                        onChange={(e) => setReviewDraft(e.target.value)}
                        placeholder="Nhập đánh giá cho học sinh..."
                        rows={2}
                      />
                      <div className="review-editor-actions">
                        <button
                          type="button"
                          className="review-action-btn save"
                          onClick={() => saveReview(student.id)}
                          aria-label="Lưu đánh giá"
                        >
                          <FiCheck />
                          <span>Lưu</span>
                        </button>
                        <button
                          type="button"
                          className="review-action-btn cancel"
                          onClick={cancelEditReview}
                          aria-label="Hủy đánh giá"
                        >
                          <FiX />
                          <span>Hủy</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="review-display">
                      <p>
                        {studentReviews[student.id]
                          ? studentReviews[student.id]
                          : "Chưa có đánh giá"}
                      </p>
                      <button
                        type="button"
                        className="review-icon-btn"
                        onClick={() => startEditReview(student)}
                        aria-label={`Đánh giá học sinh ${student.name}`}
                      >
                        <FiEdit3 />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="students-pagination">
        <button
          type="button"
          className="page-btn"
          onClick={goPrevPage}
          disabled={effectivePage === 1}
          aria-label="Trang trước"
        >
          ‹
        </button>

        <div className="page-indicator">
          <span>{effectivePage}</span>
          <small>/ {totalPages}</small>
        </div>

        <button
          type="button"
          className="page-btn"
          onClick={goNextPage}
          disabled={effectivePage === totalPages}
          aria-label="Trang sau"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default ClassStudentsSection;