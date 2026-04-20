import React, { useMemo, useState } from "react";
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
import "./ProfileDialog.css";

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

        return [];
    }, [role, resolvedProfile]);

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

        return [];
    }, [role, resolvedProfile]);

    if (!open) return null;

    return (
        <div className="profile-dialog" onClick={onClose}>
            <div className="profile-dialog-content" onClick={(event) => event.stopPropagation()}>
                <ProfileHeaderSection name={resolvedProfile.name} roleLabel={roleTheme.label} role={visualRole} />
                <div className="profile-dialog-sections">
                    <BasicInfoSection fields={basicFields} />
                    <ContactInfoSection fields={contactFields} />
                    <AchievementsSection achievements={resolvedProfile.achievements} />
                    <HomeroomClassSection subject={resolvedProfile.subject} homeroomClass={resolvedProfile.homeroomClass} />
                    <LinkedStudentsSection children={resolvedProfile.children} total={resolvedProfile.childrenCount} />
                    <RoleDescriptionSection descriptions={resolvedProfile.roleDescription} />
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

