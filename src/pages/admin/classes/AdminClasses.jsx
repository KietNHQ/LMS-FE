import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./AdminClasses.css";

import ClassListSection from "./components/classListSection/classListSection";
import ClassInfoSection from "./components/classInfoSection/classInfoSection";
import { SchoolYearTermSelector, PageHeader } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { classesService } from "../../../services/pages/admin/classes";

const ITEMS_PER_PAGE = 6;

const getErrorMessage = (error, fallback) => {
  const apiError = error?.response?.data?.error;
  const apiMessage = error?.response?.data?.message;
  return apiError || apiMessage || fallback;
};

export default function AdminClasses() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialGrade = ["10", "11", "12"].includes(searchParams.get("grade"))
    ? searchParams.get("grade")
    : "all";
  const initialClassKeyword = searchParams.get("class") || "";

  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState(initialGrade);
  const [searchKeyword, setSearchKeyword] = useState(initialClassKeyword);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const gradeFilters = [
    { value: "all", label: "Tất cả" },
    { value: "10", label: "Khối 10" },
    { value: "11", label: "Khối 11" },
    { value: "12", label: "Khối 12" },
  ];

  const loadClasses = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const rows = await classesService.listClasses();
      setClasses(rows);
    } catch (error) {
      setClasses([]);
      setLoadError(getErrorMessage(error, "Không thể tải danh sách lớp học."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const totalClasses = useMemo(() => classes.length, [classes]);

  const filteredClasses = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return classes.filter((item) => {
      const yearMatch = item.year === selectedSchoolYear || !item.year;
      if (!yearMatch) {
        return false;
      }

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
  }, [classes, searchKeyword, selectedGrade, selectedSchoolYear]);

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
    nextParams.delete("class");
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

  const handleCreateClass = async (newClass) => {
    try {
      await classesService.createClass(newClass);
      setCurrentPage(1);
      setIsCreateOpen(false);
      await loadClasses();
    } catch (error) {
      window.alert(getErrorMessage(error, "Không thể tạo lớp học."));
    }
  };

  const handleUpdateClass = async (updatedClass) => {
    try {
      await classesService.updateClass(updatedClass.id, updatedClass);
      setIsEditOpen(false);
      setSelectedClass(null);
      await loadClasses();
    } catch (error) {
      window.alert(getErrorMessage(error, "Không thể cập nhật lớp học."));
    }
  };

  const handleDeleteClass = async (id) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa lớp này không?");
    if (!confirmed) return;

    try {
      await classesService.deleteClass(id);
      await loadClasses();
    } catch (error) {
      window.alert(getErrorMessage(error, "Không thể xóa lớp học."));
    }
  };

  return (
    <div className="admin-classes-page">
      <PageHeader
        title="Quản lý Lớp học"
        eyebrow={`${filteredClasses.length} / ${totalClasses} lớp đang hoạt động`}
        actions={
          <SchoolYearTermSelector
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            onTermChange={handleTermChange}
          />
        }
      />

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
        <button
          type="button"
          className="admin-classes-header__create-btn"
          onClick={handleOpenCreate}
          style={{ marginLeft: "1rem", whiteSpace: "nowrap" }}
        >
          <span className="plus-icon">+</span>
          Tạo lớp học
        </button>
      </div>

      <div className="admin-classes-body">
        {isLoading ? (
          <div className="admin-classes-empty-state">
            <h3>Đang tải danh sách lớp học...</h3>
          </div>
        ) : loadError ? (
          <div className="admin-classes-empty-state">
            <h3>{loadError}</h3>
          </div>
        ) : paginatedClasses.length > 0 ? (
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