import React, { useCallback, useEffect, useMemo, useState } from "react";

import "./ManagementParents.css";
import { PERMISSIONS } from "../../../../../config/permissions";
import { CreateUserDialog, Pagination, ConfirmationModal } from "../../../../../components/common";
import ParentActionsSection from "./components/parentActionsSection/parentActionsSection";
import ParentListSection from "./components/parentListSection/parentListSection";
import ParentInformationSection from "./components/parentInformationSection/parentInformationSection";
import { parentsService, userService } from "../../../../../services/pages/management/users";

const ITEMS_PER_PAGE = 7;
const statusOptions = ["Tất cả trạng thái", "Hoạt động", "Vô hiệu hóa"];
const classOptions = ["Tất cả khối", "Khối 10", "Khối 11", "Khối 12"];

const emptyParentForm = {
  id: "",
  name: "",
  dob: "",
  email: "",
  phone: "",
  status: "Hoạt động",
  profile: { children: [] },
};

const getErrorMessage = (error, fallback) => {
  const apiError = error?.response?.data?.error;
  const apiMessage = error?.response?.data?.message;
  return apiMessage || apiError || fallback;
};

const normalizeChildren = (children = []) =>
  (Array.isArray(children) ? children : [])
    .map((item) => ({
      childName: String(item?.childName || "").trim(),
      childClass: String(item?.childClass || "").trim(),
    }))
    .filter((item) => item.childName && item.childClass);

export default function ManagementParents({ onCountChange, schoolYear, term, hasPermission, currentUser }) {
  const [parents, setParents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả trạng thái");
  const [selectedClass, setSelectedClass] = useState("Tất cả khối");

  const [activeModalMode, setActiveModalMode] = useState(null);
  const [activeParentId, setActiveParentId] = useState(null);
  const [parentForm, setParentForm] = useState(emptyParentForm);
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
    variant: "primary",
    showNewPassword: false
  });

  const [authPasswordInput, setAuthPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");

  const closeConfirm = () => {
    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
    setAuthPasswordInput("");
    setNewPasswordInput("");
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportingExcel, setIsImportingExcel] = useState(false);
  const [importFeedback, setImportFeedback] = useState(null);

  const loadParents = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const rows = await parentsService.listParents();
      setParents(rows);
    } catch (error) {
      setParents([]);
      setLoadError(getErrorMessage(error, "Không thể tải danh sách phụ huynh."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadParents();
  }, [loadParents]);

  const filteredParents = useMemo(() => {
    return parents.filter((parent) => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch =
        (parent.name || "").toLowerCase().includes(searchStr) ||
        (parent.email || "").toLowerCase().includes(searchStr) ||
        (parent.phone || "").includes(searchTerm);

      const matchesStatus = selectedStatus === "Tất cả trạng thái" || parent.status === selectedStatus;

      // Logic lọc theo Năm học/Học kỳ: Hiện tại giả định nếu có năm học, 
      // ta ưu tiên những phụ huynh có thông tin con em liên quan.
      // (Cần bổ sung field academicYear vào con em nếu BE hỗ trợ)
      const matchesYearTerm = true; 

      let matchesClass = true;
      if (selectedClass !== "Tất cả khối") {
        const gradePrefix = selectedClass.replace("Khối ", "");
        const children = parent.profile?.children || [];
        matchesClass = children.some((child) => String(child.childClass || "").startsWith(gradePrefix));
      }

      return matchesSearch && matchesStatus && matchesClass && matchesYearTerm;
    });
  }, [parents, searchTerm, selectedStatus, selectedClass, schoolYear, term]);

  useEffect(() => {
    onCountChange?.(filteredParents.length);
  }, [filteredParents.length, onCountChange]);

  const hasFilteredParents = filteredParents.length > 0;
  const shouldRenderDataSection = !isLoading && !loadError;
  const emptyMessage = parents.length === 0 ? "Chưa có dữ liệu phụ huynh." : "Không tìm thấy tài khoản phụ huynh nào.";

  const totalPages = Math.max(1, Math.ceil(filteredParents.length / ITEMS_PER_PAGE));

  const paginatedParents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredParents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredParents, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedUserIds([]);
  }, [searchTerm, selectedStatus, selectedClass]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const handleCreateParentUser = async (formData) => {
    try {
      await parentsService.createParent(formData);
      setIsDialogOpen(false);
      setImportFeedback(null);
      await loadParents();
    } catch (error) {
      window.alert(getErrorMessage(error, "Không thể tạo tài khoản phụ huynh."));
    }
  };

  const handleImportExcel = async (file) => {
    if (!file) return;

    try {
      setIsImportingExcel(true);
      setImportFeedback({ type: "info", message: `Đang nạp dữ liệu từ file ${file.name}...` });
      await parentsService.importParents(file);
      await loadParents();
      setImportFeedback({ type: "success", message: "Đã nạp dữ liệu phụ huynh thành công." });
    } catch (error) {
      setImportFeedback({
        type: "error",
        message: getErrorMessage(error, "Không thể import phụ huynh từ file Excel."),
      });
    } finally {
      setIsImportingExcel(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await parentsService.downloadTemplate();
      const blob = response instanceof Blob ? response : response?.data;
      if (!(blob instanceof Blob)) {
        window.alert("Không thể tải file mẫu import.");
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "mau-import-phu-huynh.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      window.alert(getErrorMessage(error, "Không thể tải file mẫu import phụ huynh."));
    }
  };

  const handleViewParent = (parent) => {
    setActiveModalMode("view");
    setActiveParentId(parent.id);
    // profile.children is now populated from students_linked via parseParent
    setParentForm({
      ...parent,
      profile: {
        ...(parent.profile || {}),
        children: parent.profile?.children || [],
      },
    });
  };

  const handleEditParent = (parent) => {
    setActiveModalMode("edit");
    setActiveParentId(parent.id);
    setParentForm({
      ...parent,
      profile: {
        ...(parent.profile || {}),
        children: parent.profile?.children || [],
      },
    });
  };

  const handleBulkStatusChange = async (targetStatus) => {
    if (selectedUserIds.length === 0) return;
    
    const actionLabel = targetStatus === "Hoạt động" ? "KÍCH HOẠT" : "KHÓA";
    
    setConfirmConfig({
      isOpen: true,
      title: `${actionLabel} tài khoản`,
      message: `Bạn có chắc chắn muốn ${actionLabel} ${selectedUserIds.length} phụ huynh đã chọn?`,
      confirmLabel: `Xác nhận ${actionLabel.toLowerCase()}`,
      variant: targetStatus === "Hoạt động" ? "primary" : "warning",
      onConfirm: async () => {
        closeConfirm();
        setIsBulkToggling(true);
        try {
          const promises = selectedUserIds.map(id => {
            const parent = parents.find(u => u.id === id);
            if (!parent) return Promise.resolve();
            return parentsService.updateParent(id, { ...parent, status: targetStatus });
          });
          
          await Promise.all(promises);
          await loadParents();
          window.alert(`Đã ${actionLabel.toLowerCase()} thành công ${selectedUserIds.length} phụ huynh.`);
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
    
    setAuthPasswordInput("");
    setConfirmConfig({
      isOpen: true,
      title: "Xác minh quyền Quản lý",
      message: `Để đặt lại mật khẩu cho ${selectedUserIds.length} phụ huynh, vui lòng nhập mật khẩu Quản lý của bạn:`,
      confirmLabel: "Đặt lại mật khẩu",
      variant: "primary",
      onConfirm: async () => {
        setIsBulkToggling(true);
        try {
          const results = [];
          for (const id of selectedUserIds) {
            const parent = parents.find(u => u.id === id);
            if (!parent) continue;
            
            const generatedPwd = Math.random().toString(36).slice(-10);
            await userService.resetPassword(id, { 
              authPassword: authPasswordInput, 
              newPassword: generatedPwd 
            });
            results.push({ name: parent.name, password: generatedPwd });
          }
          
          closeConfirm();
          await loadParents();
          
          const resultMsg = results.map(r => `${r.name}: ${r.password}`).join("\n");
          window.alert(`Đặt lại mật khẩu thành công cho ${results.length} phụ huynh:\n\n${resultMsg}`);
        } catch (error) {
          window.alert(getErrorMessage(error, "Có lỗi xảy ra khi đặt lại mật khẩu hàng loạt. Kiểm tra lại mật khẩu Quản lý."));
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
      message: `CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN ${selectedUserIds.length} phụ huynh đã chọn? Hành động này không thể hoàn tác.`,
      confirmLabel: "Xóa tài khoản",
      variant: "danger",
      onConfirm: async () => {
        closeConfirm();
        setIsBulkDeleting(true);
        try {
          const promises = selectedUserIds.map(id => parentsService.deleteParent(id));
          await Promise.all(promises);
          await loadParents();
          window.alert(`Đã xóa thành công ${selectedUserIds.length} phụ huynh.`);
        } catch (error) {
          window.alert(getErrorMessage(error, "Có lỗi xảy ra khi xóa hàng loạt."));
        } finally {
          setIsBulkDeleting(false);
        }
      }
    });
  };

  const handleResetPassword = async (parent) => {
    if (!parent) return;
    
    const isSelf = parent.id === currentUser?.id || parent.email === currentUser?.email;
    setAuthPasswordInput("");
    setNewPasswordInput("");

    setConfirmConfig({
      isOpen: true,
      title: "Xác minh quyền Quản lý",
      message: isSelf 
        ? `Thiết lập mật khẩu mới cho chính bạn (${parent.name}):`
        : `Xác nhận đặt lại mật khẩu cho ${parent.name}. Hệ thống sẽ tự sinh mật khẩu mới.`,
      confirmLabel: "Đặt lại mật khẩu",
      variant: "primary",
      showNewPassword: isSelf,
      onConfirm: async () => {
        try {
          let targetNewPassword = "";
          if (isSelf) {
            if (!newPasswordInput.trim()) {
              window.alert("Vui lòng nhập mật khẩu mới.");
              return;
            }
            targetNewPassword = newPasswordInput;
          } else {
            targetNewPassword = Math.random().toString(36).slice(-10);
          }

          await userService.resetPassword(parent.id, { 
            authPassword: authPasswordInput, 
            newPassword: targetNewPassword 
          });
          
          closeConfirm();
          if (isSelf) {
            window.alert("Đã đổi mật khẩu của bạn thành công.");
          } else {
            window.alert(`Đặt lại mật khẩu thành công cho ${parent.name}.\nMật khẩu mới là: ${targetNewPassword}`);
          }
        } catch (error) {
          window.alert(getErrorMessage(error, "Xác thực Quản lý thất bại hoặc lỗi hệ thống."));
        }
      }
    });
  };

  const handleToggleStatus = async () => {
    if (!statusTarget) return;
    
    const nextStatus = statusTarget.status === "Hoạt động" ? "Vô hiệu hóa" : "Hoạt động";
    const actionLabel = nextStatus === "Hoạt động" ? "Kích hoạt" : "Vô hiệu hóa";

    try {
      await parentsService.updateParent(statusTarget.id, { ...statusTarget, status: nextStatus });
      setStatusTarget(null);
      await loadParents();
      window.alert(`${actionLabel} phụ huynh ${statusTarget.name} thành công.`);
    } catch (error) {
      window.alert(getErrorMessage(error, `Không thể ${actionLabel.toLowerCase()} phụ huynh.`));
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
      setSelectedUserIds(paginatedParents.map(u => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleDeleteParent = async (parent) => {
    setConfirmConfig({
      isOpen: true,
      title: "Xóa phụ huynh",
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn phụ huynh ${parent.name}? Hành động này không thể hoàn tác.`,
      confirmLabel: "Xóa ngay",
      variant: "danger",
      onConfirm: async () => {
        closeConfirm();
        try {
          await parentsService.deleteParent(parent.id);
          await loadParents();
          window.alert("Đã xóa phụ huynh thành công.");
        } catch (error) {
          window.alert(getErrorMessage(error, "Không thể xóa phụ huynh."));
        }
      }
    });
  };

  const handleCloseModal = () => {
    setActiveModalMode(null);
    setActiveParentId(null);
    setParentForm(emptyParentForm);
  };

  const handleParentFormChange = (field, value) => {
    if (field === "children") {
      setParentForm((prev) => ({
        ...prev,
        profile: {
          ...(prev.profile || {}),
          children: normalizeChildren(value),
        },
      }));
      return;
    }

    setParentForm((prev) => ({
      ...prev,
      [field]: field === "phone" ? String(value || "").replace(/\D/g, "").slice(0, 10) : value,
    }));
  };

  const handleSaveParentEdit = async () => {
    if (!activeParentId) return;

    if (!parentForm.name.trim() || !parentForm.dob) {
      window.alert("Vui lòng nhập đầy đủ họ tên và ngày sinh.");
      return;
    }

    if (parentForm.phone && parentForm.phone.length !== 10) {
      window.alert("Số điện thoại phải đủ 10 chữ số.");
      return;
    }

    setConfirmConfig({
      isOpen: true,
      title: "Lưu thay đổi",
      message: `Bạn có chắc chắn muốn lưu những thay đổi cho phụ huynh ${parentForm.name}?`,
      confirmLabel: "Lưu thay đổi",
      variant: "primary",
      onConfirm: async () => {
        closeConfirm();
        const payload = {
          ...parentForm,
          profile: {
            ...(parentForm.profile || {}),
            children: normalizeChildren(parentForm.profile?.children),
            phone: parentForm.phone || "",
          },
        };

        try {
          await parentsService.updateParent(activeParentId, payload);
          await loadParents();
          window.alert(`Đã cập nhật phụ huynh ${parentForm.name.trim()} thành công.`);
          handleCloseModal();
        } catch (error) {
          window.alert(getErrorMessage(error, "Không thể cập nhật phụ huynh."));
        }
      }
    });
  };

  return (
    <div className="management-parents-page">
      <ParentActionsSection
        totalParents={parents.length}
        searchTerm={searchTerm}
        selectedStatus={selectedStatus}
        selectedClass={selectedClass}
        statusOptions={statusOptions}
        classOptions={classOptions}
        onSearchChange={setSearchTerm}
        onStatusChange={setSelectedStatus}
        onClassChange={setSelectedClass}
        onCreateParentAccount={() => setIsDialogOpen(true)}
      />

      {loadError && <div className="parent-empty-row">{loadError}</div>}
      {isLoading && <div className="parent-empty-row">Đang tải danh sách phụ huynh...</div>}

      {shouldRenderDataSection && (
        <>
          <ParentListSection
            parents={paginatedParents}
            emptyMessage={emptyMessage}
            onView={handleViewParent}
            onEdit={handleEditParent}
            onDelete={handleDeleteParent}
            onResetPassword={hasPermission(PERMISSIONS.USER_UPDATE) ? handleResetPassword : null}
            onToggleStatus={setStatusTarget}
            selectedUserIds={selectedUserIds}
            onSelectRow={handleSelectRow}
            onSelectAll={handleSelectAll}
          />

          {hasFilteredParents && totalPages > 1 && (
            <div className="management-parents-pagination-row">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                ariaLabel="Phân trang phụ huynh"
              />
            </div>
          )}
        </>
      )}

      {activeModalMode && (
        <ParentInformationSection
          mode={activeModalMode}
          formData={parentForm}
          onChange={handleParentFormChange}
          onRequestEdit={() => setActiveModalMode("edit")}
          onClose={handleCloseModal}
          onSubmit={handleSaveParentEdit}
        />
      )}

      {isDialogOpen && (
        <CreateUserDialog
          mode="create"
          title="Tạo tài khoản phụ huynh"
          submitLabel="Tạo tài khoản"
          fixedRole="Phụ huynh"
          onClose={() => {
            setIsDialogOpen(false);
            setImportFeedback(null);
          }}
          onSubmit={handleCreateParentUser}
          onImportExcel={handleImportExcel}
          onDownloadTemplate={handleDownloadTemplate}
          isImportingExcel={isImportingExcel}
          importFeedback={importFeedback}
        />
      )}

      {/* Bulk Action Bar */}
      {selectedUserIds.length > 0 && (
        <div className="management-bulk-actions-bar">
          <div className="bulk-info">
            <span className="bulk-count">Đã chọn: <strong>{selectedUserIds.length}</strong></span>
            <button className="bulk-clear-btn" onClick={() => setSelectedUserIds([])}>Bỏ chọn</button>
          </div>
          <div className="bulk-btns">
            <button 
              className="bulk-btn lock" 
              onClick={() => handleBulkStatusChange("Vô hiệu hóa")}
              disabled={isBulkToggling}
            >
              Khóa tài khoản
            </button>
            <button 
              className="bulk-btn unlock" 
              onClick={() => handleBulkStatusChange("Hoạt động")}
              disabled={isBulkToggling}
            >
              Mở khóa
            </button>
            {hasPermission(PERMISSIONS.USER_UPDATE) && (
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
          title={statusTarget.status === "Hoạt động" ? "Vô hiệu hóa người dùng" : "Kích hoạt người dùng"}
          message={
            <>Bạn có chắc muốn {statusTarget.status === "Hoạt động" ? "vô hiệu hóa" : "kích hoạt lại"} phụ huynh <strong>{statusTarget.name}</strong> không?</>
          }
          confirmLabel={statusTarget.status === "Hoạt động" ? "Xác nhận vô hiệu hóa" : "Xác nhận kích hoạt"}
          variant={statusTarget.status === "Hoạt động" ? "warning" : "primary"}
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
      >
        {confirmConfig.title === "Xác minh quyền Quản lý" && (
          <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", color: "#666", marginBottom: "4px", display: "block" }}>Mật khẩu Quản lý của bạn:</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu Quản lý để xác thực"
                value={authPasswordInput}
                onChange={(e) => setAuthPasswordInput(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "1rem"
                }}
              />
            </div>
            {confirmConfig.showNewPassword && (
              <div>
                <label style={{ fontSize: "0.85rem", color: "#666", marginBottom: "4px", display: "block" }}>Mật khẩu MỚI cho bạn:</label>
                <input
                  type="text"
                  placeholder="Nhập mật khẩu mới tại đây"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    fontSize: "1rem"
                  }}
                />
              </div>
            )}
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
}


