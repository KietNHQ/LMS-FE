import React, { useMemo, useState } from "react";
import "./AdminClasses.css";

import ClassListSection from "./components/classListSection/classListSection";
import ClassDetailSection from "./components/classDetailSection/classDetailSection";
import ClassInfoSection from "./components/classInfoSection/classInfoSection";

const initialClasses = [
    {
        id: 1,
        name: "10A1",
        grade: "Khối 10",
        year: "2024-2025",
        teacher: "Trần Thị Hương",
        students: 35,
        subjects: ["Toán", "Vật lý", "Hóa học", "Ngữ văn", "Tiếng Anh"],
        color: "blue",
    },
    {
        id: 2,
        name: "10A2",
        grade: "Khối 10",
        year: "2024-2025",
        teacher: "Lê Văn Minh",
        students: 33,
        subjects: ["Toán", "Vật lý", "Hóa học", "Ngữ văn", "Tiếng Anh"],
        color: "blue",
    },
    {
        id: 3,
        name: "11B1",
        grade: "Khối 11",
        year: "2024-2025",
        teacher: "Phạm Thị Lan",
        students: 36,
        subjects: ["Toán", "Sinh học", "Ngữ văn", "Lịch sử", "Tiếng Anh"],
        color: "teal",
    },
    {
        id: 4,
        name: "11B2",
        grade: "Khối 11",
        year: "2024-2025",
        teacher: "Trần Thị Hương",
        students: 34,
        subjects: ["Toán", "Sinh học", "Ngữ văn", "Lịch sử", "Tiếng Anh"],
        color: "teal",
    },
    {
        id: 5,
        name: "12C1",
        grade: "Khối 12",
        year: "2024-2025",
        teacher: "Lê Văn Minh",
        students: 32,
        subjects: ["Toán", "Hóa học", "Ngữ văn", "Địa lý", "Tiếng Anh"],
        color: "purple",
    },
    {
        id: 6,
        name: "12C2",
        grade: "Khối 12",
        year: "2024-2025",
        teacher: "Phạm Thị Lan",
        students: 31,
        subjects: ["Toán", "Hóa học", "Ngữ văn", "Lịch sử", "Tiếng Anh"],
        color: "purple",
    },
];

export default function AdminClasses() {
    const [classes, setClasses] = useState(initialClasses);
    const [selectedClass, setSelectedClass] = useState(null);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const totalClasses = useMemo(() => classes.length, [classes]);

    const handleOpenCreate = () => {
        setIsCreateOpen(true);
    };

    const handleCloseCreate = () => {
        setIsCreateOpen(false);
    };

    const handleOpenDetail = (classItem) => {
        setSelectedClass(classItem);
        setIsDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        setSelectedClass(null);
    };

    const handleOpenEdit = (classItem) => {
        setSelectedClass(classItem);
        setIsEditOpen(true);
    };

    const handleCloseEdit = () => {
        setIsEditOpen(false);
        setSelectedClass(null);
    };

    const handleCreateClass = (newClass) => {
        const createdClass = {
            id: Date.now(),
            ...newClass,
            students: 0,
            subjects: [],
            color:
                newClass.grade === "Khối 10"
                    ? "blue"
                    : newClass.grade === "Khối 11"
                        ? "teal"
                        : "purple",
        };

        setClasses((prev) => [createdClass, ...prev]);
        setIsCreateOpen(false);
    };

    const handleUpdateClass = (updatedClass) => {
        setClasses((prev) =>
            prev.map((item) => (item.id === updatedClass.id ? updatedClass : item))
        );
        setIsEditOpen(false);
        setSelectedClass(null);
    };

    const handleDeleteClass = (id) => {
        setClasses((prev) => prev.filter((item) => item.id !== id));
        if (selectedClass?.id === id) {
            setSelectedClass(null);
            setIsDetailOpen(false);
            setIsEditOpen(false);
        }
    };

    return (
        <div className="admin-classes-page">
            <div className="admin-classes-header">
                <div className="admin-classes-header__content">
                    <h1>Quản lý Lớp học</h1>
                    <p>{totalClasses} lớp học đang hoạt động</p>
                </div>

                <button
                    type="button"
                    className="admin-classes-header__create-btn"
                    onClick={handleOpenCreate}
                >
                    <span className="plus-icon">+</span>
                    Tạo lớp học
                </button>
            </div>

            <ClassListSection
                classes={classes}
                onView={handleOpenDetail}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteClass}
            />

            {isCreateOpen && (
                <ClassInfoSection
                    mode="create"
                    onClose={handleCloseCreate}
                    onSubmit={handleCreateClass}
                />
            )}

            {isEditOpen && selectedClass && (
                <ClassInfoSection
                    mode="edit"
                    initialData={selectedClass}
                    onClose={handleCloseEdit}
                    onSubmit={handleUpdateClass}
                />
            )}

            {isDetailOpen && selectedClass && (
                <ClassDetailSection
                    classData={selectedClass}
                    onClose={handleCloseDetail}
                />
            )}
        </div>
    );
}