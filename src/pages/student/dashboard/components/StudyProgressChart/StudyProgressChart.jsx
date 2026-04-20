import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

export default function StudyProgressChart({ data }) {
	return (
		<div className="student-dashboard-card student-dashboard-card-equal">
			<h3>Tiến độ học tập theo học kỳ</h3>

			<div className="student-semester-chart-wrap">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={data} margin={{ top: 24, right: 28, left: 20, bottom: 18 }}>
						<XAxis dataKey="name" />
						<YAxis domain={[0, 10]} ticks={[5, 8, 10]} allowDecimals={false} />
						<Tooltip formatter={(value) => [`${value}`, "Điểm"]} />
						<Line
							type="monotone"
							dataKey="score"
							stroke="#7ea1ff"
							strokeWidth={3}
							dot={{ r: 5 }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}

