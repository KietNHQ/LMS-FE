import React from "react";
import { Link, useParams } from "react-router-dom";
import "./StudentClassDetail.css";
import { classList } from "./classesData";

export default function StudentClassDetail() {
  const { classId } = useParams();
  const classInfo = classList.find((item) => item.id === classId);

  if (!classInfo) {
    return (
      <section className="student-class-detail-page">
        <div className="student-class-detail-empty">
          <h1>Khong tim thay lop hoc</h1>
          <p>Lop hoc nay co the da duoc cap nhat hoac khong ton tai.</p>
          <Link to="/student/classes" className="student-class-detail-back-btn">
            Quay lai danh sach lop
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="student-class-detail-page">
      <Link to="/student/classes" className="student-class-detail-back-link">
        ← Quay lai lop hoc
      </Link>

      <header className="student-class-detail-header">
        <div>
          <span className="student-class-detail-tag">{classInfo.className}</span>
          <h1>{classInfo.title}</h1>
          <p>
            {classInfo.code} • {classInfo.room}
          </p>
        </div>
        <button type="button" className="student-class-detail-primary-btn">
          Vao lop hoc truc tuyen
        </button>
      </header>

      <div className="student-class-detail-stats">
        <article>
          <p>Tien do</p>
          <strong>{classInfo.progress}%</strong>
        </article>
        <article>
          <p>Ty le chuyen can</p>
          <strong>{classInfo.attendance}%</strong>
        </article>
        <article>
          <p>Buoi da hoc</p>
          <strong>
            {classInfo.completedLessons}/{classInfo.totalLessons}
          </strong>
        </article>
        <article>
          <p>Bai tap cho nop</p>
          <strong>{classInfo.assignmentsPending}</strong>
        </article>
      </div>

      <div className="student-class-detail-layout">
        <div className="student-class-detail-main">
          <section className="student-class-detail-card">
            <h2>Tong quan lop hoc</h2>
            <p className="student-class-detail-desc">{classInfo.description}</p>
            <ul>
              <li>Giao vien: {classInfo.teacher}</li>
              <li>Email: {classInfo.teacherEmail}</li>
              <li>Lich hoc: {classInfo.schedule}</li>
              <li>Buoi tiep theo: {classInfo.nextClass}</li>
            </ul>
          </section>

          <section className="student-class-detail-card">
            <h2>Bai tap sap den han</h2>
            {classInfo.assignments.map((assignment) => (
              <article key={assignment.id} className="student-class-detail-item">
                <div>
                  <h3>{assignment.title}</h3>
                  <p>Han nop: {assignment.due}</p>
                </div>
                <span>{assignment.status}</span>
              </article>
            ))}
          </section>
        </div>

        <aside className="student-class-detail-side">
          <section className="student-class-detail-card">
            <h2>Lich hoc gan day</h2>
            {classInfo.lessons.map((lesson) => (
              <div key={lesson.id} className="student-class-detail-side-item">
                <p>{lesson.title}</p>
                <span>{lesson.time}</span>
              </div>
            ))}
          </section>

          <section className="student-class-detail-card">
            <h2>Tai lieu nhanh</h2>
            <ul className="student-class-detail-resource-list">
              {classInfo.resources.map((resource) => (
                <li key={resource}>{resource}</li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
}

