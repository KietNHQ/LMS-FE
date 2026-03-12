import React from "react";
import ProfileHeaderSection from "./sections/profileHeaderSection/ProfileHeaderSection";
import BasicInfoSection from "./sections/basicInfoSection/BasicInfoSection";
import ContactInfoSection from "./sections/contactInfoSection/ContactInfoSection";
import AchievementsSection from "./sections/achievementsSection/AchievementsSection";
import HomeroomClassSection from "./sections/homeroomClassSection/HomeroomClassSection";
import LinkedStudentsSection from "./sections/linkedStudentsSection/LinkedStudentsSection";
import RoleDescriptionSection from "./sections/roleDescriptionSection/RoleDescriptionSection";
import ProfileActionsSection from "./sections/profileActionsSection/ProfileActionsSection";
import "./ProfileDialog.css";

export default function ProfileDialog() {
    return (
        <div className="profile-dialog">
            <div className="profile-dialog-content">
                <ProfileHeaderSection />
                <div className="profile-dialog-sections">
                    <BasicInfoSection />
                    <ContactInfoSection />
                    <AchievementsSection />
                    <HomeroomClassSection />
                    <LinkedStudentsSection />
                    <RoleDescriptionSection />
                </div>
                <ProfileActionsSection />
            </div>
        </div>
    );
}

