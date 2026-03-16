import "./OverviewCards.css"
import { FiAward, FiTrendingUp, FiBell, FiCreditCard } from "react-icons/fi"

export default function OverviewCards(){

return(

<div className="cards">

<div className="card">

<div>
<p>ĐTB cả năm</p>
<h3>7.60</h3>
</div>

<div className="icon purple">
<FiAward/>
</div>

</div>


<div className="card">

<div>
<p>ĐTB HK1</p>
<h3>7.29</h3>
</div>

<div className="icon blue">
<FiTrendingUp/>
</div>

</div>


<div className="card">

<div>
<p>Thông báo</p>
<h3>2</h3>
<span>Chưa đọc</span>
</div>

<div className="icon orange">
<FiBell/>
</div>

</div>


<div className="card">

<div>
<p>Học phí chưa đóng</p>
<h3>5trđ</h3>
</div>

<div className="icon red">
<FiCreditCard/>
</div>

</div>

</div>

)

}