import React, { useState } from "react";
import { read, utils, writeFile } from "xlsx";
import "./AdminParents.css";
import { CreateUserDialog } from "../../../components/common";

function normalizeText(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d");
}

function getCellValue(row, keys) {
    const entries = Object.entries(row || {});
    for (const [rawKey, rawValue] of entries) {
        if (keys.includes(normalizeText(rawKey))) {
            return String(rawValue || "").trim();
        }
    }
    return "";
}

function toToken(value) {
    return normalizeText(value).replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "");
}

function toInitials(value) {
    return normalizeText(value)
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0))
        .join("")
        .replace(/[^a-z0-9]/g, "");
}

function buildParentEmail(firstName, lastName) {
    const localPart = [toToken(firstName), toInitials(lastName)].filter(Boolean).join(".") || "user";
    return `${localPart}@parent.email.edu.vn`;
}

export default function AdminParents() {
    const [parentUsers, setParentUsers] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isImportingExcel, setIsImportingExcel] = useState(false);
    const [importFeedback, setImportFeedback] = useState(null);

    const handleCreateParentUser = (formData) => {
        const createdUser = {
            id: Date.now(),
            ...formData,
            createdAt: new Date().toISOString().slice(0, 10),
        };

        setParentUsers((prev) => [createdUser, ...prev]);
        setIsDialogOpen(false);
    };

    const handleImportExcel = async (file) => {
        if (!file) return;

        try {
            setIsImportingExcel(true);
            setImportFeedback({
                type: "info",
                message: `Dang nap du lieu tu file ${file.name}...`,
            });

            const buffer = await file.arrayBuffer();
            const workbook = read(buffer, { type: "array" });
            const firstSheetName = workbook.SheetNames?.[0];

            if (!firstSheetName) {
                setImportFeedback({
                    type: "error",
                    message: "File Excel khong co du lieu.",
                });
                return;
            }

            const rows = utils.sheet_to_json(workbook.Sheets[firstSheetName], {
                defval: "",
                raw: false,
            });

            const importedUsers = rows
                .map((row, index) => {
                    const lastName = getCellValue(row, ["ho va ten lot", "ho", "last name"]);
                    const firstName = getCellValue(row, ["ten", "first name"]);
                    const dob = getCellValue(row, ["ngay sinh", "ngay thang nam sinh", "dob"]);
                    const child1Name = getCellValue(row, [
                        "ten con dang hoc",
                        "ten con",
                        "child name",
                        "ten con 1",
                        "child 1 name",
                    ]);
                    const child1Class = getCellValue(row, ["lop", "class", "lop 1", "child 1 class"]);
                    const child2Name = getCellValue(row, ["ten con 2", "child 2 name"]);
                    const child2Class = getCellValue(row, ["lop 2", "child 2 class"]);
                    const phone = getCellValue(row, ["so dien thoai", "sdt", "phone"])
                        .replace(/\D/g, "")
                        .slice(0, 10);

                    const children = [
                        {
                            childName: child1Name,
                            childClass: child1Class,
                        },
                        {
                            childName: child2Name,
                            childClass: child2Class,
                        },
                    ].filter((child) => child.childName && child.childClass);

                    if (!lastName || !firstName || !dob || children.length === 0 || phone.length !== 10) {
                        return null;
                    }

                    return {
                        id: Date.now() + index,
                        name: `${lastName} ${firstName}`.trim(),
                        lastName,
                        firstName,
                        dob,
                        email: buildParentEmail(firstName, lastName),
                        role: "Phụ huynh",
                        phone,
                        profile: {
                            lastName,
                            firstName,
                            dob,
                            childName: children[0].childName,
                            childClass: children[0].childClass,
                            children,
                            phone,
                        },
                        createdAt: new Date().toISOString().slice(0, 10),
                    };
                })
                .filter(Boolean);

            if (importedUsers.length === 0) {
                setImportFeedback({
                    type: "warning",
                    message: "Khong co du lieu hop le de them.",
                });
                return;
            }

            setParentUsers((prev) => [...importedUsers, ...prev]);
            setImportFeedback({
                type: "success",
                message: `Da nap ${importedUsers.length} tai khoan phu huynh.`,
            });
        } catch (error) {
            console.error(error);
            setImportFeedback({
                type: "error",
                message: "Khong the doc file Excel.",
            });
        } finally {
            setIsImportingExcel(false);
        }
    };

    const handleDownloadTemplate = () => {
        const templateRows = [
            {
                "Ho va ten lot": "Nguyen Hoang Quoc",
                Ten: "Kiet",
                "Ngay sinh": "2008-10-21",
                "Ten con 1": "Nguyen Van C",
                "Lop 1": "10A1",
                "Ten con 2": "Nguyen Van D",
                "Lop 2": "8A2",
                "So dien thoai": "0901234567",
            },
        ];

        const worksheet = utils.json_to_sheet(templateRows);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "MauPhuHuynh");
        writeFile(workbook, "mau-import-phu-huynh.xlsx");
    };

    return (
        <div className="admin-parents">
            <div className="admin-parents-header">
                <div>
                    <h1>Phụ Huynh</h1>
                    <p>Tạo tài khoản phụ huynh với vai trò cố định.</p>
                </div>

                <button type="button" onClick={() => setIsDialogOpen(true)}>
                    Tạo tài khoản phụ huynh
                </button>
            </div>

            <div className="admin-parents-list">
                <h2>Tài khoản mới tạo: {parentUsers.length}</h2>
                {parentUsers.length === 0 ? (
                    <p>Chưa có tài khoản phụ huynh nào.</p>
                ) : (
                    <ul>
                        {parentUsers.map((user) => (
                            <li key={user.id}>
                                <span>{user.name}</span>
                                <span>{user.email}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

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
