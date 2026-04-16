import { useCallback, useEffect, useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import "./AllUsers.css";

import UsersSearchFilterSort from "./components/usersSearchFilterSort/UsersSearchFilterSort";
import UserDetailSection from "./components/userDetailSection/userDetailSection";
import { CreateUserDialog, Pagination } from "../../../../../components/common";
import BlockUnblockUsersSection from "./components/blockUnblockUserSection/blockUnblockUserSection";
import { userService } from "../../../../../services/pages/admin/users";

const ITEMS_PER_PAGE = 7;

const getErrorMessage = (error, fallback) => {
    const apiError = error?.response?.data?.error;
    const apiMessage = error?.response?.data?.message;
    return apiError || apiMessage || fallback;
};

const buildDownloadFilename = (headers = {}) => {
    const contentDisposition = headers?.["content-disposition"] || headers?.["Content-Disposition"];
    if (!contentDisposition) {
        return "mau-import-nguoi-dung.xlsx";
    }

    const matched = `${contentDisposition}`.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
    if (!matched?.[1]) {
        return "mau-import-nguoi-dung.xlsx";
    }

    try {
        return decodeURIComponent(matched[1]);
    } catch {
        return matched[1];
    }
};

export default function AllUsers({ onCountChange }) {
    const [users, setUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [loadError, setLoadError] = useState("");

    const [searchValue, setSearchValue] = useState("");
    const [quickRole, setQuickRole] = useState("Tất cả");

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isImportingExcel, setIsImportingExcel] = useState(false);
    const [importFeedback, setImportFeedback] = useState(null);

    const [statusTarget, setStatusTarget] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const loadUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        setLoadError("");

        try {
            const result = await userService.listUsers({ page: 1, limit: 500 });
            setUsers(result.items || []);
        } catch (error) {
            setLoadError(getErrorMessage(error, "Không thể tải danh sách người dùng."));
            setUsers([]);
        } finally {
            setIsLoadingUsers(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    useEffect(() => {
        onCountChange?.(users.length);
    }, [users.length, onCountChange]);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchSearch =
                user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                user.email.toLowerCase().includes(searchValue.toLowerCase());

            const matchQuickRole = quickRole === "Tất cả" ? true : user.role === quickRole;

            return matchSearch && matchQuickRole;
        });
    }, [users, searchValue, quickRole]);

    const hasFilteredUsers = filteredUsers.length > 0;
    const shouldRenderDataSection = !isLoadingUsers && !loadError;
    const emptyMessage = users.length === 0 ? "Chưa có dữ liệu người dùng." : "Không có người dùng phù hợp.";

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchValue, quickRole]);

    useEffect(() => {
        setCurrentPage((prev) => Math.min(prev, totalPages));
    }, [totalPages]);

    const handleCreateUser = async (formData) => {
        try {
            await userService.createUser(formData);
            setIsCreateOpen(false);
            setImportFeedback(null);
            await loadUsers();
            window.alert(`Đã tạo thành công người dùng ${formData.name} (${formData.role}).`);
        } catch (error) {
            window.alert(getErrorMessage(error, "Không thể tạo người dùng."));
        }
    };

    const handleSaveEdit = async (formData) => {
        if (!editingUser?.id) {
            return;
        }

        try {
            await userService.updateUser(editingUser.id, formData);
            setEditingUser(null);
            await loadUsers();
            window.alert(`Đã cập nhật người dùng ${formData.name} thành công.`);
        } catch (error) {
            window.alert(getErrorMessage(error, "Không thể cập nhật người dùng."));
        }
    };

    const handleToggleStatus = async () => {
        if (!statusTarget) return;

        const nextStatus = statusTarget.status === "Hoạt động" ? "Vô hiệu hóa" : "Hoạt động";

        try {
            await userService.updateUser(statusTarget.id, {
                ...statusTarget,
                status: nextStatus,
            });
            setStatusTarget(null);
            await loadUsers();
        } catch (error) {
            window.alert(getErrorMessage(error, "Không thể cập nhật trạng thái người dùng."));
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await userService.deleteUser(id);
            await loadUsers();
        } catch (error) {
            window.alert(getErrorMessage(error, "Không thể xóa người dùng."));
        }
    };

    const handleImportExcel = async (file) => {
        if (!file) return;

        try {
            setIsImportingExcel(true);
            setImportFeedback({
                type: "info",
                message: `Đang nạp dữ liệu từ file ${file.name}...`,
            });

            await userService.importUsers(file);
            await loadUsers();
            setImportFeedback({
                type: "success",
                message: "Đã nạp dữ liệu người dùng thành công.",
            });
        } catch (error) {
            setImportFeedback({
                type: "error",
                message: getErrorMessage(error, "Không thể nạp file Excel. Vui lòng kiểm tra endpoint import."),
            });
        } finally {
            setIsImportingExcel(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await userService.downloadImportTemplate();
            const blobData = response instanceof Blob ? response : response?.data;

            if (!(blobData instanceof Blob)) {
                window.alert("Không thể tải file mẫu import từ server.");
                return;
            }

            const fileName = buildDownloadFilename(response?.headers || {});
            const downloadUrl = URL.createObjectURL(blobData);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            window.alert(getErrorMessage(error, "Không thể tải file mẫu import từ server."));
        }
    };

    return (
        <div className="admin-users-page">
            <UsersSearchFilterSort
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                quickRole={quickRole}
                onQuickRoleChange={setQuickRole}
            >
                <button
                    className="accounts-overview-add-btn"
                    onClick={() => {
                        setImportFeedback(null);
                        setIsCreateOpen(true);
                    }}
                >
                    <FiPlus />
                    <span>Thêm người dùng</span>
                </button>
            </UsersSearchFilterSort>

            {loadError && <div className="user-detail-empty">{loadError}</div>}
            {isLoadingUsers && <div className="user-detail-empty">Đang tải danh sách người dùng...</div>}

            {shouldRenderDataSection && (
                <>
                    <UserDetailSection
                        users={paginatedUsers}
                        emptyMessage={emptyMessage}
                        onEdit={setEditingUser}
                        onToggleStatus={setStatusTarget}
                        onDelete={handleDeleteUser}
                    />

                    {hasFilteredUsers && totalPages > 1 && (
                        <div className="admin-users-pagination-row">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                ariaLabel="Phân trang người dùng"
                            />
                        </div>
                    )}
                </>
            )}

            {isCreateOpen && (
                <CreateUserDialog
                    mode="create"
                    title="Thêm người dùng mới"
                    submitLabel="Tạo người dùng"
                    roleOptions={["Admin", "Phụ huynh", "Học sinh", "Giáo viên"]}
                    onClose={() => {
                        setIsCreateOpen(false);
                        setImportFeedback(null);
                    }}
                    onSubmit={handleCreateUser}
                    onImportExcel={handleImportExcel}
                    onDownloadTemplate={handleDownloadTemplate}
                    isImportingExcel={isImportingExcel}
                    importFeedback={importFeedback}
                />
            )}

            {editingUser && (
                <CreateUserDialog
                    mode="edit"
                    title="Chỉnh sửa người dùng"
                    submitLabel="Lưu thay đổi"
                    roleOptions={["Admin", "Phụ huynh", "Học sinh", "Giáo viên"]}
                    initialData={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSubmit={handleSaveEdit}
                />
            )}

            {statusTarget && (
                <BlockUnblockUsersSection
                    user={statusTarget}
                    onClose={() => setStatusTarget(null)}
                    onConfirm={handleToggleStatus}
                />
            )}
        </div>
    );
}

