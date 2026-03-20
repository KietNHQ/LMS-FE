import React, { useMemo, useState } from "react";
import "./AdminStudents.css";

import StudentActionsSection from "./components/studentActionsSection/studentActionsSection";
import StudentListSection from "./components/studentListSection/studentListSection";
import StudentInformationSection from "./components/studentInformationSection/studentInformationSection";

const initialStudents = [
    {
        id: 1,
        name: "Nguyễn Minh Tuấn",
        gender: "Nam",
        dob: "2008-03-15",
        className: "10A1",
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
        gender: "Nữ",
        dob: "2008-07-22",
        className: "10A1",
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
];

const classOptions = ["Tất cả lớp", "10A1", "10A2", "11B1", "11B2", "12C1", "9A1", "8A1"];

const emptyStudentForm = {
    name: "",
    className: "10A1",
    gender: "Nam",
    dob: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    address: "",
};

function toStudentForm(student) {
    return {
        name: student?.name || "",
        className: student?.className || "10A1",
        gender: student?.gender || "Nam",
        dob: student?.dob || "",
        parentName: student?.parentName || "",
        parentPhone: student?.parentPhone || "",
        parentEmail: student?.parentEmail || "",
        address: student?.address || "",
    };
}

export default function AdminStudents() {
    const [students, setStudents] = useState(initialStudents);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClass, setSelectedClass] = useState("Tất cả lớp");
    const [activeModalMode, setActiveModalMode] = useState(null);
    const [activeStudentId, setActiveStudentId] = useState(null);

    const [studentForm, setStudentForm] = useState(emptyStudentForm);

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const matchSearch =
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.parentPhone.includes(searchTerm);

            const matchClass =
                selectedClass === "Tất cả lớp" || student.className === selectedClass;

            return matchSearch && matchClass;
        });
    }, [students, searchTerm, selectedClass]);

    const handleOpenModal = () => {
        setActiveModalMode("create");
        setActiveStudentId(null);
        setStudentForm(emptyStudentForm);
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
        const teacherMap = {
            "10A1": "Trần Thị Hương",
            "10A2": "Lê Văn Minh",
            "11B1": "Phạm Thị Lan",
            "11B2": "Phan Ngọc Anh",
            "12C1": "Đỗ Hải Yến",
            "9A1": "Nguyễn Thị Vân",
            "8A1": "Hoàng Văn Sơn",
        };

        return teacherMap[className] || "Chưa phân công";
    };

    const handleCreateStudent = () => {
        if (!studentForm.name.trim()) return;
        if (!studentForm.dob.trim()) return;
        if (!studentForm.parentName.trim()) return;
        if (!studentForm.parentPhone.trim()) return;

        const createdStudent = {
            id: Date.now(),
            name: studentForm.name.trim(),
            gender: studentForm.gender,
            dob: studentForm.dob,
            className: studentForm.className,
            teacher: getTeacherByClass(studentForm.className),
            parentName: studentForm.parentName.trim(),
            parentPhone: studentForm.parentPhone.trim(),
            parentEmail: studentForm.parentEmail.trim(),
            address: studentForm.address.trim(),
            status: "Đang học",
        };

        setStudents((prev) => [createdStudent, ...prev]);
        handleCloseModal();
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
                    className: studentForm.className,
                    gender: studentForm.gender,
                    dob: studentForm.dob,
                    parentName: studentForm.parentName.trim(),
                    parentPhone: studentForm.parentPhone.trim(),
                    parentEmail: studentForm.parentEmail.trim(),
                    address: studentForm.address.trim(),
                    teacher: getTeacherByClass(studentForm.className),
                };
            })
        );

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
        if (activeModalMode === "create") {
            handleCreateStudent();
            return;
        }

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
            <StudentActionsSection
                totalStudents={students.length}
                searchTerm={searchTerm}
                selectedClass={selectedClass}
                classOptions={classOptions}
                onSearchChange={setSearchTerm}
                onClassChange={setSelectedClass}
                onAddStudent={handleOpenModal}
            />

            <StudentListSection
                students={filteredStudents}
                onView={handleViewStudent}
                onEdit={handleEditStudent}
                onDelete={handleDeleteStudent}
            />

            {activeModalMode && (
                <StudentInformationSection
                    mode={activeModalMode}
                    formData={studentForm}
                    classOptions={classOptions.filter((item) => item !== "Tất cả lớp")}
                    teacherName={activeStudent?.teacher || getTeacherByClass(studentForm.className)}
                    onChange={handleInputChange}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmitModal}
                />
            )}
        </div>
    );
}