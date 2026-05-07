import React, { useMemo, useState } from "react";
import { FiShield } from "react-icons/fi";
import ProfileHeaderSection from "./sections/profileHeaderSection/ProfileHeaderSection";
import BasicInfoSection from "./sections/basicInfoSection/BasicInfoSection";
import ContactInfoSection from "./sections/contactInfoSection/ContactInfoSection";
import AchievementsSection from "./sections/achievementsSection/AchievementsSection";
import HomeroomClassSection from "./sections/homeroomClassSection/HomeroomClassSection";
import LinkedStudentsSection from "./sections/linkedStudentsSection/LinkedStudentsSection";
import RoleDescriptionSection from "./sections/roleDescriptionSection/RoleDescriptionSection";
import ProfileActionsSection from "./sections/profileActionsSection/ProfileActionsSection";
import ChangePasswordDialog from "../ChangePasswordDialog/ChangePasswordDialog";
import { getProfileByRole, ROLE_THEME } from "./profileData";
import { PERMISSION_GROUPS } from "../../../../config/permissions";
import "./ProfileDialog.css";

// Nội bộ component để tránh lỗi Import Module/MIME type
function PermissionsSection({ permissions = [], role }) {
    const isAdmin = role === "admin" || role === "quản trị viên";
    const hasPermissions = Array.isArray(permissions) && permissions.length > 0;
    
    const groupedPermissions = useMemo(() => {
        const groups = Array.isArray(PERMISSION_GROUPS) ? PERMISSION_GROUPS : [];
        
        return groups.map(group => {
            const matchedPermissions = group.permissions.filter(p => {
                if (isAdmin) return true;
                return permissions.includes(p.id);
            });

            return {
                ...group,
                matchedPermissions
            };
        }).filter(group => group.matchedPermissions.length > 0);
    }, [permissions, isAdmin]);

    return (
        <div className="permissions-section profile-info-card grouped-mode">
            <div className="permissions-section-header">
                <FiShield className="section-icon" />
                <h3>Chi tiết quyền hạn {isAdmin ? "(Toàn quyền)" : `(${permissions.length})`}</h3>
            </div>
            
            <div className="permissions-groups-container">
                {groupedPermissions.length > 0 ? (
                    groupedPermissions.map((group) => (
                        <div key={group.id} className="permission-group-item">
                            <h4 className="group-title">{group.label.toUpperCase()}</h4>
                            <div className="permissions-badges-grid">
                                {group.matchedPermissions.map((p) => (
                                    <span key={p.id} className="permission-tag">
                                        {p.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="permissions-empty-state">
                        <p>Tài khoản chưa được cấp quyền hệ thống.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProfileDialog({ open, role = "student", themeRole, profile, onClose }) {
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

    const roleTheme = ROLE_THEME[role] || ROLE_THEME.student;
    const visualRole = ROLE_THEME[themeRole] ? themeRole : role;
    const resolvedProfile = useMemo(() => getProfileByRole(role, profile), [role, profile]);

    const basicFields = useMemo(() => {
        if (role === "student") {
            return [
                { label: "Họ và tên", value: resolvedProfile.name },
                { label: "Ngày sinh", value: resolvedProfile.dob },
                { label: "Lớp", value: resolvedProfile.className },
                { label: "Giáo viên chủ nhiệm", value: resolvedProfile.homeroomTeacher }
            ];
        }

        if (role === "teacher") {
            return [
                { label: "Họ và tên", value: resolvedProfile.name },
                { label: "Số điện thoại", value: resolvedProfile.phone },
                { label: "Môn giảng dạy", value: resolvedProfile.subject },
                { label: "Chủ nhiệm lớp", value: resolvedProfile.homeroomClass }
            ];
        }

        if (role === "parent") {
            return [
                { label: "Họ và tên", value: resolvedProfile.name },
                { label: "Số điện thoại", value: resolvedProfile.phone },
                { label: "Địa chỉ", value: resolvedProfile.address },
                { label: "Số con đang học", value: resolvedProfile.childrenCount }
            ];
        }

        if (role === "management" || role === "admin" || role === "manager") {
            return [
                { label: "Họ và tên", value: resolvedProfile.name || "Người dùng" },
                { label: "Vai trò", value: roleTheme?.label || "Thành viên" },
                { label: "Chức danh", value: resolvedProfile.title || "Cán bộ nhân viên" }
            ];
        }

        return [];
    }, [role, resolvedProfile, roleTheme]);

    const contactFields = useMemo(() => {
        if (role === "student") {
            return [
                { label: "Địa chỉ", value: resolvedProfile.address },
                { label: "Tên phụ huynh", value: resolvedProfile.parentName },
                { label: "SĐT phụ huynh", value: resolvedProfile.parentPhone },
                { label: "Email", value: resolvedProfile.email }
            ];
        }

        if (role === "teacher") {
            return [{ label: "Email", value: resolvedProfile.email }];
        }

        if (role === "parent") {
            return [{ label: "Email", value: resolvedProfile.email }];
        }

        if (role === "management" || role === "admin" || role === "manager") {
            return [
                { label: "Email", value: resolvedProfile.email },
                { label: "Số điện thoại", value: resolvedProfile.phone || "—" }
            ];
        }

        return [];
    }, [role, resolvedProfile]);

    if (!open) return null;

    return (
        <div className="profile-dialog" data-role={visualRole} onClick={onClose}>
            <div className="profile-dialog-content" onClick={(event) => event.stopPropagation()}>
                <ProfileHeaderSection name={resolvedProfile.name || "Người dùng"} roleLabel={roleTheme?.label || "Thành viên"} role={visualRole} />
                <div className="profile-dialog-sections">
                    <BasicInfoSection fields={basicFields} />
                    <ContactInfoSection fields={contactFields} />
                    {resolvedProfile.achievements && resolvedProfile.achievements.length > 0 && (
                        <AchievementsSection achievements={resolvedProfile.achievements} />
                    )}
                    {role === "teacher" && (
                        <HomeroomClassSection subject={resolvedProfile.subject} homeroomClass={resolvedProfile.homeroomClass} />
                    )}
                    {role === "parent" && resolvedProfile.children && resolvedProfile.children.length > 0 && (
                        <LinkedStudentsSection children={resolvedProfile.children} total={resolvedProfile.childrenCount} />
                    )}
                    {(role === "admin" || role === "management" || role === "manager") && resolvedProfile.roleDescription && (
                        <RoleDescriptionSection descriptions={resolvedProfile.roleDescription} />
                    )}
                    {(role === "admin" || role === "management" || role === "manager" || role === "quản trị viên") && (
                        <PermissionsSection permissions={resolvedProfile.permissions} role={visualRole} />
                    )}
                </div>
                <ProfileActionsSection
                    role={visualRole}
                    onChangePassword={() => setIsPasswordDialogOpen(true)}
                    onClose={onClose}
                />
            </div>

            <ChangePasswordDialog
                open={isPasswordDialogOpen}
                role={visualRole}
                onClose={() => setIsPasswordDialogOpen(false)}
            />
        </div>
    );
}
