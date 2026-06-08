import React, { useState, useEffect, useCallback } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiHome, FiLayers, FiInfo } from "react-icons/fi";
import { LuBuilding2 } from "react-icons/lu";
import { toast } from "react-toastify";
import { Modal, Button, Input } from "../../../components/ui";
import { Pagination } from "../../../components/common";
import { buildingsService } from "../../../services/pages/management/buildings/buildingsService";
import { useCheckPermission } from "../../../hooks/useAuth";
import { PERMISSIONS } from "../../../config/permissions";
import "./ManagementBuildings.css";

const ITEMS_PER_PAGE = 8;

const getErrorMessage = (error, fallback) => {
    const data = error?.response?.data;
    if (!data) return fallback;
    if (typeof data.error === "string") return data.error;
    if (typeof data.message === "string") return data.message;
    if (data.error?.message) return data.error.message;
    return fallback;
};

export default function ManagementBuildings() {
    const [buildings, setBuildings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [buildingToDelete, setBuildingToDelete] = useState(null);

    const [form, setForm] = useState({ name: "", floors: 1, description: "" });
    const [formErrors, setFormErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const canCreate = useCheckPermission(PERMISSIONS.BUILDING_CREATE);
    const canUpdate = useCheckPermission(PERMISSIONS.BUILDING_UPDATE);
    const canDelete = useCheckPermission(PERMISSIONS.BUILDING_DELETE);

    const loadBuildings = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await buildingsService.listBuildings();
            setBuildings(data);
        } catch (error) {
            toast.error(getErrorMessage(error, "Không thể tải danh sách tòa nhà"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBuildings();
    }, [loadBuildings]);

    const totalPages = Math.ceil(buildings.length / ITEMS_PER_PAGE);
    const paginatedBuildings = buildings.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const validateForm = () => {
        const errors = {};
        if (!form.name.trim()) {
            errors.name = "Vui lòng nhập tên tòa nhà";
        }
        if (!form.floors || form.floors < 1) {
            errors.floors = "Số tầng phải lớn hơn 0";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenCreate = () => {
        setSelectedBuilding(null);
        setForm({ name: "", floors: 1, description: "" });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleOpenEdit = (building) => {
        setSelectedBuilding(building);
        setForm({
            name: building.name,
            floors: building.floors || 1,
            description: building.description || "",
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setIsSaving(true);
        try {
            if (selectedBuilding) {
                await buildingsService.updateBuilding(selectedBuilding.id, form);
                toast.success("Cập nhật tòa nhà thành công");
            } else {
                await buildingsService.createBuilding(form);
                toast.success("Tạo tòa nhà mới thành công");
            }
            setIsModalOpen(false);
            loadBuildings();
        } catch (error) {
            toast.error(getErrorMessage(error, "Lưu tòa nhà thất bại"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenDelete = (building, e) => {
        e?.stopPropagation();
        setBuildingToDelete(building);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!buildingToDelete) return;
        try {
            await buildingsService.deleteBuilding(buildingToDelete.id);
            toast.success("Xóa tòa nhà thành công");
            setIsDeleteModalOpen(false);
            setBuildingToDelete(null);
            loadBuildings();
        } catch (error) {
            toast.error(getErrorMessage(error, "Xóa tòa nhà thất bại"));
        }
    };

    const stats = [
        {
            label: "Tổng số tòa nhà",
            value: buildings.length,
            icon: <LuBuilding2 />,
            color: "#3b82f6",
        },
        {
            label: "Tổng số tầng",
            value: buildings.reduce((sum, b) => sum + (b.floors || 1), 0),
            icon: <FiLayers />,
            color: "#34d399",
        },
    ];

    return (
        <div className="management-buildings">
            <div className="buildings-header">
                <div className="header-title">
                    <LuBuilding2 className="header-icon" />
                    <h1>Quản lý Tòa nhà</h1>
                </div>
                {canCreate && (
                    <Button primary onClick={handleOpenCreate}>
                        <FiPlus /> Thêm tòa nhà
                    </Button>
                )}
            </div>

            <div className="buildings-stats">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: stat.color + "20", color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-details">
                            <span className="stat-label">{stat.label}</span>
                            <span className="stat-value">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {isLoading ? (
                <div className="buildings-loading">
                    <div className="spinner" />
                    <span>Đang tải dữ liệu...</span>
                </div>
            ) : buildings.length === 0 ? (
                <div className="buildings-empty">
                    <LuBuilding2 className="empty-icon" />
                    <h3>Chưa có tòa nhà nào</h3>
                    <p>Vui lòng thêm tòa nhà để bắt đầu quản lý</p>
                    {canCreate && (
                        <Button primary onClick={handleOpenCreate}>
                            <FiPlus /> Thêm tòa nhà đầu tiên
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    <div className="buildings-grid">
                        {paginatedBuildings.map((building) => (
                            <div key={building.id} className="building-card">
                                <div className="building-card-header">
                                    <div className="building-icon-wrapper">
                                        <FiHome />
                                    </div>
                                    <div className="building-info">
                                        <h3 className="building-name">{building.name}</h3>
                                        <div className="building-meta">
                                            <span className="meta-item">
                                                <FiLayers /> {building.floors || 1} tầng
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {building.description && (
                                    <p className="building-description">
                                        <FiInfo /> {building.description}
                                    </p>
                                )}
                                <div className="building-card-actions">
                                    {canUpdate && (
                                        <button
                                            className="btn-action btn-edit"
                                            onClick={() => handleOpenEdit(building)}
                                            title="Sửa tòa nhà"
                                        >
                                            <FiEdit2 />
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button
                                            className="btn-action btn-delete"
                                            onClick={(e) => handleOpenDelete(building, e)}
                                            title="Xóa tòa nhà"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="buildings-pagination">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Create / Edit Modal */}
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedBuilding ? "Sửa tòa nhà" : "Thêm tòa nhà mới"}
            >
                <div className="building-form">
                    <div className="form-group">
                        <Input
                            label="Tên tòa nhà"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="VD: Tòa A - Khu giảng đường"
                            error={formErrors.name}
                        />
                    </div>
                    <div className="form-group">
                        <Input
                            label="Số tầng"
                            type="number"
                            min={1}
                            value={form.floors}
                            onChange={(e) => setForm({ ...form, floors: parseInt(e.target.value) || 1 })}
                            error={formErrors.floors}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Mô tả (tùy chọn)</label>
                        <textarea
                            className="form-textarea"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="VD: Tòa nhà chính dành cho các lớp khối 10-12"
                            rows={3}
                        />
                    </div>
                    <div className="modal-footer">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button primary onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Đang lưu..." : selectedBuilding ? "Lưu thay đổi" : "Tạo tòa nhà"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Xác nhận xóa tòa nhà"
            >
                <div className="delete-confirm-content">
                    <p>
                        Bạn có chắc chắn muốn xóa tòa nhà{" "}
                        <strong>{buildingToDelete?.name}</strong> không?
                    </p>
                    <p className="warning-text">Hành động này không thể hoàn tác.</p>
                    <div className="modal-footer">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button
                            danger
                            onClick={handleDelete}
                        >
                            Xóa tòa nhà
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
