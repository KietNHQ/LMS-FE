import React from "react";
import NotificationsListSection from "./components/notificationsListSection/NotificationsListSection";
import ClassAnnouncementSection from "./components/classAnnouncementSection/ClassAnnouncementSection";
import AttachmentPreviewSection from "./components/attachmentPreviewSection/AttachmentPreviewSection";
import "./TeacherNotifications.css";

export default function TeacherNotifications() {
    return (
        <div className="teacher-notifications">
            <h1>Thông báo</h1>
            <ClassAnnouncementSection />
            <AttachmentPreviewSection />
            <NotificationsListSection />
        </div>
    );
}

