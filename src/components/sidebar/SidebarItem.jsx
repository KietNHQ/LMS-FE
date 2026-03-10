import React from "react";
import { NavLink } from "react-router-dom";
import "./SidebarItem.css";

export default function SidebarItem({ item }) {
  const Icon = item?.icon;

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
    >
      <span className="sidebar-item-icon">{Icon ? <Icon /> : null}</span>
      <span className="sidebar-item-label">{item.label}</span>
    </NavLink>
  );
}