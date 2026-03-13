import { useState } from "react";
import "./ParentNotifications.css";
import { FiBell } from "react-icons/fi";

export default function Notification() {

  /* ===== dữ liệu phụ huynh ===== */

  const parentName = "Nguyễn Văn A";

  const children = [
    { name: "Nguyễn Văn B", class: "10A1" },
    { name: "Nguyễn Văn C", class: "11A2" }
  ];

  /* ===== lấy danh sách lớp của các con ===== */

  const studentClasses = [...new Set(children.map(c => c.class.slice(0,2)))];

  const [filter,setFilter] = useState("all");

  const [notifications,setNotifications] = useState([
    {
      id:1,
      title:"Lịch thi HK2",
      content:"Thi bắt đầu từ ngày 20/05/2025",
      date:"2025-01-15",
      unread:true,
      class:"10"
    },
    {
      id:2,
      title:"Cập nhật điểm",
      content:"Điểm học kỳ đã cập nhật",
      date:"2025-01-08",
      unread:true,
      class:"11"
    },
    {
      id:3,
      title:"Thông báo hệ thống",
      content:"Bảo trì hệ thống LMS",
      date:"2025-01-18",
      unread:true,
      class:"12"
    },
    {
      id:4,
      title:"Họp phụ huynh",
      content:"Nhà trường tổ chức họp phụ huynh",
      date:"2025-01-20",
      unread:true,
      class:"parent"
    }
  ]);

  const [selected,setSelected] = useState(null);

  const unreadCount = notifications.filter(n=>n.unread).length;

  /* ===== đánh dấu đã đọc ===== */

  const markAllRead = ()=>{

    const updated = notifications.map(n=>({
      ...n,
      unread:false
    }));

    setNotifications(updated);
  };

  /* ===== mở thông báo ===== */

  const openNotification = (item)=>{

    const updated = notifications.map(n =>
      n.id === item.id ? {...n, unread:false} : n
    );

    setNotifications(updated);
    setSelected(item);
  };

  const closeDialog = ()=>{
    setSelected(null);
  };

  /* ===== danh sách lớp hiển thị ===== */

  const classList = [...new Set(
    notifications
      .map(n => n.class)
      .filter(c => studentClasses.includes(c) || c === "parent")
  )];

  /* ===== filter notification ===== */

  const filteredNotifications = notifications.filter(n => {

    if(filter === "all"){
      return studentClasses.includes(n.class) || n.class === "parent";
    }

    return n.class === filter;

  });

  /* ===== label lớp ===== */

  const getClassLabel = (c)=>{

    if(c==="10") return "Lớp 10";
    if(c==="11") return "Lớp 11";
    if(c==="12") return "Lớp 12";
    if(c==="parent") return "Phụ huynh";

    return "";
  };

  return(

    <div className="notification-page">

      <div className="notification-container">

        <div className="notification-header">

          <div>

            <h1>Thông báo</h1>

            <div className="notification-filter">

              <button
                className={filter==="all"?"active":""}
                onClick={()=>setFilter("all")}
              >
                Tổng
              </button>

              {classList.map(c=>(
                <button
                  key={c}
                  className={filter===c?"active":""}
                  onClick={()=>setFilter(c)}
                >
                  {getClassLabel(c)}
                </button>
              ))}

            </div>

          </div>

          <div
            className="notification-bell"
            onClick={markAllRead}
          >

            <FiBell className="bell-icon"/>

            {unreadCount>0 &&(

              <span className="bell-badge">
                {unreadCount>9?"9+":unreadCount}
              </span>

            )}

          </div>

        </div>

        <div className="notification-scroll">

          {filteredNotifications.map(item=>(

            <div
              key={item.id}
              className="notification-card"
            >

              <div
                className="notification-body"
                onClick={()=>openNotification(item)}
              >

                <div className="notification-icon">
                  🔔
                </div>

                <div className="notification-content">

                  <div className="notification-title">

                    {item.title}

                    {item.unread &&(
                      <span className="unread-dot"></span>
                    )}

                    <span className="class-badge">
                      {getClassLabel(item.class)}
                    </span>

                  </div>

                  <p className="notification-text">
                    {item.content}
                  </p>

                  <div className="notification-date">
                    {item.date}
                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

      {selected &&(

        <div
          className="dialog-overlay"
          onClick={closeDialog}
        >

          <div
            className="dialog-box"
            onClick={(e)=>e.stopPropagation()}
          >

            <h2>{selected.title}</h2>

            <p className="dialog-content">
              {selected.content}
            </p>

            <div className="dialog-date">
              {selected.date}
            </div>

            <button
              className="dialog-close"
              onClick={closeDialog}
            >
              Đóng
            </button>

          </div>

        </div>

      )}

    </div>
  );
}