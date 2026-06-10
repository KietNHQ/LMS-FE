import React, { useEffect, useState } from "react";
import "./classInfoSection.css";
import { Select } from "../../../../../components/ui";
import TeacherSelectDialog from "./TeacherSelectDialog";

const getCurrentYear = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    return `${currentYear}-${currentYear + 1}`;
};

const gradeLetterMap = {
    "Khối 10": "A",
    "Khối 11": "B",
    "Khối 12": "C",
};

const buildDefaultForm = (gradeOptions, defaultSchoolYear) => {
    const firstGrade = gradeOptions[0];
    const gradeLabel = firstGrade?.label || "Khối 10";
    const gradeNum = `${gradeLabel}`.match(/\d+/)?.[0] || "10";
    return {
        grade: gradeLabel,
        name: `${gradeNum}A`,
        year: defaultSchoolYear || getCurrentYear(),
        teacher: "",
        maxStudents: 40,
    };
};

export default function ClassInfoSection({
    mode = "create",
    initialData = null,
    gradeOptions = [],
    defaultSchoolYear = "",
    onClose,
    onSubmit,
}) {
    const selectGradeOptions = gradeOptions.map((g) => ({
        label: g.label,
        value: g.label,
    }));

    const [formData, setFormData] = useState(() => buildDefaultForm(selectGradeOptions, defaultSchoolYear));
    const [isTeacherDialogOpen, setIsTeacherDialogOpen] = useState(false);

    useEffect(() => {
        if (mode === "edit" && !initialData) {
            return;
        }

        if (mode === "edit" && initialData) {
            setFormData({
                grade: initialData.grade || "Khối 10",
                name: initialData.name || "",
                year: initialData.year || getCurrentYear(),
                teacher: initialData.teacher || "",
                id: initialData.id,
                students: initialData.students || 0,
                subjects: initialData.subjects || [],
                color: initialData.color || "blue",
                maxStudents: initialData.maxStudents || 40,
            });
        } else if (mode === "create") {
            setFormData(buildDefaultForm(selectGradeOptions, defaultSchoolYear));
        }
    }, [mode, initialData, defaultSchoolYear, gradeOptions]);

    const handleGradeChange = (e) => {
        const newGrade = e.target.value;
        const letter = gradeLetterMap[newGrade] || "A";
        const gradeNum = newGrade.match(/\d+/)?.[0] || "10";

        setFormData((prev) => ({
            ...prev,
            grade: newGrade,
            name: `${gradeNum}${letter}`,
        }));
    };

    const handleNameChange = (e) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            name: value,
        }));
    };

    const handleYearArrow = (direction) => {
        const parts = formData.year.split("-");
        if (
            parts.length === 2 &&
            /^\d{4}$/.test(parts[0]) &&
            /^\d{4}$/.test(parts[1])
        ) {
            const startYear = parseInt(parts[0], 10);
            const endYear = parseInt(parts[1], 10);
            const increment = direction === "next" ? 1 : -1;
            const newStartYear = startYear + increment;
            const newEndYear = endYear + increment;
            setFormData((prev) => ({
                ...prev,
                year: `${newStartYear}-${newEndYear}`,
            }));
        }
    };

    const handleTeacherSelect = (teacherName) => {
        setFormData((prev) => ({
            ...prev,
            teacher: teacherName,
        }));
    };

    const handleMaxStudentsChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            maxStudents: parseInt(e.target.value, 10) || 40,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const normalizedName = formData.name.trim();
        const normalizedYear = formData.year.trim();

        if (!normalizedName || !normalizedYear) return;

        onSubmit({
            ...formData,
            name: normalizedName,
            year: normalizedYear,
        });
    };

    const isEdit = mode === "edit";

    return (
        <div className="class-info-modal-overlay" onClick={onClose}>
            <div className="class-info-modal" onClick={(e) => e.stopPropagation()}>
                <h2>{isEdit ? "Chỉnh sửa lớp" : "Tạo lớp học mới"}</h2>

                <form className="class-info-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <Select
                            label="Khối lớp"
                            options={selectGradeOptions.length > 0 ? selectGradeOptions : [{ label: "Khối 10", value: "Khối 10" }]}
                            value={formData.grade}
                            onChange={handleGradeChange}
                            name="grade"
                            id="grade"
                            variant="custom"
                            className="form-select"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="name">Tên lớp</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleNameChange}
                            placeholder="10A1"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="year">Năm học</label>
                        <div className="year-input-wrapper">
                            <button
                                type="button"
                                className="year-arrow-btn"
                                onClick={() => handleYearArrow("prev")}
                                title="Năm trước"
                            >
                                ◀
                            </button>
                            <input
                                id="year"
                                name="year"
                                type="text"
                                value={formData.year}
                                readOnly
                                placeholder="2024-2025"
                                className="year-input-readonly"
                            />
                            <button
                                type="button"
                                className="year-arrow-btn"
                                onClick={() => handleYearArrow("next")}
                                title="Năm sau"
                            >
                                ▶
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="teacher">Giáo viên chủ nhiệm</label>
                        <button
                            type="button"
                            className="teacher-select-btn"
                            onClick={() => setIsTeacherDialogOpen(true)}
                        >
                            <span>{formData.teacher}</span>
                            <span className="teacher-chevron">▼</span>
                        </button>
                    </div>

                    <div className="form-group">
                        <label htmlFor="maxStudents">Sĩ số tối đa</label>
                        <input
                            id="maxStudents"
                            name="maxStudents"
                            type="number"
                            min="1"
                            max="100"
                            value={formData.maxStudents}
                            onChange={handleMaxStudentsChange}
                            className="class-info-number-input"
                        />
                    </div>

                    <div className="class-info-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Hủy
                        </button>

                        <button type="submit" className="btn-primary">
                            {isEdit ? "Lưu" : "Tạo lớp"}
                        </button>
                    </div>
                </form>

                {isTeacherDialogOpen && (
                    <TeacherSelectDialog
                        onClose={() => setIsTeacherDialogOpen(false)}
                        onSelect={handleTeacherSelect}
                        currentTeacher={formData.teacher}
                    />
                )}
            </div>
        </div>
    );
}
