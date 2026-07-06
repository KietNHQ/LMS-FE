import React from "react";
import { FiEdit2, FiTrash2, FiBookOpen, FiCalendar } from "react-icons/fi";
import { PiStudent } from "react-icons/pi";
import { LuSchool } from "react-icons/lu";
import "./classListSection.css";

const colorMap = {
    blue: "is-blue",
    teal: "is-teal",
    purple: "is-purple",
};

export default function ClassListSection({ classes, onView, onEdit, onDelete, onTimetable }) {
    return (
        <div className="class-list-grid">
            {classes.map((item) => (
                <article
                    className="class-list-card"
                    key={item.id}
                    onClick={() => onView(item)}
                    style={{ cursor: "pointer" }}
                >
                    <div className="class-list-card__top">
                        <div className={`class-list-card__icon ${colorMap[item.color] || "is-blue"}`}>
                            <LuSchool />
                        </div>

                        <div className="class-list-card__heading">
                            <h3>{item.name}</h3>
                            <p>
                                {item.grade} • {item.year}
                            </p>
                        </div>

                        <div className="class-list-card__actions" onClick={(e) => e.stopPropagation()}>
                            <button type="button" onClick={() => onTimetable(item)} title="Xem thời khóa biểu">
                                <FiCalendar />
                            </button>
                            <button type="button" onClick={() => onEdit(item)} title="Chỉnh sửa">
                                <FiEdit2 />
                            </button>
                            <button type="button" onClick={() => onDelete(item)} title="Xóa">
                                <FiTrash2 />
                            </button>
                        </div>
                    </div>

                    <div className="class-list-card__meta">
                        <div className="meta-row">
                            <span className="meta-left">
                                <PiStudent />
                                Học sinh
                            </span>
                            <strong>{item.students}{item.maxStudents ? `/${item.maxStudents}` : ""}</strong>
                        </div>

                        <div className="meta-row">
                            <span className="meta-left">
                                <PiStudent />
                                Đã đóng học phí
                            </span>
                            <strong>{item.paidStudents ?? 0}/{item.students}</strong>
                        </div>

                        <div className="meta-row">
                            <span className="meta-left">
                                <FiBookOpen />
                                Môn học
                            </span>
                            <strong>{item.subjects.length}</strong>
                        </div>
                    </div>

                    <div className="class-list-card__teacher">
                        <span>GVCN</span>
                        <strong>{item.teacher}</strong>
                    </div>
                </article>
            ))}
        </div>
    );
}
