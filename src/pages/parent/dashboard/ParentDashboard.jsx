import "./ParentDashboard.css";

import ChildSwitcher from "./components/ChildSwitcher/ChildSwitcher";
import OverviewCards from "./components/OverviewCards/OverviewCards";
import PaymentSummary from "./components/PaymentSummary/PaymentSummary";
import ProgressSnapshot from "./components/ProgressSnapshot/ProgressSnapshot";
import UpcomingSchedule from "./components/UpcomingSchedule/UpcomingSchedule";
import RecentNotifications from "./components/RecentNotifications/RecentNotifications";

const gradesBySemester = {
  hk1: [
    { subject: "Toán học", oral: 8, test15: 7, midterm: 8, final: 9, average: 8.2 },
    { subject: "Tiếng Anh", oral: 7, test15: 8, midterm: 7, final: 8, average: 7.5 },
    { subject: "Vật lý", oral: 9, test15: 8, midterm: 8, final: 9, average: 8.5 },
    { subject: "Văn học", oral: 7, test15: 6, midterm: 7, final: 7, average: 6.8 },
    { subject: "Hóa học", oral: 8, test15: 7, midterm: 8, final: 8, average: 7.8 },
    { subject: "Sinh học", oral: 9, test15: 8, midterm: 9, final: 9, average: 8.8 },
    { subject: "Lịch sử", oral: 7, test15: 7, midterm: 6, final: 7, average: 6.8 },
    { subject: "Tin học", oral: 10, test15: 9, midterm: 9, final: 10, average: 9.5 }
  ],

  hk2: [
    { subject: "Toán học", oral: 9, test15: 8, midterm: 9, final: 9, average: 8.8 },
    { subject: "Tiếng Anh", oral: 8, test15: 8, midterm: 8, final: 9, average: 8.2 },
    { subject: "Vật lý", oral: 8, test15: 9, midterm: 8, final: 9, average: 8.5 },
    { subject: "Văn học", oral: 7, test15: 7, midterm: 7, final: 8, average: 7.2 },
    { subject: "Hóa học", oral: 8, test15: 8, midterm: 8, final: 9, average: 8.2 },
    { subject: "Sinh học", oral: 9, test15: 9, midterm: 9, final: 10, average: 9.3 },
    { subject: "Lịch sử", oral: 7, test15: 7, midterm: 7, final: 7, average: 7 },
    { subject: "Tin học", oral: 10, test15: 10, midterm: 9, final: 10, average: 9.7 }
  ],

  year: [
{ subject:"Toán học", oral:8.5, test15:8.5, midterm:8.5, final:8.5, average:8.5 },
{ subject:"Tiếng Anh", oral:7.9, test15:7.9, midterm:7.9, final:7.9, average:7.9 },
{ subject:"Vật lý", oral:8.5, test15:8.5, midterm:8.5, final:8.5, average:8.5 },
{ subject:"Văn học", oral:7, test15:7, midterm:7, final:7, average:7 },
{ subject:"Hóa học", oral:8, test15:8, midterm:8, final:8, average:8 },
{ subject:"Sinh học", oral:9, test15:9, midterm:9, final:9, average:9 },
{ subject:"Lịch sử", oral:6.9, test15:6.9, midterm:6.9, final:6.9, average:6.9 },
{ subject:"Tin học", oral:9.6, test15:9.6, midterm:9.6, final:9.6, average:9.6 }
]
}

export default function ParentDashboard(){

return(

<div className="dashboard">

<h1>Xin chào, Nguyễn Văn Phụ Huynh</h1>
<p>Theo dõi kết quả học tập của các con</p>

<ChildSwitcher/>

<PaymentSummary/>

<OverviewCards/>

<ProgressSnapshot/>

<UpcomingSchedule gradesBySemester={gradesBySemester} />

<RecentNotifications/>

</div>

)

}