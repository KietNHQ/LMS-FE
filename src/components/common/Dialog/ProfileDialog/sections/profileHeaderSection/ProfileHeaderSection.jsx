import React from "react";
import "./ProfileHeaderSection.css";

export default function ProfileHeaderSection({ name, roleLabel, role = "student" }) {
    const avatarLetter = (name || "U").trim().charAt(0).toUpperCase();

    return (
        <div className={`profile-header-section role-${role}`}>
            <div className="profile-avatar">{avatarLetter}</div>
            <div>
                <h2>{name}</h2>
                <p>{roleLabel}</p>
            </div>
        </div>
    );
}

