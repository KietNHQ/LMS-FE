import "./RecentNotifications.css";
import { FiBell } from "react-icons/fi";

export default function RecentNotifications(){

const notifications = [
{
title:"Lịch thi HK2 2024-2025",
content:"Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025.",
date:"2025-01-15"
},
{
title:"Họp phụ huynh tháng 2",
content:"Kính mời phụ huynh tham dự buổi họp định kỳ tháng 2 vào ngày 15/02/2025 lúc 9:00 sáng.",
date:"2025-01-10"
},
{
title:"Bảo trì hệ thống",
content:"Hệ thống sẽ bảo trì từ 22:00 ngày 20/01/2025 đến 6:00 ngày 21/01/2025.",
date:"2025-01-18"
}
]

return(

<div className="notifications-wrapper">

<div className="notifications-title">
<FiBell className="icon"/>
<span>Thông báo gần đây</span>
</div>

<div className="notifications-list">

{notifications.map((n,i)=>(

<div className="notification-item" key={i}>

<div className="dot"></div>

<div className="notification-content">

<h4>{n.title}</h4>

<p>{n.content}</p>

<span className="date">{n.date}</span>

</div>

</div>

))}

</div>

</div>

)

}