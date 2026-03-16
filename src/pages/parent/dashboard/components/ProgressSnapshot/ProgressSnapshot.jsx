import "./ProgressSnapshot.css"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { FiTrendingUp } from "react-icons/fi"

export default function ProgressSnapshot(){

const data=[
{name:"HK1",score:7.0},
{name:"HK2",score:8.0},
{name:"Cả năm",score:7.8}
]

return(

<div className="progress">

<div className="title">

<FiTrendingUp/>

<span>Biểu đồ tiến bộ học tập</span>

</div>

<ResponsiveContainer width="100%" height={250}>

<LineChart data={data}>

<CartesianGrid strokeDasharray="4 4"/>

<XAxis dataKey="name"/>

<YAxis domain={[0,10]}/>

<Tooltip/>

<Line
type="monotone"
dataKey="score"
stroke="#7c3aed"
strokeWidth={3}
dot={{r:6}}
/>

</LineChart>

</ResponsiveContainer>

</div>

)

}