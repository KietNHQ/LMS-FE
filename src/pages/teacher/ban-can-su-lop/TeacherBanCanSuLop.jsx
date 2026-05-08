import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { teachingClassesData } from "../teachingClasses/data/teachingClassesData";
import "./TeacherBanCanSuLop.css";

const officerTabs = [
  { key: "lop-truong", label: "Lớp trưởng", description: "Người đứng đầu lớp" },
  { key: "pho-hoc-tap", label: "Phó học tập", description: "Hỗ trợ công tác học tập" },
  { key: "bi-thu", label: "Bí thư", description: "Phụ trách phong trào" },
];

const STORAGE_KEY = "classOfficers";

function loadOfficersFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function TeacherBanCanSuLop() {
  const classes = useMemo(() => teachingClassesData, []);
  const [searchParams] = useSearchParams();
  const [selectedClassId, setSelectedClassId] = useState(() => {
    const q = searchParams.get("classId");
    if (q) {
      const n = Number(q);
      return Number.isNaN(n) ? (classes?.[0]?.id ?? null) : n;
    }
    return classes?.[0]?.id ?? null;
  });
  const [officers, setOfficers] = useState(() => loadOfficersFromStorage());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(officers));
    } catch {
      // ignore
    }
  }, [officers]);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || null;

  function assignOfficer(roleKey, studentId) {
    if (!selectedClassId) return;
    setOfficers((prev) => {
      const next = { ...prev };
      const classMap = { ...(next[selectedClassId] || {}) };
      if (!studentId) {
        delete classMap[roleKey];
      } else {
        classMap[roleKey] = studentId;
      }
      next[selectedClassId] = classMap;
      return next;
    });
  }

  function getAssignedStudentName(roleKey) {
    const classMap = officers[selectedClassId] || {};
    const studentId = classMap[roleKey];
    const student = selectedClass?.students?.find((s) => s.id === studentId);
    return student ? student.name : "— Chưa phân công —";
  }

  return (
    <div className="teacher-ban-can-su-lop-page">
      <div className="teacher-ban-can-su-lop-header">
        <div className="teacher-ban-can-su-lop-header__title">
          <h1>Phân bổ Ban Cán Sự Lớp</h1>
          <p>Chọn lớp bên trái để phân công Lớp trưởng / Phó học tập / Bí thư. Dữ liệu lưu cục bộ (localStorage) và có thể đồng bộ với giao diện học sinh.</p>
        </div>
      </div>

      <div className="teacher-ban-can-su-lop-content">
        <aside className="teacher-ban-can-su-lop-classes">
          <h3>Danh sách lớp</h3>
          <div className="teacher-ban-can-su-lop-class-list">
            {classes.map((cls) => (
              <button
                key={cls.id}
                className={`teacher-ban-can-su-lop-class-card ${cls.id === selectedClassId ? "active" : ""}`}
                onClick={() => setSelectedClassId(cls.id)}
              >
                <div className="class-card-title">{cls.name}</div>
                <div className="class-card-sub">{cls.grade} · {cls.subject}</div>
                <div className="class-card-meta">GV: {cls.teacher} · HS: {cls.students?.length ?? 0}</div>
              </button>
            ))}
          </div>
        </aside>

        <section className="teacher-ban-can-su-lop-panel">
          {selectedClass ? (
            <>
              <div className="teacher-ban-can-su-lop-panel__header">
                <h2>{selectedClass.name} — {selectedClass.subject}</h2>
                <span>{selectedClass.year}</span>
              </div>

              <div className="teacher-ban-can-su-lop-assignments">
                {officerTabs.map((tab) => (
                  <div key={tab.key} className="assignment-row">
                    <div className="assignment-info">
                      <strong>{tab.label}</strong>
                      <small>{tab.description}</small>
                    </div>

                    <div className="assignment-control">
                      <div className="assigned-name">{getAssignedStudentName(tab.key)}</div>
                      <select
                        value={(officers[selectedClassId] && officers[selectedClassId][tab.key]) || ""}
                        onChange={(e) => assignOfficer(tab.key, e.target.value ? Number(e.target.value) : null)}
                        size="5"
                      >
                        <option value="">-- Chọn học sinh --</option>
                        {selectedClass.students.map((s) => (
                          <option key={s.id} value={s.id}>{s.name} — {s.parentName}</option>
                        ))}
                      </select>
                      <button className="btn-clear" onClick={() => assignOfficer(tab.key, null)}>Xóa</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="teacher-ban-can-su-lop-footer">
                <small>Ghi chú: phân công lưu cục bộ trên trình duyệt. Để đồng bộ toàn hệ thống, tích hợp API sẽ cần được triển khai.</small>
              </div>
            </>
          ) : (
            <div>Chưa có lớp để hiển thị.</div>
          )}
        </section>
      </div>
    </div>
  );
}


