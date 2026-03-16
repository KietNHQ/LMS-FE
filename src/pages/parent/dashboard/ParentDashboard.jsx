import "./ParentDashboard.css";

import ChildSwitcher from "./components/ChildSwitcher/ChildSwitcher";
import OverviewCards from "./components/OverviewCards/OverviewCards";
import PaymentSummary from "./components/PaymentSummary/PaymentSummary";
import ProgressSnapshot from "./components/ProgressSnapshot/ProgressSnapshot";
import UpcomingSchedule from "./components/UpcomingSchedule/UpcomingSchedule";
import RecentNotifications from "./components/RecentNotifications/RecentNotifications";

export default function ParentDashboard(){

return(

<div className="dashboard">

<h1>Xin chào, Nguyễn Văn Phụ Huynh! 👨‍👧</h1>
<p>Theo dõi kết quả học tập của các con</p>

<ChildSwitcher/>

<PaymentSummary/>

<OverviewCards/>

<ProgressSnapshot/>

<UpcomingSchedule  />

<RecentNotifications/>

</div>

)

}