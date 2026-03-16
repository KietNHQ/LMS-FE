import "./UpcomingSchedule.css";

export default function UpcomingSchedule(){

const subjects = [
{ name:"Toán", hk1:8.0, hk2:9.0, avg:8.7, level:"Tốt"},
{ name:"Hóa học", hk1:6.5, hk2:7.0, avg:6.8, level:"Khá"},
{ name:"Tiếng Anh", hk1:8.5, hk2:9.5, avg:9.2, level:"Tốt"},
{ name:"Vật lý", hk1:6.8, hk2:7.2, avg:7.1, level:"Khá"},
{ name:"Vật lý", hk1:7.5, hk2:8.0, avg:7.8, level:"Khá"},
{ name:"Ngữ văn", hk1:7.0, hk2:6.5, avg:6.7, level:"Khá"},
{ name:"Toán", hk1:7.3, hk2:7.8, avg:7.6, level:"Khá"},
{ name:"Toán", hk1:6.7, hk2:7.0, avg:6.9, level:"Khá"}
]

return(

<div className="subject-wrapper">

<div className="subject-title">
📚 Điểm theo môn học
</div>

<div className="subject-grid">

{subjects.map((s,i)=>(
<div className="subject-card" key={i}>

<div className="subject-left">
<h4>{s.name}</h4>
<p>HK1: {s.hk1} • HK2: {s.hk2}</p>
</div>

<div className="subject-right">
<div className="score">{s.avg}</div>
<span className={s.level==="Tốt" ? "badge good" : "badge normal"}>
{s.level}
</span>
</div>

</div>
))}

</div>

</div>

)

}