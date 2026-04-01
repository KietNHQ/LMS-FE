import React, { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import "./AdminPayment.css";

const AdminPayment = () => {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

  const tuitionData = {
    "2025-2026": {
      hk1: { "10": 5200000, "11": 5400000, "12": 5700000 },
      hk2: { "10": 5500000, "11": 5700000, "12": 6000000 },
    },
    "2024-2025": {
      hk1: { "10": 5000000, "11": 5200000, "12": 5500000 },
      hk2: { "10": 5300000, "11": 5500000, "12": 5800000 },
    },
  };

  const currentData = tuitionData[selectedSchoolYear]?.[selectedTerm] || {};

  return (
    <div className="admin-payment">
      <PageHeader title="Quản Lý Thanh Toán" subtitle="Quản lý giá tiền học kỳ" />

      <div className="admin-payment__container">
        <div className="admin-payment__filters" style={{ display: 'flex', justifyContent: 'flex-start', paddingBottom: '1rem' }}>
          <SchoolYearTermSelector
              selectedSchoolYear={selectedSchoolYear}
              selectedTerm={selectedTerm}
              onYearChange={handleYearArrow}
              onTermChange={handleTermChange}
          />
        </div>

        <div className="admin-payment__grid">
          {Object.entries(currentData).map(([grade, price]) => (
            <div key={grade} className="admin-payment__card">
              <div className="admin-payment__card-header">
                <h3>Khối {grade}</h3>
              </div>
              <div className="admin-payment__card-body">
                <div className="admin-payment__price">
                  {(price / 1000000).toFixed(1)}
                  <span>triệu</span>
                </div>
                <button className="admin-payment__btn-edit">Chỉnh Sửa</button>
              </div>
            </div>
          ))}
        </div>

        <div className="admin-payment__section">
          <h2>Lịch Sử Thay Đổi Giá</h2>
          <table className="admin-payment__table">
            <thead>
              <tr>
                <th>Năm Học</th>
                <th>Học Kỳ</th>
                <th>Khối</th>
                <th>Giá Mới</th>
                <th>Ngày Cập Nhật</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2025-2026</td>
                <td>Học Kỳ 2</td>
                <td>Khối 10</td>
                <td>5.500.000đ</td>
                <td>15/03/2026</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayment;

