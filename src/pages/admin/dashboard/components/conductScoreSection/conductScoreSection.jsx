import "./conductScoreSection.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const ConductScoreSection = ({
  selectedClass,
  setSelectedClass,
  selectedWeek,
  setSelectedWeek,
  classLabels,
  classScores,
}) => {
  const chartData = classLabels.map((label, i) => ({
    class: label,
    score: classScores[i],
  }));

  return (
    <div className="admin-dashboard__card admin-dashboard__card--big admin-dashboard__conduct-section">
      <div className="admin-dashboard__card-header">
        <h3>Điểm Rèn Luyện Theo Lớp</h3>
        <div className="admin-dashboard__filter-group">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="admin-dashboard__select"
          >
            <option value="10">Khối 10</option>
            <option value="11">Khối 11</option>
            <option value="12">Khối 12</option>
            <option value="all">Tất cả khối</option>
          </select>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="admin-dashboard__select"
          >
            <option value="1">Tuần 1</option>
            <option value="2">Tuần 2</option>
            <option value="3">Tuần 3</option>
          </select>
        </div>
      </div>

      <div className="admin-dashboard__conduct-chart-wrap">
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="class" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Bar dataKey="score" fill="#60a5fa" radius={[6, 6, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ConductScoreSection;

