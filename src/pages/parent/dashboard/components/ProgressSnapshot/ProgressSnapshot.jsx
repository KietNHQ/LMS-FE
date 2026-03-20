import "./ProgressSnapshot.css"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { FiTrendingUp } from "react-icons/fi"

export default function ProgressSnapshot({ chartData }) {

  return(

    <div className="progress">

      <div className="title">
        <FiTrendingUp/>
        <span>Biểu đồ tiến bộ học tập</span>
      </div>

      <ResponsiveContainer width="100%" height={250}>

        {/* ✅ dùng data từ props */}
        <LineChart data={chartData}>

          <CartesianGrid strokeDasharray="4 4"/>

          <XAxis dataKey="name"/>

          <YAxis domain={[0,10]}/>

          <Tooltip/>

          <Line
            type="monotone"
            dataKey="value"
            stroke="#7c3aed"
            strokeWidth={3}
            dot={{r:6}}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  )

}