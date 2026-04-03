import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import "./createNotificationSection.css";


const CreateNotificationSection = ({
  open,
  setOpen,
  form,
  setForm,
  onSubmit,
  typeOptions = [],
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getRoleClass = (type) => {
    if (!type) return "all";
    const t = type.toLowerCase();
    if (t === "tất cả") return "all";
    if (t === "giáo viên") return "teacher";
    if (t.includes("phụ huynh")) return "parent";
    if (t.includes("lớp") || t.includes("khối")) return "student";
    return "all";
  };

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

        <label>Gửi đến</label>
        <div className="custom-dropdown" onClick={() => setShowDropdown(!showDropdown)}>
          <div className="selected-value">
            <div className="selected-label">
              <span className={`role-dot ${getRoleClass(form.type)}`} />
              {form.type}
            </div>
            <FiChevronDown className={showDropdown ? "rotate" : ""} />
          </div>
          {showDropdown && (
            <div className="dropdown-options">
              {typeOptions.map((option) => (
                <div 
                  key={option} 
                  className={`option-item ${form.type === option ? "active" : ""}`}
                  onClick={() => {
                    setForm({ ...form, type: option });
                    setShowDropdown(false);
                  }}
                >
                  <span className={`role-dot ${getRoleClass(option)}`} />
                  {option}
                </div>
              ))}
            </div>
          )}

        </div>

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