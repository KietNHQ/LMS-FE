import React, { useState } from "react";
import "./academicReportSection.css";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const AcademicReportSection = () => {
  const [selectedClass, setSelectedClass] = useState("10A1");
  const [mode, setMode] = useState("ALL");

 const data = {
  "10A1": [
    { name: "Nguyễn Văn An", hk1: 6.5, hk2: 3.8 },
    { name: "Trần Thị Bình", hk1: 8.2, hk2: 7.0 },
    { name: "Lê Minh Châu", hk1: 3.1, hk2: 3.2 },
    { name: "Phạm Quốc Dũng", hk1: 5.0, hk2: 6.5 },
    { name: "Hoàng Thu Hà", hk1: 8.8, hk2: 9.0 },
    { name: "Đỗ Anh Huy", hk1: 6.2, hk2: 5.5 },
    { name: "Vũ Khánh Linh", hk1: 7.5, hk2: 7.6 },
    { name: "Phạm Thanh Tùng", hk1: 8.3, hk2: 8.4 },
    { name: "Đỗ Minh Hoàng", hk1: 5.2, hk2: 6.0 },
    { name: "Nguyễn Hải Đăng", hk1: 7.0, hk2: 7.1 },
    { name: "Trần Văn Phong", hk1: 6.6, hk2: 5.8 },
    { name: "Lê Hữu Nghĩa", hk1: 8.7, hk2: 9.1 },
    { name: "Phạm Ngọc Long", hk1: 5.5, hk2: 5.6 }
  ],

  "10A2": [
    { name: "Nguyễn Văn Hùng", hk1: 6.0, hk2: 7.2 },
    { name: "Trần Thị Lan", hk1: 8.5, hk2: 7.3 },
    { name: "Lê Minh Đức", hk1: 7.3, hk2: 7.4 },
    { name: "Phạm Quốc Bảo", hk1: 5.1, hk2: 6.2 },
    { name: "Hoàng Thu Trang", hk1: 9.0, hk2: 9.3 },
    { name: "Đỗ Anh Tuấn", hk1: 2.4, hk2: 3.6 },
    { name: "Vũ Khánh Vy", hk1: 7.7, hk2: 7.8 },
    { name: "Lê Quốc Huy", hk1: 7.0, hk2: 6.2 },
    { name: "Phạm Thanh Sơn", hk1: 8.4, hk2: 8.6 },
    { name: "Đỗ Minh Tuấn", hk1: 5.3, hk2: 6.1 },
    { name: "Nguyễn Hải Nam", hk1: 7.2, hk2: 7.3 },
    { name: "Trần Văn Nam", hk1: 3.7, hk2: 4.9 },
    { name: "Lê Hữu Phúc", hk1: 8.8, hk2: 9.0 },
    { name: "Phạm Ngọc Anh", hk1: 5.6, hk2: 5.7 }
  ],
  "11A1": [
    { name: "Nguyễn Văn Hùng", hk1: 6.0, hk2: 7.2 },
    { name: "Trần Thị Lan", hk1: 8.5, hk2: 7.3 },
    { name: "Lê Minh Đức", hk1: 7.3, hk2: 7.4 },
    { name: "Phạm Quốc Bảo", hk1: 2.1, hk2: 4.2 },
    { name: "Hoàng Thu Trang", hk1: 9.0, hk2: 9.3 },
    { name: "Đỗ Anh Tuấn", hk1: 6.4, hk2: 5.6 },
    { name: "Vũ Khánh Vy", hk1: 7.7, hk2: 7.8 },
    { name: "Bùi Thanh Hằng", hk1: 5.6, hk2: 6.7 },
    { name: "Ngô Đức Anh", hk1: 9.1, hk2: 8.7 },
    { name: "Phan Hoàng Long", hk1: 6.9, hk2: 7.0 },
    { name: "Trương Ngọc Ánh", hk1: 4.6, hk2: 5.4 },
    { name: "Đặng Minh Tâm", hk1: 2.8, hk2: 3.9 },
    { name: "Lý Quang Minh", hk1: 6.5, hk2: 6.6 },
    { name: "Nguyễn Thị Hoa", hk1: 8.2, hk2: 8.8 },
  
  ],
"11A2": [
    { name: "Nguyễn Văn Hùng", hk1: 6.0, hk2: 7.2 },
    { name: "Trần Thị Lan", hk1: 8.5, hk2: 7.3 },
    { name: "Lê Minh Đức", hk1: 7.3, hk2: 7.4 },
    { name: "Phạm Quốc Bảo", hk1: 5.1, hk2: 6.2 },
    { name: "Hoàng Thu Trang", hk1: 9.0, hk2: 4.3 },
    { name: "Đỗ Anh Tuấn", hk1: 3.4, hk2: 5.6 },
    { name: "Vũ Khánh Vy", hk1: 3.7, hk2: 2.8 },
    { name: "Bùi Thanh Hằng", hk1: 5.6, hk2: 6.7 },
    { name: "Ngô Đức Anh", hk1: 9.1, hk2: 8.7 },
    { name: "Phan Hoàng Long", hk1: 6.9, hk2: 7.0 },
    { name: "Trương Ngọc Ánh", hk1: 4.6, hk2: 5.4 },
    { name: "Đặng Minh Tâm", hk1: 7.8, hk2: 6.9 },
 
  ],
"12A1": [
    { name: "Nguyễn Văn Hùng", hk1: 6.0, hk2: 7.2 },
    { name: "Trần Thị Lan", hk1: 8.5, hk2: 7.3 },
    { name: "Lê Minh Đức", hk1: 7.3, hk2: 7.4 },
    { name: "Phạm Quốc Bảo", hk1: 5.1, hk2: 6.2 },
    { name: "Hoàng Thu Trang", hk1: 9.0, hk2: 9.3 },
    { name: "Đỗ Anh Tuấn", hk1: 6.4, hk2: 5.6 },
    { name: "Vũ Khánh Vy", hk1: 7.7, hk2: 7.8 },
    { name: "Bùi Thanh Hằng", hk1: 5.6, hk2: 6.7 },
    { name: "Ngô Đức Anh", hk1: 9.1, hk2: 8.7 },
    { name: "Phan Hoàng Long", hk1: 6.9, hk2: 7.0 },
    { name: "Trương Ngọc Ánh", hk1: 4.6, hk2: 5.4 },
    { name: "Đặng Minh Tâm", hk1: 7.8, hk2: 6.9 },
  
  
  ],
"12A2": [
    { name: "Nguyễn Văn Hùng", hk1: 6.0, hk2: 7.2 },
    { name: "Trần Thị Lan", hk1: 8.5, hk2: 7.3 },
    { name: "Lê Minh Đức", hk1: 7.3, hk2: 3.4 },
    { name: "Phạm Quốc Bảo", hk1: 5.1, hk2: 6.2 },
    { name: "Hoàng Thu Trang", hk1: 4.0, hk2: 9.3 },
    { name: "Đỗ Anh Tuấn", hk1: 6.4, hk2: 5.6 },
    { name: "Vũ Khánh Vy", hk1: 7.7, hk2: 7.8 },
    { name: "Bùi Thanh Hằng", hk1: 5.6, hk2: 6.7 },
    { name: "Ngô Đức Anh", hk1: 9.1, hk2: 8.7 },
    { name: "Phan Hoàng Long", hk1: 6.9, hk2: 7.0 },
    { name: "Trương Ngọc Ánh", hk1: 4.6, hk2: 5.4 },
    { name: "Đặng Minh Tâm", hk1: 7.8, hk2: 6.9 },
    { name: "Lý Quang Minh", hk1: 6.5, hk2: 6.6 },
    { name: "Nguyễn Thị Hoa", hk1: 5.2, hk2: 4.8 },
   
  ],


};

  const students = data[selectedClass];

  const calcAvg = (s) => (s.hk1 + s.hk2) / 2;

  const getRank = (avg) => {
    if (avg < 5) return "yeu";
    if (avg < 6.5) return "trungbinh";
    if (avg < 8) return "kha";
    if (avg < 9) return "gioi";
    return "xuatxac";
  };

  const rankLabel = {
    yeu: "Yếu",
    trungbinh: "Trung bình",
    kha: "Khá",
    gioi: "Giỏi",
    xuatxac: "Xuất sắc",
  };

  // 🎨 màu pastel
  const getSoftColor = (rank) => {
    const colors = {
      yeu: "#fca5a5",
      trungbinh: "#fde68a",
      kha: "#bfdbfe",
      gioi: "#86efac",
      xuatxac: "#d8b4fe",
    };
    return colors[rank];
  };

  // 👉 giá trị theo mode
  const getValue = (s) => {
    if (mode === "HK1") return s.hk1;
    if (mode === "HK2") return s.hk2;
    return calcAvg(s);
  };

  const chartData = students.map((s) => {
    const val = getValue(s);
    return {
      name: s.name,
      value: val,
      rank: getRank(val),
    };
  });

  // 👉 summary
  const summary = {
    yeu: 0,
    trungbinh: 0,
    kha: 0,
    gioi: 0,
    xuatxac: 0,
  };

  students.forEach((s) => {
    const r = getRank(calcAvg(s));
    summary[r]++;
  });

  // 👉 progress
const getProgress = (s) => {
  const diff = s.hk2 - s.hk1;

  if (diff > 0.3)
    return {
      text: "Tiến bộ",
      icon: <TrendingUp size={16} />,
      class: "up",
    };

  if (diff < -0.3)
    return {
      text: "Tụt dốc",
      icon: <TrendingDown size={16} />,
      class: "down",
    };

  return {
    text: "Cân bằng",
    icon: <Minus size={16} />,
    class: "equal",
  };
};

  return (
    <div className="academic-container">
      <h2>Thống kê Điểm số</h2>
      <h1>Phân tích kết quả học tập theo lớp</h1>

      {/* FILTER */}
      <div className="top-controls">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          {Object.keys(data).map((cls) => (
            <option key={cls}>{cls}</option>
          ))}
        </select>

        <div className="tabs">
          {["HK1", "HK2", "ALL"].map((m) => (
            <button
              key={m}
              className={mode === m ? "active" : ""}
              onClick={() => setMode(m)}
            >
              {m === "ALL" ? "Cả năm" : m}
            </button>
          ))}
        </div>
      </div>

      {/* SUMMARY */}
      <div className="summary">
        {Object.keys(summary).map((key) => (
          <div className={`card ${key}`} key={key}>
            <div className="badge">{summary[key]}</div>
            <p>{summary[key]} học sinh</p>
            <span>{rankLabel[key]}</span>
          </div>
        ))}
      </div>

      {/* CHART */}
      <div className="box">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 10]} />

            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />

            <Bar
              dataKey="value"
              barSize={28}
              radius={[10, 10, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={getSoftColor(entry.rank)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TABLE */}
      <div className="box">
        <h2>
  Biểu đồ điểm trung bình học sinh — lớp {" "}
  <span className="class-name">{selectedClass}</span>
</h2>
        <table>
          <thead>
            <tr>
              <th>Học sinh</th>
              <th>HK1</th>
              <th>HK2</th>
              <th>Cả năm</th>
              <th>Tiến độ</th>
              <th>Học lực</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s, i) => {
              const avg = calcAvg(s);
              const prog = getProgress(s);
              const rank = getRank(avg);

              return (
                <tr key={i}>
                  <td>{s.name}</td>
                  <td>{s.hk1}</td>
                  <td>{s.hk2}</td>
                  <td>{avg.toFixed(2)}</td>
                  <td className={`progress-cell ${prog.class}`}>
  {prog.icon}
  <span>{prog.text}</span>
</td>

<td>
  <span className={`rank ${rank}`}>
    {rankLabel[rank]}
  </span>
</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AcademicReportSection;