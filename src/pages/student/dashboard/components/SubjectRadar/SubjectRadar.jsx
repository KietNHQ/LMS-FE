import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
} from "recharts";

export default function SubjectRadar({ data }) {
    return (
        <div className="student-dashboard-card student-dashboard-card-equal student-dashboard-card-radar">
            <h3>Điểm theo môn học</h3>

            <div className="student-radar-wrap">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                        <Radar
                            dataKey="score"
                            stroke="#7ea1ff"
                            fill="#7ea1ff"
                            fillOpacity={0.35}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

