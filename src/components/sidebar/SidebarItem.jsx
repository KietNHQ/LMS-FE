import { NavLink } from "react-router-dom";
import "./SidebarItem.css";

export default function SidebarItem({ item }) {

  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      className={({isActive}) =>
        isActive ? "sidebar-item active" : "sidebar-item"
      }
    >

      <Icon size={18} />

      <span>{item.name}</span>

    </NavLink>
  );
}