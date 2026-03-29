import React from "react";
import "./createNotificationSection.css";

const CreateNotificationSection = ({
  open,
  setOpen,
  form,
  setForm,
  onSubmit,
  typeOptions = [],
}) => {
  if (!open) return null;

  return (
    <div className="create-noti-modal" onClick={() => setOpen(false)}>
      <div className="create-noti-modal-box" onClick={(e) => e.stopPropagation()}>
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
          placeholder={
            `Ví dụ: Kính gửi toàn thể giáo viên, học sinh và phụ huynh.\n\n- Thông báo nghỉ học ngày ...\n- Lịch thi học kỳ ...\n- Đề nghị các lớp thực hiện đúng quy định...`
          }
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
          {typeOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        <div className="create-noti-modal-actions">
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