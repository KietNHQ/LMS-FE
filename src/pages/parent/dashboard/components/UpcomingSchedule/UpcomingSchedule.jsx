import { useState } from "react";
import "./UpcomingSchedule.css";
import GradesSection from "../../../children-overview/components/GradesSection/GradesSection";

export default function UpcomingSchedule({ gradesBySemester }) {

const [open,setOpen] = useState(false)
const [selectedSubject,setSelectedSubject] = useState(null)

const subjects = [
"Toán học",
"Tiếng Anh",
"Vật lý",
"Văn học",
"Hóa học",
"Sinh học",
"Lịch sử",
"Tin học"
]

// mở dialog
const handleOpen = (subject)=>{
setSelectedSubject(subject)
setOpen(true)
}

const handleClose = ()=>{
setOpen(false)
}

// lọc dữ liệu theo môn
const filterGrades = (semester)=>{
return gradesBySemester?.[semester]?.filter(
g => g.subject === selectedSubject
) || []
}

const filteredGradesBySemester = {
hk1: filterGrades("hk1"),
hk2: filterGrades("hk2"),
year: filterGrades("year")
}

return(

<div className="subject-wrapper">

<div className="subject-title">
📚 Điểm theo môn học
</div>

<div className="subject-grid">

{subjects.map((name,i)=>(
<div
className="subject-card"
key={i}
onClick={()=>handleOpen(name)}
>

<div className="subject-left">
<h4>{name}</h4>
<p>Xem bảng điểm</p>
</div>

</div>
))}

</div>


{open && (

<div className="dialog-overlay">

<div className="dialog-box">

<button
className="dialog-close"
onClick={handleClose}
>
✕
</button>

<h3>Điểm môn {selectedSubject}</h3>

<GradesSection
gradesBySemester={filteredGradesBySemester}
compact
/>

</div>

</div>

)}

</div>

)

}