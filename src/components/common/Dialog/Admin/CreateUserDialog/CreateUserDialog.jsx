import React, { useMemo, useState, useRef, useEffect } from "react";
import { FiDownload, FiUpload, FiChevronDown, FiCheck, FiShield, FiCheckSquare } from "react-icons/fi";
import { PERMISSIONS, MANAGEMENT_TITLES, PERMISSION_GROUPS } from "../../../../../config/permissions";
import Select from "../../../../ui/Select/Select";
import { useCheckPermission } from "../../../../../hooks/useAuth";
import { classesService } from "../../../../../services/pages/management/classes/classesService";
import { adminApiService } from "../../../../../services/pages/admin/generated";
import "./CreateUserDialog.css";

const allRoleOptions = ["Quản lý", "Phụ huynh", "Học sinh", "Giáo viên"];

const roleEmailDomainMap = {
    "Quản trị viên": "thptlocal.edu.vn",
    "Quản lý": "thptlocal.edu.vn",
    "Giáo viên": "thptlocal.edu.vn",
    "Học sinh": "thptlocal.edu.vn",
    "Phụ huynh": "thptlocal.edu.vn",
};

function getRoleEmailDomain(role) { return roleEmailDomainMap[role] || roleEmailDomainMap["Học sinh"]; }

function removeVietnameseMarks(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}

function toToken(value) {
    return removeVietnameseMarks(value).toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, "");
}

function toInitials(value) {
    return removeVietnameseMarks(value).toLowerCase().trim().split(/\s+/).filter(Boolean).map((word) => word.charAt(0)).join("").replace(/[^a-z0-9]/g, "");
}

function parseFullName(fullName) {
    const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { lastName: "", firstName: "" };
    if (parts.length === 1) return { lastName: "", firstName: parts[0] };
    return { lastName: parts.slice(0, -1).join(" "), firstName: parts[parts.length - 1] };
}

function normalizePhone(value) { return String(value || "").replace(/\D/g, "").slice(0, 10); }

function buildEmail(firstName, lastName, role) {
    const first = toToken(firstName);
    const initials = toInitials(lastName);
    const localPart = [first, initials].filter(Boolean).join(".") || "user";
    return `${localPart}@${getRoleEmailDomain(role)}`;
}

function createEmptyChild() { return { childName: "", childClass: "" }; }

// Helper component for indeterminate checkbox
function IndeterminateCheckbox({ checked, indeterminate, onChange, className, ...props }) {
    const ref = useRef();
    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    return (
        <input
            type="checkbox"
            ref={ref}
            className={className}
            checked={checked}
            onChange={onChange}
            {...props}
        />
    );
}

function buildDefaultForm(role) {
    return {
        lastName: "", firstName: "", dob: "", role: role || "Học sinh",
        studentInfo: { parentPhone: "", hasPersonalPhone: false, personalPhone: "" },
        teacherInfo: { subject: "", phone: "", isHomeroomTeacher: false, homeroomClass: "" },
        parentInfo: { children: [createEmptyChild()], phone: "" },
        managerInfo: { phone: "", title: "custom", customTitle: "", permissions: [] },
        status: "Hoạt động",
    };
}

function buildFormFromInitialData(initialData, mode, role) {
    if (!initialData) return buildDefaultForm(role);
    const profile = initialData.profile || {};
    const parsed = parseFullName(initialData.name);
    let rawDob = profile.dob || initialData.dob || "";
    if (rawDob && rawDob.includes("T")) rawDob = rawDob.split("T")[0];
    if (rawDob && rawDob.includes("/") && rawDob.split("/")[0].length === 2) {
        const parts = rawDob.split("/");
        rawDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    const initialChildren = Array.isArray(profile.children || initialData.displayChildren)
        ? (profile.children || initialData.displayChildren).map(child => ({
            childName: String(child?.childName || child?.studentName || "").trim(),
            childClass: String(child?.childClass || child?.className || child?.class || "").trim(),
        })).filter(child => child.childName || child.childClass) : [];
    const resolvedChildren = initialChildren.length > 0 ? initialChildren : [createEmptyChild()];
    return {
        lastName: profile.lastName || parsed.lastName || "",
        firstName: profile.firstName || parsed.firstName || "",
        dob: rawDob,
        role: role || initialData.role,
        studentInfo: { parentPhone: normalizePhone(profile.parentPhone || ""), hasPersonalPhone: Boolean(profile.hasPersonalPhone), personalPhone: normalizePhone(profile.personalPhone || initialData.phone || "") },
        teacherInfo: { subject: profile.subject || "", phone: normalizePhone(profile.phone || initialData.phone || ""), isHomeroomTeacher: !!profile.homeroomClass, homeroomClass: profile.homeroomClass || "" },
        parentInfo: { children: resolvedChildren, phone: normalizePhone(profile.phone || initialData.phone || "") },
        managerInfo: { phone: normalizePhone(profile.phone || initialData.phone || ""), title: profile.title || "custom", customTitle: profile.customTitle || "", permissions: Array.isArray(profile.permissions) ? profile.permissions : [] },
        status: initialData.status || "Hoạt động",
    };
}

function buildRoleProfile(role, form) {
    if (role === "Học sinh") return { parentPhone: form.studentInfo.parentPhone, hasPersonalPhone: form.studentInfo.hasPersonalPhone, personalPhone: form.studentInfo.hasPersonalPhone ? form.studentInfo.personalPhone : "" };
    if (role === "Giáo viên") return { subject: form.teacherInfo.subject.trim(), phone: form.teacherInfo.phone, homeroomClass: form.teacherInfo.isHomeroomTeacher ? form.teacherInfo.homeroomClass : "" };
    if (role === "Phụ huynh") {
        const children = form.parentInfo.children.map(child => ({ childName: String(child.childName || "").trim(), childClass: String(child.childClass || "").trim() })).filter(child => child.childName && child.childClass);
        return { childName: children[0]?.childName || "", childClass: children[0]?.childClass || "", children, phone: form.parentInfo.phone };
    }
    if (role === "Quản lý" || role === "Quản trị viên") {
        const titleData = MANAGEMENT_TITLES.find(t => t.value === form.managerInfo.title);
        const resolvedTitle = form.managerInfo.title === "custom" ? form.managerInfo.customTitle.trim() : (titleData?.label || form.managerInfo.title);
        return { phone: form.managerInfo.phone, title: resolvedTitle, titleKey: form.managerInfo.title, permissions: form.managerInfo.permissions };
    }
    return {};
}

function getRolePhone(role, form) {
    if (role === "Học sinh") return form.studentInfo.hasPersonalPhone ? form.studentInfo.personalPhone : "—";
    if (role === "Giáo viên") return form.teacherInfo.phone || "—";
    if (role === "Phụ huynh") return form.parentInfo.phone || "—";
    if (role === "Quản lý" || role === "Quản trị viên") return form.managerInfo.phone || "—";
    return "—";
}

export default function CreateUserDialog({ mode = "create", title, submitLabel, initialData, fixedRole, onClose, onSubmit, onImportExcel, onDownloadTemplate, isImportingExcel = false, importFeedback }) {
    const { user: currentUser } = useCheckPermission();
    const isAdmin = currentUser?.role === "admin";
    const normalizedRoleOptions = useMemo(() => (mode === "edit" && initialData?.role === "Quản trị viên") ? ["Quản trị viên", ...allRoleOptions] : allRoleOptions, [mode, initialData]);
    const [form, setForm] = useState(() => buildFormFromInitialData(initialData, mode, fixedRole || initialData?.role || normalizedRoleOptions[0] || "Học sinh"));
    const [expandedGroups, setExpandedGroups] = useState(["users"]);
    const [realClasses, setRealClasses] = useState([]);
    const [subjectOptions, setSubjectOptions] = useState([]);
    const [shouldUpdateLinkedStudents, setShouldUpdateLinkedStudents] = useState(false);
    const contentRef = useRef(null);
    const selectedRole = fixedRole || form.role;

    // Kiểm tra xem SĐT có thay đổi so với dữ liệu gốc không
    const phoneHasChanged = useMemo(() => {
        if (mode !== "edit" || !initialData) return false;
        const oldPhone = initialData.phone || initialData.profile?.phone || "";
        if (selectedRole === "Phụ huynh") return form.parentInfo.phone !== oldPhone;
        if (selectedRole === "Giáo viên") return form.teacherInfo.phone !== oldPhone;
        if (selectedRole === "Quản lý") return form.managerInfo.phone !== oldPhone;
        return false;
    }, [mode, initialData, form, selectedRole]);

    // Fetch danh sách lớp học thật
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const data = await classesService.listClasses();
                const classNames = data.map(c => c.name).sort();
                setRealClasses(classNames);
            } catch (error) {
                console.error("Failed to fetch classes:", error);
            }
        };
        fetchClasses();
    }, []);

    useEffect(() => {
        let cancelled = false;

        const fetchSubjects = async () => {
            try {
                const response = await adminApiService.get_subjects();
                const rows = Array.isArray(response?.data) ? response.data : [];
                const names = Array.from(new Set(rows.map(subject => subject?.name).filter(Boolean)))
                    .sort((a, b) => a.localeCompare(b, "vi"));

                if (!cancelled) {
                    setSubjectOptions(names.map(name => ({ value: name, label: name })));
                }
            } catch (error) {
                if (!cancelled) {
                    setSubjectOptions([]);
                }
            }
        };

        fetchSubjects();

        return () => {
            cancelled = true;
        };
    }, []);

    // Cuộn lên đầu khi mở hộp thoại hoặc đổi mode/dữ liệu
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [mode, initialData]);
    const generatedEmail = useMemo(() => buildEmail(form.firstName, form.lastName, selectedRole), [form.firstName, form.lastName, selectedRole]);

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
    const handleRoleInfoChange = (section, field, value) => setForm(prev => ({ ...prev, [section]: { ...prev[section], [field]: field.toLowerCase().includes("phone") ? normalizePhone(value) : value } }));
    const handleParentChildChange = (index, field, value) => setForm(prev => ({ ...prev, parentInfo: { ...prev.parentInfo, children: prev.parentInfo.children.map((c, i) => i === index ? { ...c, [field]: value } : c) } }));
    const handleAddParentChild = () => setForm(prev => ({ ...prev, parentInfo: { ...prev.parentInfo, children: [...prev.parentInfo.children, createEmptyChild()] } }));
    const handleRemoveParentChild = (index) => setForm(prev => prev.parentInfo.children.length <= 1 ? prev : ({ ...prev, parentInfo: { children: prev.parentInfo.children.filter((_, i) => i !== index) } }));
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.lastName.trim() || !form.firstName.trim() || !form.dob) { window.alert("Vui lòng điền đủ thông tin."); return; }
        onSubmit({
            name: `${form.lastName} ${form.firstName}`.trim(),
            lastName: form.lastName.trim(),
            firstName: form.firstName.trim(),
            dob: form.dob,
            email: generatedEmail,
            role: selectedRole,
            phone: getRolePhone(selectedRole, form),
            status: form.status,
            shouldUpdateLinkedStudents: mode === "edit" && phoneHasChanged ? shouldUpdateLinkedStudents : undefined,
            profile: { ...buildRoleProfile(selectedRole, form), lastName: form.lastName.trim(), firstName: form.firstName.trim(), dob: form.dob }
        });
    };

    return (
        <div className="admin-create-user-dialog-overlay" onClick={onClose}>
            <div className="admin-create-user-dialog-modal" onClick={e => e.stopPropagation()}>
                <h2>{title}</h2>
                {mode === "create" && onImportExcel && (
                    <div className="admin-create-user-dialog-excel-actions">
                        <button type="button" className="admin-create-user-dialog-excel-btn" onClick={onDownloadTemplate}><FiDownload /> <span>Tải mẫu</span></button>
                        <label className="admin-create-user-dialog-excel-btn"><FiUpload /> <span>{isImportingExcel ? "Đang nạp..." : "Thêm bằng Excel"}</span><input type="file" accept=".xlsx,.xls,.csv" onChange={e => { const f = e.target.files?.[0]; if (f) onImportExcel(f); e.target.value = ""; }} disabled={isImportingExcel} /></label>
                    </div>
                )}
                {importFeedback && <div className={`admin-create-user-dialog-import-feedback ${importFeedback.type}`}>{importFeedback.message}</div>}

                <form className="admin-create-user-dialog-form" onSubmit={handleSubmit}>
                    <div className="admin-create-user-dialog-form-content" ref={contentRef}>
                        {mode === "edit" ? (
                            <>
                                <div className="admin-create-user-dialog-field-row">
                                    <div className="admin-create-user-dialog-field">
                                        <label htmlFor="edit-lastname">Họ và tên lót</label>
                                        <input 
                                            id="edit-lastname"
                                            type="text" 
                                            value={form.lastName} 
                                            onChange={e => handleChange("lastName", e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div className="admin-create-user-dialog-field">
                                        <label htmlFor="edit-firstname">Tên</label>
                                        <input 
                                            id="edit-firstname"
                                            type="text" 
                                            value={form.firstName} 
                                            onChange={e => handleChange("firstName", e.target.value)} 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="admin-create-user-dialog-field-row">
                                    <div className="admin-create-user-dialog-field">
                                        <label htmlFor="edit-dob">Ngày sinh</label>
                                        <input 
                                            id="edit-dob"
                                            type="date" 
                                            value={form.dob} 
                                            onChange={e => handleChange("dob", e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div className="admin-create-user-dialog-field">
                                        <label>Email hệ thống</label>
                                        <div className="admin-create-user-dialog-readonly-value">
                                            {generatedEmail}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                 <div className="admin-create-user-dialog-field-row">
                                     <div className="admin-create-user-dialog-field">
                                         <label htmlFor="create-lastname">Họ và tên lót <span className="required-mark">*</span></label>
                                         <input 
                                             id="create-lastname"
                                             type="text" 
                                             placeholder="VD: Nguyễn Văn"
                                             value={form.lastName} 
                                             onChange={e => handleChange("lastName", e.target.value)} 
                                             required 
                                         />
                                     </div>
                                     <div className="admin-create-user-dialog-field">
                                         <label htmlFor="create-firstname">Tên <span className="required-mark">*</span></label>
                                         <input 
                                             id="create-firstname"
                                             type="text" 
                                             placeholder="VD: Tuấn"
                                             value={form.firstName} 
                                             onChange={e => handleChange("firstName", e.target.value)} 
                                             required 
                                         />
                                     </div>
                                 </div>
                                 <div className="admin-create-user-dialog-field-row">
                                     <div className="admin-create-user-dialog-field">
                                         <label htmlFor="create-dob">Ngày tháng năm sinh <span className="required-mark">*</span></label>
                                         <input 
                                             id="create-dob"
                                             type="date" 
                                             value={form.dob} 
                                             onChange={e => handleChange("dob", e.target.value)} 
                                             required 
                                         />
                                     </div>
                                     <div className="admin-create-user-dialog-field">
                                         <label>Vai trò <span className="required-mark">*</span></label>
                                         {fixedRole ? (
                                             <div className="admin-create-user-dialog-readonly-value">{fixedRole}</div>
                                         ) : (
                                             <Select 
                                                 variant="custom" 
                                                 value={form.role} 
                                                 onChange={e => handleChange("role", e.target.value)} 
                                                 options={normalizedRoleOptions} 
                                             />
                                         )}
                                     </div>
                                 </div>
                                <div className="admin-create-user-dialog-field">
                                    <label>Email hệ thống (Tự động)</label>
                                    <div className="admin-create-user-dialog-readonly-value">
                                        {generatedEmail}
                                    </div>
                                </div>
                            </>
                        )}

                        {selectedRole === "Giáo viên" && (
                            <div className="admin-create-user-dialog-role-block">
                                <h3>Thông tin giáo viên</h3>
                                <div className="admin-create-user-dialog-field-row">
                                    <div className="admin-create-user-dialog-field">
                                        <label htmlFor="teacher-phone">Số điện thoại <span className="required-mark">*</span></label>
                                        <input 
                                            id="teacher-phone"
                                            type="tel" 
                                            placeholder="Nhập SĐT giáo viên"
                                            value={form.teacherInfo.phone} 
                                            onChange={e => handleRoleInfoChange("teacherInfo", "phone", e.target.value)} 
                                            inputMode="numeric" 
                                            maxLength={10} 
                                            required 
                                        />
                                    </div>
                                    <div className="admin-create-user-dialog-field">
                                        <label>Môn chuyên dạy</label>
                                        <Select 
                                            variant="custom" 
                                            value={form.teacherInfo.subject} 
                                            onChange={e => handleRoleInfoChange("teacherInfo", "subject", e.target.value)} 
                                            options={subjectOptions}
                                            placeholder="Chọn môn" 
                                        />
                                    </div>
                                </div>
                                {mode === "edit" && phoneHasChanged && (
                                    <div className="admin-create-user-dialog-checkbox-group">
                                        <label className="admin-create-user-dialog-checkbox">
                                            <input type="checkbox" checked={shouldUpdateLinkedStudents} onChange={e => setShouldUpdateLinkedStudents(e.target.checked)} />
                                            <span>Cập nhập liên kết học sinh với số điện thoại mới</span>
                                        </label>
                                    </div>
                                )}
                                {mode === "edit" && (
                                    <div className="admin-create-user-dialog-field-row">
                                        <div className="admin-create-user-dialog-field">
                                            <label>Lớp chủ nhiệm</label>
                                            <Select 
                                                variant="custom" 
                                                value={form.teacherInfo.isHomeroomTeacher ? form.teacherInfo.homeroomClass : "Chưa phân công"} 
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    handleRoleInfoChange("teacherInfo", "isHomeroomTeacher", val !== "Chưa phân công");
                                                    handleRoleInfoChange("teacherInfo", "homeroomClass", val === "Chưa phân công" ? "" : val);
                                                }} 
                                                options={["Chưa phân công", ...realClasses]} 
                                                placeholder="Chọn lớp" 
                                            />
                                        </div>
                                        <div className="admin-create-user-dialog-field">
                                            <label>Trạng thái</label>
                                            <Select 
                                                variant="custom" 
                                                value={form.status} 
                                                onChange={e => handleChange("status", e.target.value)} 
                                                options={["Hoạt động", "Vô hiệu hóa"]} 
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                         {selectedRole === "Học sinh" && (
                             <div className="admin-create-user-dialog-role-block">
                                 <div className="admin-create-user-dialog-role-header">
                                     <h3>Thông tin gia đình</h3>
                                 </div>
                                 <div className="admin-create-user-dialog-field">
                                     <label htmlFor="student-parent-phone">SĐT phụ huynh <span className="required-mark">*</span></label>
                                     <input id="student-parent-phone" type="tel" placeholder="Nhập SĐT phụ huynh" value={form.studentInfo.parentPhone} onChange={e => handleRoleInfoChange("studentInfo", "parentPhone", e.target.value)} inputMode="numeric" maxLength={10} required />
                                 </div>
                             </div>
                         )}
                         {selectedRole === "Phụ huynh" && (
                             <div className="admin-create-user-dialog-role-block">
                                 <div className="admin-create-user-dialog-role-header">
                                     <h3>Thông tin con em</h3>
                                     <button type="button" className="admin-create-user-dialog-child-add-btn" onClick={handleAddParentChild}>+ Thêm con</button>
                                 </div>
                                  <div className="admin-create-user-dialog-field">
                                      <label htmlFor="parent-phone">Số điện thoại phụ huynh <span className="required-mark">*</span></label>
                                      <input id="parent-phone" type="tel" placeholder="Nhập SĐT phụ huynh" value={form.parentInfo.phone} onChange={e => handleRoleInfoChange("parentInfo", "phone", e.target.value)} inputMode="numeric" maxLength={10} required />
                                  </div>
                                  {mode === "edit" && phoneHasChanged && (
                                      <div className="admin-create-user-dialog-checkbox-group">
                                          <label className="admin-create-user-dialog-checkbox">
                                              <input type="checkbox" checked={shouldUpdateLinkedStudents} onChange={e => setShouldUpdateLinkedStudents(e.target.checked)} />
                                              <span>Cập nhập liên kết học sinh với số điện thoại mới</span>
                                          </label>
                                      </div>
                                  )}
                                 <div className="admin-create-user-dialog-children-list">
                                    {form.parentInfo.children.map((c, i) => (
                                        <div key={i} className="admin-create-user-dialog-child-row">
                                            <div className="admin-create-user-dialog-field-row">
                                                <div className="admin-create-user-dialog-field">
                                                    <label htmlFor={`parent-child-name-${i}`}>Họ tên con <span className="required-mark">*</span></label>
                                                    <input id={`parent-child-name-${i}`} type="text" placeholder="Nhập tên con" value={c.childName} onChange={e => handleParentChildChange(i, "childName", e.target.value)} required />
                                                </div>
                                                <div className="admin-create-user-dialog-field">
                                                    <label htmlFor={`parent-child-class-${i}`}>Lớp <span className="required-mark">*</span></label>
                                                    <input id={`parent-child-class-${i}`} type="text" placeholder="VD: 10A1" value={c.childClass} onChange={e => handleParentChildChange(i, "childClass", e.target.value)} required />
                                                </div>
                                            </div>
                                            {form.parentInfo.children.length > 1 && (
                                                <button type="button" className="admin-create-user-dialog-child-remove-btn" onClick={() => handleRemoveParentChild(i)}>Gỡ bỏ</button>
                                            )}
                                        </div>
                                    ))}
                                 </div>
                             </div>
                         )}
                        {(selectedRole === "Quản lý" || selectedRole === "Quản trị viên") && (
                            <div className="admin-create-user-dialog-role-block">
                                <h3>Phân quyền quản lý</h3>
                                  <div className="admin-create-user-dialog-field">
                                      <label htmlFor="manager-phone">Số điện thoại <span className="required-mark">*</span></label>
                                      <input id="manager-phone" type="tel" placeholder="Nhập SĐT quản lý" value={form.managerInfo.phone} onChange={e => handleRoleInfoChange("managerInfo", "phone", e.target.value)} inputMode="numeric" maxLength={10} required />
                                  </div>
                                  {mode === "edit" && phoneHasChanged && (
                                      <div className="admin-create-user-dialog-checkbox-group">
                                          <label className="admin-create-user-dialog-checkbox">
                                              <input type="checkbox" checked={shouldUpdateLinkedStudents} onChange={e => setShouldUpdateLinkedStudents(e.target.checked)} />
                                              <span>Cập nhập liên kết học sinh với số điện thoại mới</span>
                                          </label>
                                      </div>
                                  )}
                                  <div className="admin-create-user-dialog-field"><label>Chức vụ</label><Select variant="custom" value={form.managerInfo.title} onChange={e => { const v = e.target.value; setForm(p => ({ ...p, managerInfo: { ...p.managerInfo, title: v, permissions: MANAGEMENT_TITLES.find(t => t.value === v)?.permissions || [] } })); }} options={MANAGEMENT_TITLES} /></div>
                                {form.managerInfo.title === "custom" && <div className="admin-create-user-dialog-field"><label>Tên chức vụ</label><input type="text" value={form.managerInfo.customTitle} onChange={e => handleRoleInfoChange("managerInfo", "customTitle", e.target.value)} required /></div>}
                                <div className="admin-create-user-dialog-perm-groups">
                                    {PERMISSION_GROUPS.map(g => (
                                        <div key={g.id} className={`perm-group-item ${expandedGroups.includes(g.id) ? "active" : ""}`}>
                                            <div className="perm-group-header" onClick={() => setExpandedGroups(p => p.includes(g.id) ? p.filter(id => id !== g.id) : [...p, g.id])}>
                                                <div className="perm-group-left">
                                                    <IndeterminateCheckbox 
                                                        checked={g.permissions.every(p => form.managerInfo.permissions.includes(p.id))} 
                                                        indeterminate={
                                                            g.permissions.some(p => form.managerInfo.permissions.includes(p.id)) && 
                                                            !g.permissions.every(p => form.managerInfo.permissions.includes(p.id))
                                                        }
                                                        onChange={e => { 
                                                            const checked = e.target.checked; 
                                                            const ids = g.permissions.map(p => p.id).filter(id => isAdmin || id !== PERMISSIONS.USER_DELETE); 
                                                            setForm(p => ({ ...p, managerInfo: { ...p.managerInfo, title: "custom", permissions: checked ? Array.from(new Set([...p.managerInfo.permissions, ...ids])) : p.managerInfo.permissions.filter(id => !ids.includes(id)) } })); 
                                                        }} 
                                                        onClick={e => e.stopPropagation()} 
                                                    />
                                                    <span className="perm-group-label">{g.label}</span>
                                                </div>
                                                <FiChevronDown className={`perm-group-arrow ${expandedGroups.includes(g.id) ? "up" : ""}`} />
                                            </div>
                                            {expandedGroups.includes(g.id) && <div className="perm-group-content">{g.permissions.map(p => <label key={p.id} className="admin-create-user-dialog-checkbox"><input type="checkbox" checked={form.managerInfo.permissions.includes(p.id)} onChange={() => setForm(pPrev => ({ ...pPrev, managerInfo: { ...pPrev.managerInfo, title: "custom", permissions: pPrev.managerInfo.permissions.includes(p.id) ? pPrev.managerInfo.permissions.filter(id => id !== p.id) : [...pPrev.managerInfo.permissions, p.id] } }))} /><span>{p.label}</span></label>)}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="admin-create-user-dialog-actions">
                        <button type="button" className="admin-create-user-dialog-btn cancel" onClick={onClose}>Hủy</button>
                        <button type="submit" className="admin-create-user-dialog-btn primary">{submitLabel}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
