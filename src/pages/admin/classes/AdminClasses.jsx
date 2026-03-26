import React, { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./AdminClasses.css";

import ClassListSection from "./components/classListSection/classListSection";
import ClassInfoSection from "./components/classInfoSection/classInfoSection";

const initialClasses = [
    {
        id: 1,
        name: "10A1",
        grade: "Khối 10",
        year: "2024-2025",
        teacher: "Trần Thị Hương",
        students: 35,
        paidStudents: 30,
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
        paidStudents: 28,
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
        paidStudents: 31,
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
        paidStudents: 29,
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
        paidStudents: 27,
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
        paidStudents: 26,
        subjects: ["Toán", "Hóa học", "Ngữ văn", "Lịch sử", "Tiếng Anh"],
        color: "purple",
    },
];

export default function AdminClasses() {
    const ITEMS_PER_PAGE = 6;

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const initialGrade = ["10", "11", "12"].includes(searchParams.get("grade"))
        ? searchParams.get("grade")
        : "all";

    const [classes, setClasses] = useState(initialClasses);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedGrade, setSelectedGrade] = useState(initialGrade);
    const [searchKeyword, setSearchKeyword] = useState("");

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    const gradeFilters = [
        { value: "all", label: "Tất cả" },
        { value: "10", label: "Khối 10" },
        { value: "11", label: "Khối 11" },
        { value: "12", label: "Khối 12" },
    ];

    const totalClasses = useMemo(() => classes.length, [classes]);

    const filteredClasses = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();

        return classes.filter((item) => {
            const gradeMatch = selectedGrade === "all" || item.grade === `Khối ${selectedGrade}`;

            if (!gradeMatch) {
                return false;
            }

            if (!keyword) {
                return true;
            }

            return [item.name, item.grade, item.teacher, item.year]
                .join(" ")
                .toLowerCase()
                .includes(keyword);
        });
    }, [classes, searchKeyword, selectedGrade]);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(filteredClasses.length / ITEMS_PER_PAGE)),
        [filteredClasses]
    );

    const safeCurrentPage = Math.min(currentPage, totalPages);

    const paginatedClasses = useMemo(() => {
        const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
        return filteredClasses.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredClasses, safeCurrentPage]);

    const handleOpenCreate = () => {
        setIsCreateOpen(true);
    };

    const handleCloseCreate = () => {
        setIsCreateOpen(false);
    };

    const handleOpenDetail = (classItem) => {
        navigate(`/admin/classes/${classItem.id}`);
    };

    const handleSearchKeyword = (event) => {
        setSearchKeyword(event.target.value);
        setCurrentPage(1);
    };

    const handleChangeGrade = (gradeValue) => {
        setSelectedGrade(gradeValue);
        setCurrentPage(1);

        const nextParams = new URLSearchParams(searchParams);
        if (gradeValue === "all") {
            nextParams.delete("grade");
        } else {
            nextParams.set("grade", gradeValue);
        }
        setSearchParams(nextParams);
    };

    const goPrevPage = () => {
        setCurrentPage((prev) => Math.max(1, Math.min(prev, totalPages) - 1));
    };

    const goNextPage = () => {
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
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
            paidStudents: 0,
            subjects: [],
            color:
                newClass.grade === "Khối 10"
                    ? "blue"
                    : newClass.grade === "Khối 11"
                        ? "teal"
                        : "purple",
        };

        setClasses((prev) => [createdClass, ...prev]);
        setCurrentPage(1);
        setIsCreateOpen(false);
    };

    const handleUpdateClass = (updatedClass) => {
        setClasses((prev) =>
            prev.map((item) => (item.id === updatedClass.id ? { ...item, ...updatedClass } : item))
        );
        setIsEditOpen(false);
        setSelectedClass(null);
    };

    const handleDeleteClass = (id) => {
        setClasses((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <div className="admin-classes-page">
            <div className="admin-classes-header">
                <div className="admin-classes-header__content">
                    <h1>Quản lý lớp học</h1>
                    <span className="admin-classes-header__subtitle">
                        {filteredClasses.length} / {totalClasses} lớp học đang hoạt động
                    </span>
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

            <div className="admin-classes-toolbar">
                <div className="admin-classes-search">
                    <FiSearch aria-hidden="true" />
                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={handleSearchKeyword}
                        placeholder="Tìm tên lớp, giáo viên, năm học..."
                        aria-label="Tìm kiếm lớp học"
                    />
                </div>

                <div className="admin-classes-grade-filter" role="tablist" aria-label="Lọc theo khối">
                    {gradeFilters.map((filter) => (
                        <button
                            key={filter.value}
                            type="button"
                            className={`admin-classes-grade-btn ${selectedGrade === filter.value ? "is-active" : ""}`}
                            onClick={() => handleChangeGrade(filter.value)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="admin-classes-body">
                {paginatedClasses.length > 0 ? (
                    <ClassListSection
                        classes={paginatedClasses}
                        onView={handleOpenDetail}
                        onEdit={handleOpenEdit}
                        onDelete={handleDeleteClass}
                    />
                ) : (
                    <div className="admin-classes-empty-state">
                        <h3>Không tìm thấy lớp phù hợp</h3>
                        <p>Thử đổi bộ lọc khối hoặc từ khóa tìm kiếm.</p>
                    </div>
                )}

                <div className="admin-classes-pagination">
                    <button
                        type="button"
                        className="admin-classes-page-btn"
                        onClick={goPrevPage}
                        disabled={safeCurrentPage === 1}
                        aria-label="Trang trước"
                    >
                        ‹
                    </button>

                    <div className="admin-classes-page-indicator">
                        <span>{safeCurrentPage}</span>
                        <small>/ {totalPages}</small>
                    </div>

                    <button
                        type="button"
                        className="admin-classes-page-btn"
                        onClick={goNextPage}
                        disabled={safeCurrentPage === totalPages}
                        aria-label="Trang sau"
                    >
                        ›
                    </button>
                </div>
            </div>

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
        </div>
    );
}