import React, { useCallback, useEffect, useMemo, useState } from "react";

import "./AdminStudents.css";
import { CreateUserDialog, Pagination } from "../../../../../components/common";

import StudentActionsSection from "./components/studentActionsSection/studentActionsSection";
import StudentListSection from "./components/studentListSection/studentListSection";
import StudentInformationSection from "./components/studentInformationSection/studentInformationSection";
import { studentsService } from "../../../../../services/pages/admin/users";

const statusOptions = ["Tất cả trạng thái", "Đang học", "Đình chỉ", "Bảo lưu", "Đã tốt nghiệp"];
const ITEMS_PER_PAGE = 6;

const emptyStudentForm = {
  name: "",
  email: "",
  className: "10A1",
  academicYear: "",
  gender: "Nam",
  dob: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  address: "",
  status: "Đang học",
};

const getErrorMessage = (error, fallback) => {
  const apiError = error?.response?.data?.error;
  const apiMessage = error?.response?.data?.message;
  return apiError || apiMessage || fallback;
};

const toStudentForm = (student = {}) => ({
  id: student.id,
  name: student.name || "",
  email: student.email || "",
  className: student.className || "10A1",
  academicYear: student.academicYear || "",
  gender: student.gender || "Nam",
  dob: student.dob || "",
  parentName: student.parentName || "",
  parentPhone: student.parentPhone || "",
  parentEmail: student.parentEmail || "",
  address: student.address || "",
  status: student.status || "Đang học",
  teacher: student.teacher || "Chưa phân công",
  profile: student.profile || {},
});

const buildDownloadName = (fallbackName) => fallbackName;

export default function AdminStudents({ onCountChange, schoolYear }) {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("Tất cả lớp");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả trạng thái");

  const [activeModalMode, setActiveModalMode] = useState(null);
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [isCreateStudentAccountOpen, setIsCreateStudentAccountOpen] = useState(false);
  const [isImportingExcel, setIsImportingExcel] = useState(false);
  const [importFeedback, setImportFeedback] = useState(null);

  const [studentForm, setStudentForm] = useState(emptyStudentForm);
  const [currentPage, setCurrentPage] = useState(1);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const rows = await studentsService.listStudents();
      setStudents(rows);
    } catch (error) {
      setStudents([]);
      setLoadError(getErrorMessage(error, "Không thể tải danh sách học sinh."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    onCountChange?.(students.length);
  }, [students.length, onCountChange]);

  const classOptions = useMemo(() => {
    const classes = Array.from(new Set(students.map((student) => student.className).filter(Boolean)));
    return ["Tất cả lớp", ...classes];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchYear = !schoolYear || student.academicYear === schoolYear || !student.academicYear;
      const matchSearch =
        (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.parentName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.parentPhone || "").includes(searchTerm);
      const matchClass = selectedClass === "Tất cả lớp" || student.className === selectedClass;
      const matchStatus = selectedStatus === "Tất cả trạng thái" || student.status === selectedStatus;
      return matchYear && matchSearch && matchClass && matchStatus;
    });
  }, [students, searchTerm, selectedClass, selectedStatus, schoolYear]);

  const hasFilteredStudents = filteredStudents.length > 0;
  const shouldRenderDataSection = !isLoading && !loadError;
  const emptyMessage = students.length === 0 ? "Chưa có dữ liệu học sinh." : "Không tìm thấy học sinh phù hợp.";

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClass, selectedStatus]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const handleCreateStudentAccount = async (formData) => {
    try {
      await studentsService.createStudent(formData);
      setIsCreateStudentAccountOpen(false);
      setImportFeedback(null);
      await loadStudents();
    } catch (error) {
      window.alert(getErrorMessage(error, "Không thể tạo tài khoản học sinh."));
    }
  };

  const handleImportExcel = async (file) => {
    if (!file) return;

    try {
      setIsImportingExcel(true);
      setImportFeedback({ type: "info", message: `Đang nạp dữ liệu từ file ${file.name}...` });
      await studentsService.importStudents(file);
      await loadStudents();
      setImportFeedback({ type: "success", message: "Đã nạp dữ liệu học sinh thành công." });
    } catch (error) {
      setImportFeedback({
        type: "error",
        message: getErrorMessage(error, "Không thể import học sinh từ file Excel."),
      });
    } finally {
      setIsImportingExcel(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await studentsService.downloadTemplate();
      const blob = response instanceof Blob ? response : response?.data;
      if (!(blob instanceof Blob)) {
        window.alert("Không thể tải file mẫu import.");
        return;
      }

      const fileName = buildDownloadName("mau-import-hoc-sinh.xlsx");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      window.alert(getErrorMessage(error, "Không thể tải file mẫu import học sinh."));
    }
  };

  const handleCloseModal = () => {
    setActiveModalMode(null);
    setActiveStudentId(null);
    setStudentForm(emptyStudentForm);
  };

  const handleInputChange = (field, value) => {
    setStudentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getTeacherByClass = (className) => {
    const matched = students.find((student) => student.className === className && student.teacher);
    return matched?.teacher || "Chưa phân công";
  };

  const handleSaveStudentEdit = async () => {
    if (!activeStudentId) return;

    const payload = {
      ...studentForm,
      profile: {
        ...(studentForm.profile || {}),
        parentName: studentForm.parentName,
        parentPhone: studentForm.parentPhone,
        parentEmail: studentForm.parentEmail,
        className: studentForm.className,
        gender: studentForm.gender,
        address: studentForm.address,
        status: studentForm.status,
      },
    };

    try {
      await studentsService.updateStudent(activeStudentId, payload);
      await loadStudents();
      window.alert(`Đã cập nhật học sinh ${studentForm.name.trim()} thành công.`);
      handleCloseModal();
    } catch (error) {
      window.alert(getErrorMessage(error, "Không thể cập nhật học sinh."));
    }
  };

  const handleDeleteStudent = async (id) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa học sinh này không?");
    if (!confirmed) return;

    try {
      await studentsService.deleteStudent(id);
      await loadStudents();
    } catch (error) {
      window.alert(getErrorMessage(error, "Không thể xóa học sinh."));
    }
  };

  const handleViewStudent = (student) => {
    setActiveModalMode("view");
    setActiveStudentId(student.id);
    setStudentForm(toStudentForm(student));
  };

  const handleEditStudent = (student) => {
    setActiveModalMode("edit");
    setActiveStudentId(student.id);
    setStudentForm(toStudentForm(student));
  };

  const activeStudent = useMemo(
    () => students.find((student) => student.id === activeStudentId) || null,
    [students, activeStudentId]
  );

  return (
    <div className="admin-students-page">
      <StudentActionsSection
        totalStudents={students.length}
        searchTerm={searchTerm}
        selectedClass={selectedClass}
        classOptions={classOptions}
        selectedStatus={selectedStatus}
        statusOptions={statusOptions}
        onSearchChange={setSearchTerm}
        onClassChange={setSelectedClass}
        onStatusChange={setSelectedStatus}
        onCreateStudentAccount={() => setIsCreateStudentAccountOpen(true)}
      />

      {loadError && <div className="student-empty-row">{loadError}</div>}
      {isLoading && <div className="student-empty-row">Đang tải danh sách học sinh...</div>}

      {shouldRenderDataSection && (
        <>
          <StudentListSection
            students={paginatedStudents}
            emptyMessage={emptyMessage}
            onSelectStudent={handleViewStudent}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
          />

          {hasFilteredStudents && totalPages > 1 && (
            <div className="admin-students-pagination-row">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                ariaLabel="Phân trang học sinh"
              />
            </div>
          )}
        </>
      )}

      {activeModalMode && (
        <StudentInformationSection
          mode={activeModalMode}
          formData={studentForm}
          classOptions={classOptions.filter((item) => item !== "Tất cả lớp")}
          teacherName={activeStudent?.teacher || getTeacherByClass(studentForm.className)}
          onChange={handleInputChange}
          onRequestEdit={() => setActiveModalMode("edit")}
          onClose={handleCloseModal}
          onSubmit={handleSaveStudentEdit}
        />
      )}

      {isCreateStudentAccountOpen && (
        <CreateUserDialog
          mode="create"
          title="Tạo tài khoản học sinh"
          submitLabel="Tạo tài khoản"
          fixedRole="Học sinh"
          onClose={() => {
            setIsCreateStudentAccountOpen(false);
            setImportFeedback(null);
          }}
          onSubmit={handleCreateStudentAccount}
          onImportExcel={handleImportExcel}
          onDownloadTemplate={handleDownloadTemplate}
          isImportingExcel={isImportingExcel}
          importFeedback={importFeedback}
        />
      )}
    </div>
  );
}

