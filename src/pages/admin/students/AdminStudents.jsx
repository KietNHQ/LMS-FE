import React, { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { read, utils, writeFile } from "xlsx";
import "./AdminStudents.css";
import { CreateUserDialog, SchoolYearTermSelector, PageHeader } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";

import StudentActionsSection from "./components/studentActionsSection/studentActionsSection";
import StudentListSection from "./components/studentListSection/studentListSection";
import StudentInformationSection from "./components/studentInformationSection/studentInformationSection";

const initialStudents = [
    {
        id: 1,
        name: "Nguyễn Minh Tuấn",
        email: "tuan.nm@gmail.com",
        gender: "Nam",
        dob: "2008-03-15",
        className: "10A1",
        academicYear: "2025-2026",
        teacher: "Trần Thị Hương",
        parentName: "Nguyễn Văn Phụ Huynh",
        parentPhone: "0956789012",
        parentEmail: "phuhuynh1@gmail.com",
        address: "Hải Phòng",
        status: "Đang học",
    },
    {
        id: 2,
        name: "Trần Thị Bảo Châu",
        email: "chau.ttb@gmail.com",
        gender: "Nữ",
        dob: "2008-07-22",
        className: "10A1",
        academicYear: "2025-2026",
        teacher: "Trần Thị Hương",
        parentName: "Nguyễn Văn Phụ Huynh",
        parentPhone: "0956789012",
        parentEmail: "phuhuynh2@gmail.com",
        address: "Hải Phòng",
        status: "Đang học",
    },
    {
        id: 3,
        name: "Lê Hoàng Nam",
        email: "nam.lh@gmail.com",
        gender: "Nam",
        dob: "2008-11-05",
        className: "10A1",
        teacher: "Trần Thị Hương",
        parentName: "Trần Thị Lan Anh",
        parentPhone: "0967890123",
        parentEmail: "phuhuynh3@gmail.com",
        address: "Hải Phòng",
        status: "Đang học",
    },
    {
        id: 4,
        name: "Phạm Ngọc Ánh",
        email: "anh.pn@gmail.com",
        gender: "Nữ",
        dob: "2008-01-18",
        className: "10A2",
        teacher: "Lê Văn Minh",
        parentName: "Trần Thị Lan Anh",
        parentPhone: "0967890123",
        parentEmail: "phuhuynh4@gmail.com",
        address: "Hải Phòng",
        status: "Đang học",
    },
    {
        id: 5,
        name: "Vũ Thị Mai",
        email: "mai.vt@gmail.com",
        gender: "Nữ",
        dob: "2008-05-30",
        className: "10A2",
        teacher: "Lê Văn Minh",
        parentName: "Nguyễn Văn Phụ Huynh",
        parentPhone: "0990123456",
        parentEmail: "phuhuynh5@gmail.com",
        address: "Hải Phòng",
        status: "Đang học",
    },
    {
        id: 6,
        name: "Đặng Quốc Hùng",
        email: "hung.dq@gmail.com",
        gender: "Nam",
        dob: "2007-09-12",
        className: "11B1",
        teacher: "Phạm Thị Lan",
        parentName: "Đặng Phụ Huynh F",
        parentPhone: "0901234568",
        parentEmail: "phuhuynh6@gmail.com",
        address: "Hải Phòng",
        status: "Đang học",
    },
    {
        id: 7,
        name: "Phạm Thu Hà",
        email: "ha.pt@gmail.com",
        gender: "Nữ",
        dob: "2007-10-21",
        className: "11B2",
        teacher: "Phan Ngọc Anh",
        parentName: "Phạm Văn B",
        parentPhone: "0911223344",
        parentEmail: "phuhuynh7@gmail.com",
        address: "Hải Phòng",
        status: "Đang học",
    },
    {
        id: 8,
        name: "Ngô Thành Đạt",
        email: "dat.nt@gmail.com",
        gender: "Nam",
        dob: "2006-12-01",
        className: "12C1",
        teacher: "Đỗ Hải Yến",
        parentName: "Ngô Thị Hồng",
        parentPhone: "0933445566",
        parentEmail: "phuhuynh8@gmail.com",
        address: "Hải Phòng",
        status: "Đang học",
    },
    {
        id: 9,
        name: "Nguyễn Văn Cũ",
        email: "cu.nv@gmail.com",
        gender: "Nam",
        dob: "2007-01-01",
        className: "10A1",
        academicYear: "2024-2025",
        teacher: "Trần Thị Hương",
        parentName: "Nguyễn Văn Phụ Huynh",
        parentPhone: "0956789012",
        parentEmail: "phuhuynh1@gmail.com",
        address: "Hải Phòng",
        status: "Đã tốt nghiệp",
    },
    {
        id: 10,
        name: "Trần Thị Cũ",
        email: "cu.tt@gmail.com",
        gender: "Nữ",
        dob: "2007-02-02",
        className: "10A1",
        academicYear: "2024-2025",
        teacher: "Trần Thị Hương",
        parentName: "Nguyễn Văn Phụ Huynh",
        parentPhone: "0956789012",
        parentEmail: "phuhuynh2@gmail.com",
        address: "Hải Phòng",
        status: "Đã tốt nghiệp",
    },
];

const classOptions = ["Tất cả lớp", "10A1", "10A2", "11B1", "11B2", "12C1"];
const statusOptions = ["Tất cả trạng thái", "Đang học", "Đình chỉ", "Bảo lưu", "Đã tốt nghiệp"];

const emptyStudentForm = {
    name: "",
    email: "",
    className: "10A1",
    academicYear: "2025-2026",
    gender: "Nam",
    dob: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    address: "",
    status: "Đang học",
};

function toStudentForm(student) {
    return {
        name: student?.name || "",
        email: student?.email || "",
        className: student?.className || "10A1",
        academicYear: student?.academicYear || "2025-2026",
        gender: student?.gender || "Nam",
        dob: student?.dob || "",
        parentName: student?.parentName || "",
        parentPhone: student?.parentPhone || "",
        parentEmail: student?.parentEmail || "",
        address: student?.address || "",
        status: student?.status || "Đang học",
    };
}

const ITEMS_PER_PAGE = 6;

export default function AdminStudents() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [students, setStudents] = useState(initialStudents);
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

    const handleCreateStudentAccount = () => {
        setIsCreateStudentAccountOpen(false);
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

            setImportFeedback({
                type: "success",
                message: "Tinh nang import chua san sang, xin vui long nhap thu cong.",
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
                "Ten phu huynh": "Nguyen Van B",
                "So dien thoai phu huynh": "0901234567",
                "Co so dien thoai ca nhan": "Co",
                "So dien thoai ca nhan": "0912345678",
            },
        ];

        const worksheet = utils.json_to_sheet(templateRows);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "MauHocSinh");
        writeFile(workbook, "mau-import-hoc-sinh.xlsx");
    };

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const matchYear = student.academicYear === selectedSchoolYear || !student.academicYear;

            const matchSearch =
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.parentPhone.includes(searchTerm);

            const matchClass =
                selectedClass === "Tất cả lớp" || student.className === selectedClass;

            const matchStatus =
                selectedStatus === "Tất cả trạng thái" || student.status === selectedStatus;

            return matchYear && matchSearch && matchClass && matchStatus;
        });
    }, [students, searchTerm, selectedClass, selectedStatus, selectedSchoolYear]);

    const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));

    const paginatedStudents = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredStudents, currentPage]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedClass, selectedStatus]);

    React.useEffect(() => {
        setCurrentPage((prev) => Math.min(prev, totalPages));
    }, [totalPages]);

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
        const teacherMap = {
            "10A1": "Trần Thị Hương",
            "10A2": "Lê Văn Minh",
            "11B1": "Phạm Thị Lan",
            "11B2": "Phan Ngọc Anh",
            "12C1": "Đỗ Hải Yến",
        };

        return teacherMap[className] || "Chưa phân công";
    };

    const handleSaveStudentEdit = () => {
        if (!activeStudentId) return;
        if (!studentForm.name.trim()) return;
        if (!studentForm.dob.trim()) return;
        if (!studentForm.parentName.trim()) return;
        if (!studentForm.parentPhone.trim()) return;

        setStudents((prev) =>
            prev.map((student) => {
                if (student.id !== activeStudentId) return student;

                return {
                    ...student,
                    ...studentForm,
                    name: studentForm.name.trim(),
                    email: studentForm.email.trim(),
                    className: studentForm.className,
                    gender: studentForm.gender,
                    dob: studentForm.dob,
                    parentName: studentForm.parentName.trim(),
                    parentPhone: studentForm.parentPhone.trim(),
                    parentEmail: studentForm.parentEmail.trim(),
                    address: studentForm.address.trim(),
                    teacher: getTeacherByClass(studentForm.className),
                    status: studentForm.status,
                };
            })
        );

        window.alert(`Đã cập nhật học sinh ${studentForm.name.trim()} thành công.`);

        handleCloseModal();
    };

    const handleDeleteStudent = (id) => {
        const confirmed = window.confirm("Bạn có chắc muốn xóa học sinh này không?");
        if (!confirmed) return;

        setStudents((prev) => prev.filter((student) => student.id !== id));
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

    const handleSubmitModal = () => {
        if (activeModalMode === "edit") {
            handleSaveStudentEdit();
        }
    };

    const activeStudent = useMemo(
        () => students.find((student) => student.id === activeStudentId) || null,
        [students, activeStudentId]
    );

    return (
        <div className="admin-students-page">
            <PageHeader
                title="Quản lý Học sinh"
                eyebrow={`Tổng cộng: ${students.length} học sinh`}
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

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

            <StudentListSection
                students={paginatedStudents}
                onSelectStudent={handleViewStudent}
                onEdit={handleEditStudent}
                onDelete={handleDeleteStudent}
            />

            <div className="admin-students-pagination-row">
                <div className="admin-students-pagination" aria-label="Phân trang học sinh">
                    <button
                        type="button"
                        className="admin-students-page-btn"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage <= 1}
                        aria-label="Trang trước"
                    >
                        <FiChevronLeft />
                    </button>

                    <p className="admin-students-page-indicator" aria-live="polite">
                        <span>{currentPage}</span>
                        <small>/ {totalPages}</small>
                    </p>

                    <button
                        type="button"
                        className="admin-students-page-btn"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage >= totalPages}
                        aria-label="Trang sau"
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </div>

            {activeModalMode && (
                <StudentInformationSection
                    mode={activeModalMode}
                    formData={studentForm}
                    classOptions={classOptions.filter((item) => item !== "Tất cả lớp")}
                    teacherName={activeStudent?.teacher || getTeacherByClass(studentForm.className)}
                    onChange={handleInputChange}
                    onRequestEdit={() => setActiveModalMode("edit")}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmitModal}
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