import React from "react";
import "./createNotificationSection.css";

const CreateNotificationSection = ({
  open,
  setOpen,
  form,
  setForm,
  onSubmit,
}) => {
  if (!open) return null;

  return (
    <div className="admin-modal">
      <div className="admin-modal-box">
        <h3>Gửi thông báo mới</h3>

        <label>Tiêu đề</label>
        <input
          placeholder="Tiêu đề thông báo..."
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <label>Nội dung</label>
        <textarea
          placeholder="Nội dung thông báo..."
          value={form.content}
          onChange={(e) =>
            setForm({ ...form, content: e.target.value })
          }
        />

        <label>Gửi đến</label>
        <select
          value={form.type}
          onChange={(e) =>
            setForm({ ...form, type: e.target.value })
          }
        >
          <option>Tất cả</option>
          <option>Giáo viên</option>
          <option>Học sinh</option>
          <option>Phụ huynh</option>
        </select>

        <div className="admin-modal-actions">
          <button className="cancel" onClick={() => setOpen(false)}>
            Hủy
          </button>

          <button className="submit" onClick={onSubmit}>
            Gửi thông báo
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateNotificationSection;