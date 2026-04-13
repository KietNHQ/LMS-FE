import React, { useCallback, useEffect, useMemo, useState } from "react";

import "./AdminParents.css";
import { CreateUserDialog, Pagination } from "../../../../../components/common";
import ParentActionsSection from "./components/parentActionsSection/parentActionsSection";
import ParentListSection from "./components/parentListSection/parentListSection";
import ParentInformationSection from "./components/parentInformationSection/parentInformationSection";
import { parentsService } from "../../../../../services/pages/admin/users";

const ITEMS_PER_PAGE = 7;
const statusOptions = ["Tất cả trạng thái", "Hoạt động", "Khóa"];
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
  return apiError || apiMessage || fallback;
};

const normalizeChildren = (children = []) =>
  (Array.isArray(children) ? children : [])
    .map((item) => ({
      childName: String(item?.childName || "").trim(),
      childClass: String(item?.childClass || "").trim(),
    }))
    .filter((item) => item.childName && item.childClass);

export default function AdminParents({ onCountChange }) {
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

  useEffect(() => {
    onCountChange?.(parents.length);
  }, [parents.length, onCountChange]);

  const filteredParents = useMemo(() => {
    return parents.filter((parent) => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch =
        (parent.name || "").toLowerCase().includes(searchStr) ||
        (parent.email || "").toLowerCase().includes(searchStr) ||
        (parent.phone || "").includes(searchTerm);

      const matchesStatus = selectedStatus === "Tất cả trạng thái" || parent.status === selectedStatus;

      let matchesClass = true;
      if (selectedClass !== "Tất cả khối") {
        const gradePrefix = selectedClass.replace("Khối ", "");
        const children = parent.profile?.children || [];
        matchesClass = children.some((child) => String(child.childClass || "").startsWith(gradePrefix));
      }

      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [parents, searchTerm, selectedStatus, selectedClass]);

  const totalPages = Math.max(1, Math.ceil(filteredParents.length / ITEMS_PER_PAGE));

  const paginatedParents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredParents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredParents, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
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
    setParentForm({
      ...parent,
      profile: {
        ...(parent.profile || {}),
        children: normalizeChildren(parent.profile?.children),
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
        children: normalizeChildren(parent.profile?.children),
      },
    });
  };

  const handleDeleteParent = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phụ huynh này không?")) return;

    try {
      await parentsService.deleteParent(id);
      await loadParents();
    } catch (error) {
      window.alert(getErrorMessage(error, "Không thể xóa phụ huynh."));
    }
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
  };

  return (
    <div className="admin-parents-page">
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

      <ParentListSection
        parents={paginatedParents}
        onView={handleViewParent}
        onEdit={handleEditParent}
        onDelete={handleDeleteParent}
      />

      <div className="admin-parents-pagination-row">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          ariaLabel="Phân trang phụ huynh"
        />
      </div>

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
    </div>
  );
}

