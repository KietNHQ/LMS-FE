import React, { useCallback, useEffect, useMemo, useState } from "react";

import "./AdminTeachers.css";
import { CreateUserDialog, Pagination } from "../../../../../components/common";
import TeacherActionsSection from "./components/teacherActionsSection/teacherActionsSection";
import TeacherListSection from "./components/teacherListSection/teacherListSection";
import TeacherInformationSection from "./components/teacherInformationSection/teacherInformationSection";
import TeacherDetailSection from "./components/TeacherDetailSection/TeacherDetailSection";
import { teachersService } from "../../../../../services/pages/admin/users";

const statusOptions = ["Tất cả trạng thái", "Hoạt động", "Tạm khóa"];
const classOptions = ["10A1", "10A2", "11B1", "11B2", "12C1", "12C2"];
const ITEMS_PER_PAGE = 7;

const emptyTeacherForm = {
  id: "",
  name: "",
  dob: "",
  email: "",
  subject: "",
  phone: "",
  homeroomClass: "",
  assignedClasses: [],
  status: "Hoạt động",
  profile: {},
};

const getErrorMessage = (error, fallback) => {
  const apiError = error?.response?.data?.error;
  const apiMessage = error?.response?.data?.message;
  return apiError || apiMessage || fallback;
};

const toTeacherForm = (teacher = {}) => ({
  id: teacher.id,
  name: teacher.name || "",
  dob: teacher.dob || "",
  email: teacher.email || "",
  subject: teacher.subject || teacher.profile?.subject || "",
  phone: teacher.phone === "—" ? "" : teacher.phone || "",
  homeroomClass: teacher.homeroomClass || "",
  assignedClasses: teacher.assignedClasses || [],
  status: teacher.status || "Hoạt động",
  profile: teacher.profile || {},
});

export default function AdminTeachers({ onCountChange }) {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả trạng thái");
  const [selectedSubject, setSelectedSubject] = useState("Tất cả môn");

  const [activeModalMode, setActiveModalMode] = useState(null);
  const [activeTeacherId, setActiveTeacherId] = useState(null);
  const [teacherForm, setTeacherForm] = useState(emptyTeacherForm);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportingExcel, setIsImportingExcel] = useState(false);
  const [importFeedback, setImportFeedback] = useState(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadTeachers = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const rows = await teachersService.listTeachers();
      setTeachers(rows);
    } catch (error) {
      setTeachers([]);
      setLoadError(getErrorMessage(error, "Không thể tải danh sách giáo viên."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  useEffect(() => {
    onCountChange?.(teachers.length);
  }, [teachers.length, onCountChange]);

  const subjectOptions = useMemo(() => {
    const subjects = teachers.map((teacher) => teacher.subject).filter(Boolean);
    return ["Tất cả môn", ...new Set(subjects)];
  }, [teachers]);

  const editableSubjectOptions = useMemo(() => {
    const options = subjectOptions.filter((subject) => subject !== "Tất cả môn");
    if (teacherForm.subject && !options.includes(teacherForm.subject)) {
      return [teacherForm.subject, ...options];
    }
    return options;
  }, [subjectOptions, teacherForm.subject]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchSearch =
        (teacher.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.phone || "").includes(searchTerm);

      const matchStatus = selectedStatus === "Tất cả trạng thái" || teacher.status === selectedStatus;
      const matchSubject = selectedSubject === "Tất cả môn" || teacher.subject === selectedSubject;

      return matchSearch && matchStatus && matchSubject;
    });
  }, [teachers, searchTerm, selectedStatus, selectedSubject]);

  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / ITEMS_PER_PAGE));

  const paginatedTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTeachers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTeachers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedSubject]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const handleCreateTeacherUser = async (formData) => {
    try {
      await teachersService.createTeacher(formData);
      setIsDialogOpen(false);
      setImportFeedback(null);
      await loadTeachers();
    } catch (error) {
      window.alert(getErrorMessage(error, "Không thể tạo tài khoản giáo viên."));
    }
  };

  const handleImportExcel = async (file) => {
    if (!file) return;

    try {
      setIsImportingExcel(true);
      setImportFeedback({ type: "info", message: `Đang nạp dữ liệu từ file ${file.name}...` });
      await teachersService.importTeachers(file);
      await loadTeachers();
      setImportFeedback({ type: "success", message: "Đã nạp dữ liệu giáo viên thành công." });
    } catch (error) {
      setImportFeedback({
        type: "error",
        message: getErrorMessage(error, "Không thể import giáo viên từ file Excel."),
      });
    } finally {
      setIsImportingExcel(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await teachersService.downloadTemplate();
      const blob = response instanceof Blob ? response : response?.data;
      if (!(blob instanceof Blob)) {
        window.alert("Không thể tải file mẫu import.");
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "mau-import-giao-vien.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      window.alert(getErrorMessage(error, "Không thể tải file mẫu import giáo viên."));
    }
  };

  const handleViewTeacher = (teacher) => {
    setActiveModalMode("view");
    setActiveTeacherId(teacher.id);
    setTeacherForm(toTeacherForm(teacher));
  };

  const handleEditTeacher = (teacher) => {
    setActiveModalMode("edit");
    setActiveTeacherId(teacher.id);
    setTeacherForm(toTeacherForm(teacher));
  };

  const handleShowTeacherDetail = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailModal(true);
  };

  const handleDeleteTeacher = async (id) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa giáo viên này không?");
    if (!confirmed) return;

    try {
      await teachersService.deleteTeacher(id);
      await loadTeachers();

      if (selectedTeacher?.id === id) {
        setSelectedTeacher(null);
        setShowDetailModal(false);
      }
    } catch (error) {
      window.alert(getErrorMessage(error, "Không thể xóa giáo viên."));
    }
  };

  const handleCloseModal = () => {
    setActiveModalMode(null);
    setActiveTeacherId(null);
    setTeacherForm(emptyTeacherForm);
  };

  const handleTeacherFormChange = (field, value) => {
    setTeacherForm((prev) => ({
      ...prev,
      [field]: field === "phone" ? String(value || "").replace(/\D/g, "").slice(0, 10) : value,
    }));
  };

  const handleSaveTeacherEdit = async () => {
    if (!activeTeacherId) return;
    if (!teacherForm.name.trim() || !teacherForm.dob || !teacherForm.subject.trim()) {
      window.alert("Vui lòng nhập đầy đủ họ tên, ngày sinh và môn dạy.");
      return;
    }

    if (teacherForm.phone && teacherForm.phone.length !== 10) {
      window.alert("Số điện thoại giáo viên phải đủ 10 chữ số.");
      return;
    }

    const payload = {
      ...teacherForm,
      profile: {
        ...(teacherForm.profile || {}),
        subject: teacherForm.subject.trim(),
        phone: teacherForm.phone || "",
        assignedClasses: teacherForm.assignedClasses || [],
        homeroomClass: teacherForm.homeroomClass || "",
      },
    };

    try {
      await teachersService.updateTeacher(activeTeacherId, payload);
      await loadTeachers();
      window.alert(`Đã cập nhật giáo viên ${teacherForm.name.trim()} thành công.`);
      handleCloseModal();
    } catch (error) {
      window.alert(getErrorMessage(error, "Không thể cập nhật giáo viên."));
    }
  };

  const patchSelectedTeacher = (updater) => {
    setTeachers((prev) =>
      prev.map((teacher) => {
        if (teacher.id !== selectedTeacher?.id) return teacher;
        const updated = updater(teacher);
        setSelectedTeacher(updated);
        return updated;
      })
    );
  };

  const handleAssignClass = async (className) => {
    const normalizedClass = String(className || "").trim().toUpperCase();
    if (!selectedTeacher || !normalizedClass) return;

    const updatedTeacher = {
      ...selectedTeacher,
      assignedClasses: Array.from(new Set([...(selectedTeacher.assignedClasses || []), normalizedClass])),
    };

    patchSelectedTeacher(() => updatedTeacher);

    try {
      await teachersService.updateTeacher(updatedTeacher.id, updatedTeacher);
    } catch {
      // Keep local view state; teacher detail assignment API can be finalized with BE contract later.
    }
  };

  const handleRemoveAssignedClass = async (className) => {
    if (!selectedTeacher) return;

    const updatedTeacher = {
      ...selectedTeacher,
      assignedClasses: (selectedTeacher.assignedClasses || []).filter((item) => item !== className),
    };

    patchSelectedTeacher(() => updatedTeacher);

    try {
      await teachersService.updateTeacher(updatedTeacher.id, updatedTeacher);
    } catch {
      // Keep local view state; teacher detail assignment API can be finalized with BE contract later.
    }
  };

  const handleUpdateHomeroomClass = async (className) => {
    if (!selectedTeacher) return;

    const updatedTeacher = {
      ...selectedTeacher,
      homeroomClass: className,
    };

    patchSelectedTeacher(() => updatedTeacher);

    try {
      await teachersService.updateTeacher(updatedTeacher.id, updatedTeacher);
    } catch {
      // Keep local view state; teacher detail assignment API can be finalized with BE contract later.
    }
  };

  return (
    <div className="admin-teachers-page">
      <TeacherActionsSection
        totalTeachers={teachers.length}
        searchTerm={searchTerm}
        selectedStatus={selectedStatus}
        selectedSubject={selectedSubject}
        statusOptions={statusOptions}
        subjectOptions={subjectOptions}
        onSearchChange={setSearchTerm}
        onStatusChange={setSelectedStatus}
        onSubjectChange={setSelectedSubject}
        onCreateTeacherAccount={() => setIsDialogOpen(true)}
      />

      {loadError && <div className="teacher-empty-row">{loadError}</div>}
      {isLoading && <div className="teacher-empty-row">Đang tải danh sách giáo viên...</div>}

      <TeacherListSection
        teachers={paginatedTeachers}
        onSelectTeacher={handleShowTeacherDetail}
        onView={handleViewTeacher}
        onEdit={handleEditTeacher}
        onDelete={handleDeleteTeacher}
      />

      <div className="admin-teachers-pagination-row">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          ariaLabel="Phân trang giáo viên"
        />
      </div>

      {activeModalMode && (
        <TeacherInformationSection
          mode={activeModalMode}
          formData={teacherForm}
          classOptions={classOptions}
          subjectOptions={editableSubjectOptions}
          onChange={handleTeacherFormChange}
          onRequestEdit={() => setActiveModalMode("edit")}
          onClose={handleCloseModal}
          onSubmit={handleSaveTeacherEdit}
        />
      )}

      {showDetailModal && selectedTeacher && (
        <TeacherDetailSection
          mode="view"
          teacher={selectedTeacher}
          classOptions={classOptions}
          onAssignClass={handleAssignClass}
          onRemoveAssignedClass={handleRemoveAssignedClass}
          onUpdateHomeroomClass={handleUpdateHomeroomClass}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTeacher(null);
          }}
        />
      )}

      {isDialogOpen && (
        <CreateUserDialog
          mode="create"
          title="Tạo tài khoản giáo viên"
          submitLabel="Tạo tài khoản"
          fixedRole="Giáo viên"
          onClose={() => {
            setIsDialogOpen(false);
            setImportFeedback(null);
          }}
          onSubmit={handleCreateTeacherUser}
          onImportExcel={handleImportExcel}
          onDownloadTemplate={handleDownloadTemplate}
          isImportingExcel={isImportingExcel}
          importFeedback={importFeedback}
        />
      )}
    </div>
  );
}

