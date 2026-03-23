import React, { useEffect, useState } from "react";
import "./classInfoSection.css";

const defaultForm = {
    name: "",
    grade: "Khối 10",
    year: "",
    teacher: "Trần Thị Hương",
};

export default function ClassInfoSection({
                                             mode = "create",
                                             initialData = null,
                                             onClose,
                                             onSubmit,
                                         }) {
    const [formData, setFormData] = useState(defaultForm);

    useEffect(() => {
        if (mode === "edit" && initialData) {
            setFormData({
                id: initialData.id,
                name: initialData.name || "",
                grade: initialData.grade || "Khối 10",
                year: initialData.year || "",
                teacher: initialData.teacher || "Trần Thị Hương",
                students: initialData.students || 0,
                subjects: initialData.subjects || [],
                color: initialData.color || "blue",
            });
        } else {
            setFormData(defaultForm);
        }
    }, [mode, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
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
                        <label htmlFor="name">Tên lớp</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="10A1"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="grade">Khối lớp</label>
                        <select
                            id="grade"
                            name="grade"
                            value={formData.grade}
                            onChange={handleChange}
                        >
                            <option value="Khối 10">Khối 10</option>
                            <option value="Khối 11">Khối 11</option>
                            <option value="Khối 12">Khối 12</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="year">Năm học</label>
                        <input
                            id="year"
                            name="year"
                            type="text"
                            value={formData.year}
                            onChange={handleChange}
                            placeholder="2024-2025"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="teacher">Giáo viên chủ nhiệm</label>
                        <select
                            id="teacher"
                            name="teacher"
                            value={formData.teacher}
                            onChange={handleChange}
                        >
                            <option value="Trần Thị Hương">Trần Thị Hương</option>
                            <option value="Lê Văn Minh">Lê Văn Minh</option>
                            <option value="Phạm Thị Lan">Phạm Thị Lan</option>
                        </select>
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
            </div>
        </div>
    );
}