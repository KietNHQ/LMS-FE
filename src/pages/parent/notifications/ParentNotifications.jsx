import { useState } from "react";
import "./ParentNotifications.css";
import { FiBell } from "react-icons/fi";

import NotificationFilter from "./components/NotificationFilter/NotificationFilter";
import NotificationList from "./components/NotificationList/NotificationList";

export default function Notification() {


  const children = [
    { name: "Nguyễn Văn B", class: "10A1" },
    { name: "Nguyễn Văn C", class: "11A2" }
  ];

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

  const markAllRead = ()=>{
    const updated = notifications.map(n=>({
      ...n,
      unread:false
    }));
    setNotifications(updated);
  };

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

  const classList = [...new Set(
      notifications
          .map(n => n.class)
          .filter(c => studentClasses.includes(c) || c === "parent" || c === "12")
  )];

  const filteredNotifications = notifications.filter(n => {

    if(filter === "all"){
      return studentClasses.includes(n.class) || n.class === "parent" || n.class === "12";
    }

    return n.class === filter;

  });

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

          <div className="notification-header-left">

            <h1>Thông báo</h1>

            <NotificationFilter
                filter={filter}
                setFilter={setFilter}
                classList={classList}
                getClassLabel={getClassLabel}
            />

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

        <NotificationList
          notifications={filteredNotifications}
          openNotification={openNotification}
          getClassLabel={getClassLabel}
        />

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