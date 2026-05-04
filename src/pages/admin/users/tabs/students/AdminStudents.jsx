import React, { useCallback, useEffect, useMemo, useState } from "react";

import "./AdminStudents.css";
import { PERMISSIONS } from "../../../../../config/permissions";
import { CreateUserDialog, Pagination, ConfirmationModal } from "../../../../../components/common";

import StudentActionsSection from "./components/studentActionsSection/studentActionsSection";
import StudentListSection from "./components/studentListSection/studentListSection";
import StudentInformationSection from "./components/studentInformationSection/studentInformationSection";
import { studentsService } from "../../../../../services/pages/admin/users";

const statusOptions = ["Tất cả trạng thái", "Đang học", "Đình chỉ", "Bảo lưu", "Đã tốt nghiệp"];
const ITEMS_PER_PAGE = 6;

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (!data) return fallback;

  if (typeof data.message === "string") return data.message;
  if (typeof data.error === "string") return data.error;
  if (data.error && typeof data.error === "object" && typeof data.error.message === "string") {
    return data.error.message;
  }
  if (typeof data === "object" && typeof data.message === "string") return data.message;

  return fallback;
};

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

export default function AdminStudents({ onCountChange, schoolYear, hasPermission, currentUser }) {
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

  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkToggling, setIsBulkToggling] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "",
    onConfirm: () => {},
    variant: "primary"
  });

  const closeConfirm = () => setConfirmConfig(prev => ({ ...prev, isOpen: false }));

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
    setSelectedUserIds([]); // Reset selection on filter change
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

    setConfirmConfig({
      isOpen: true,
      title: "Lưu thay đổi",
      message: `Bạn có chắc chắn muốn lưu những thay đổi cho học sinh ${studentForm.name}?`,
      confirmLabel: "Lưu thay đổi",
      variant: "primary",
      onConfirm: async () => {
        closeConfirm();
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
      }
    });
  };

  const handleBulkStatusChange = async (targetStatus) => {
    if (selectedUserIds.length === 0) return;
    
    const actionLabel = targetStatus === "Đang học" ? "KÍCH HOẠT" : "ĐÌNH CHỈ";
    
    setConfirmConfig({
      isOpen: true,
      title: `${actionLabel} tài khoản`,
      message: `Bạn có chắc chắn muốn ${actionLabel} ${selectedUserIds.length} học sinh đã chọn?`,
      confirmLabel: `Xác nhận ${actionLabel.toLowerCase()}`,
      variant: targetStatus === "Đang học" ? "primary" : "warning",
      onConfirm: async () => {
        closeConfirm();
        setIsBulkToggling(true);
        try {
          const promises = selectedUserIds.map(id => {
            const student = students.find(u => u.id === id);
            if (!student) return Promise.resolve();
            return studentsService.updateStudent(id, { ...student, status: targetStatus });
          });
          
          await Promise.all(promises);
          await loadStudents();
          window.alert(`Đã ${actionLabel.toLowerCase()} thành công ${selectedUserIds.length} học sinh.`);
        } catch (error) {
          window.alert(getErrorMessage(error, "Có lỗi xảy ra khi xử lý hàng loạt."));
        } finally {
          setIsBulkToggling(false);
        }
      }
    });
  };

  const handleBulkResetPassword = async () => {
    if (selectedUserIds.length === 0) return;
    
    setConfirmConfig({
      isOpen: true,
      title: "Đặt lại mật khẩu",
      message: `Bạn có chắc chắn muốn ĐẶT LẠI MẬT KHẨU cho ${selectedUserIds.length} học sinh đã chọn?`,
      confirmLabel: "Đặt lại mật khẩu",
      variant: "primary",
      onConfirm: async () => {
        closeConfirm();
        setIsBulkToggling(true);
        try {
          const results = [];
          for (const id of selectedUserIds) {
            const student = students.find(u => u.id === id);
            if (!student) continue;
            
            const generatedPwd = Math.random().toString(36).slice(-10);
            await studentsService.updateStudent(id, { ...student, password: generatedPwd });
            results.push({ name: student.name, password: generatedPwd });
          }
          
          await loadStudents();
          
          const resultMsg = results.map(r => `${r.name}: ${r.password}`).join("\n");
          window.alert(`Đặt lại mật khẩu thành công cho ${results.length} học sinh:\n\n${resultMsg}`);
        } catch (error) {
          window.alert(getErrorMessage(error, "Có lỗi xảy ra khi đặt lại mật khẩu hàng loạt."));
        } finally {
          setIsBulkToggling(false);
        }
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    
    setConfirmConfig({
      isOpen: true,
      title: "Xóa tài khoản",
      message: `CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN ${selectedUserIds.length} học sinh đã chọn? Hành động này không thể hoàn tác.`,
      confirmLabel: "Xóa tài khoản",
      variant: "danger",
      onConfirm: async () => {
        closeConfirm();
        setIsBulkDeleting(true);
        try {
          const promises = selectedUserIds.map(id => studentsService.deleteStudent(id));
          await Promise.all(promises);
          await loadStudents();
          window.alert(`Đã xóa thành công ${selectedUserIds.length} học sinh.`);
        } catch (error) {
          window.alert(getErrorMessage(error, "Có lỗi xảy ra khi xóa hàng loạt."));
        } finally {
          setIsBulkDeleting(false);
        }
      }
    });
  };

  const handleResetPassword = async (student) => {
    if (!student) return;
    
    setConfirmConfig({
      isOpen: true,
      title: "Đặt lại mật khẩu",
      message: `Bạn có chắc chắn muốn đặt lại mật khẩu cho học sinh ${student.name}?`,
      confirmLabel: "Đặt lại mật khẩu",
      variant: "primary",
      onConfirm: async () => {
        closeConfirm();
        try {
          const generatedPwd = Math.random().toString(36).slice(-10);
          await studentsService.updateStudent(student.id, { ...student, password: generatedPwd });
          window.alert(`Đặt lại mật khẩu thành công cho ${student.name}.\nMật khẩu mới là: ${generatedPwd}`);
        } catch (error) {
          window.alert(getErrorMessage(error, "Không thể đặt lại mật khẩu."));
        }
      }
    });
  };

  const handleToggleStatus = async () => {
    if (!statusTarget) return;
    
    const nextStatus = statusTarget.status === "Đang học" ? "Đình chỉ" : "Đang học";
    const actionLabel = nextStatus === "Đang học" ? "Kích hoạt" : "Vô hiệu hóa";

    try {
      await studentsService.updateStudent(statusTarget.id, { ...statusTarget, status: nextStatus });
      setStatusTarget(null);
      await loadStudents();
      window.alert(`${actionLabel} học sinh ${statusTarget.name} thành công.`);
    } catch (error) {
      window.alert(getErrorMessage(error, `Không thể ${actionLabel.toLowerCase()} học sinh.`));
    }
  };

  const handleSelectRow = (userId) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUserIds(paginatedStudents.map(u => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleDeleteStudent = async (student) => {
    setConfirmConfig({
      isOpen: true,
      title: "Xóa học sinh",
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn học sinh ${student.name}? Hành động này không thể hoàn tác.`,
      confirmLabel: "Xóa ngay",
      variant: "danger",
      onConfirm: async () => {
        closeConfirm();
        try {
          await studentsService.deleteStudent(student.id);
          await loadStudents();
          window.alert("Đã xóa học sinh thành công.");
        } catch (error) {
          window.alert(getErrorMessage(error, "Không thể xóa học sinh."));
        }
      }
    });
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
            onResetPassword={hasPermission(PERMISSIONS?.USER_UPDATE) ? handleResetPassword : null}
            onToggleStatus={setStatusTarget}
            selectedUserIds={selectedUserIds}
            onSelectRow={handleSelectRow}
            onSelectAll={handleSelectAll}
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

      {/* Bulk Action Bar */}
      {selectedUserIds.length > 0 && (
        <div className="admin-bulk-actions-bar">
          <div className="bulk-info">
            <span className="bulk-count">Đã chọn: <strong>{selectedUserIds.length}</strong></span>
            <button className="bulk-clear-btn" onClick={() => setSelectedUserIds([])}>Bỏ chọn</button>
          </div>
            <div className="bulk-btns">
            <button
              className="bulk-btn lock" 
              onClick={() => handleBulkStatusChange("Đình chỉ")}
              disabled={isBulkToggling}
            >
              Khóa tài khoản
            </button>
            <button 
              className="bulk-btn unlock" 
              onClick={() => handleBulkStatusChange("Đang học")}
              disabled={isBulkToggling}
            >
              Mở khóa
            </button>
            {hasPermission(PERMISSIONS?.USER_UPDATE) && (
              <button
                className="bulk-btn reset"
                onClick={handleBulkResetPassword}
                disabled={isBulkToggling}
              >
                Đặt lại mật khẩu
              </button>
            )}
            <button
                className="bulk-btn delete" 
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
            >
                {isBulkDeleting ? "Đang xóa..." : "Xóa tài khoản"}
            </button>
          </div>
        </div>
      )}

      {statusTarget && (
        <ConfirmationModal
          isOpen={true}
          title={statusTarget.status === "Đang học" ? "Vô hiệu hóa người dùng" : "Kích hoạt người dùng"}
          message={
            <>Bạn có chắc muốn {statusTarget.status === "Đang học" ? "vô hiệu hóa" : "kích hoạt lại"} học sinh <strong>{statusTarget.name}</strong> không?</>
          }
          confirmLabel={statusTarget.status === "Đang học" ? "Xác nhận vô hiệu hóa" : "Xác nhận kích hoạt"}
          variant={statusTarget.status === "Đang học" ? "warning" : "primary"}
          onConfirm={handleToggleStatus}
          onCancel={() => setStatusTarget(null)}
        />
      )}

      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        variant={confirmConfig.variant}
        onConfirm={confirmConfig.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}

