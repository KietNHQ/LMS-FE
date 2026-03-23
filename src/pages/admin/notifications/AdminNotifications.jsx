import React, { useState } from "react";
import "./AdminNotifications.css";
import NotificationHistorySection from "./components/notificationHistorySection/notificationHistorySection";
import CreateNotificationSection from "./components/createNotificationSection/createNotificationSection";

const FILTERS = ["Tất cả", "Lớp 10", "Lớp 11", "Lớp 12", "Phụ huynh"];

const AdminNotifications = () => {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);

  // 🔥 FILTER STATE
  const [activeFilter, setActiveFilter] = useState("Tất cả");

  const [list, setList] = useState([
    {
      id: 1,
      title: "Lịch thi HK2 2024-2025",
      content: "Nhà trường thông báo lịch thi học kỳ 2...",
      type: "Lớp 10",
      date: "2025-01-15",
      read: false,
    },
    {
      id: 2,
      title: "Họp phụ huynh tháng 2",
      content: "Kính mời phụ huynh...",
      type: "Phụ huynh",
      date: "2025-01-10",
      read: false,
    },
  ]);

  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "Tất cả",
  });

  const handleAdd = () => {
    if (!form.title || !form.content) return;

    setList([
      {
        id: Date.now(),
        ...form,
        date: new Date().toISOString().slice(0, 10),
        read: false,
      },
      ...list,
    ]);

    setOpen(false);
    setForm({ title: "", content: "", type: "Tất cả" });
  };

  const handleDelete = (id) => {
    setList(list.filter((i) => i.id !== id));
  };

  const handleOpenDetail = (item) => {
    setDetail(item);

    setList((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, read: true } : i
      )
    );
  };

  // 🔥 FILTER LOGIC
  const filteredList =
    activeFilter === "Tất cả"
      ? list
      : list.filter((item) => item.type === activeFilter);

  return (
    <div className="admin-wrapper">
      <div className="admin-header">
        <div>
          <h2>Trung tâm Thông báo</h2>
          <p>{list.length} thông báo đã gửi</p>
        </div>

        <button className="admin-btn-add" onClick={() => setOpen(true)}>
          + Gửi thông báo
        </button>
      </div>

      {/* 🔥 FILTER UI */}
      <div className="admin-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-btn ${
              activeFilter === f ? "active" : ""
            }`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* LIST */}
      <NotificationHistorySection
        list={filteredList}
        onDelete={handleDelete}
        onClickItem={handleOpenDetail}
      />

      <CreateNotificationSection
        open={open}
        setOpen={setOpen}
        form={form}
        setForm={setForm}
        onSubmit={handleAdd}
      />

      {/* DETAIL MODAL */}
      {detail && (
        <div className="admin-modal" onClick={() => setDetail(null)}>
          <div
            className="admin-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="admin-close"
              onClick={() => setDetail(null)}
            >
              ×
            </button>

            <h3>{detail.title}</h3>
            <p>{detail.content}</p>
            <span>{detail.date}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;