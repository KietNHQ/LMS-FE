import React from "react";
import { FiPlus, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./schoolExpenditureSection.css";

const ITEMS_PER_PAGE = 5;

export default function SchoolExpenditureSection({ expenditureData }) {
    const [currentPage, setCurrentPage] = React.useState(1);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const totalSpent = expenditureData?.reduce((sum, item) => sum + item.amount, 0) || 0;
    
    // Pagination calculation
    const totalItems = expenditureData?.length || 0;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentExpenditures = expenditureData?.slice(startIndex, startIndex + ITEMS_PER_PAGE) || [];

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <section className="expenditure-section">
            <div className="expenditure-header">
                <div className="expenditure-summary">
                    <h3>Quản lý Chi Tiêu Nhà Trường</h3>
                    <div className="expenditure-total">
                        Tổng mức chi: <span className="text-danger fw-700">{formatCurrency(totalSpent)}</span>
                    </div>
                </div>
                <button className="expenditure-add-btn">
                    <FiPlus /> Tạo khoản chi mới
                </button>
            </div>

            <div className="expenditure-table-wrap">
                <table className="expenditure-table">
                    <thead>
                        <tr>
                            <th>Mã GD</th>
                            <th>Hạng mục chi</th>
                            <th>Mô tả chi tiết</th>
                            <th>Ngày chi</th>
                            <th>Người phụ trách</th>
                            <th>Số tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(!expenditureData || expenditureData.length === 0) ? (
                            <tr>
                                <td colSpan="6" className="text-center text-gray" style={{padding: '2rem'}}>
                                    Không có khoản chi nào trong học kỳ này.
                                </td>
                            </tr>
                        ) : (
                            currentExpenditures.map((item) => (
                                <tr key={item.id}>
                                    <td className="fw-600 text-gray">{item.id}</td>
                                    <td className="fw-600">{item.category}</td>
                                    <td>{item.description}</td>
                                    <td>{item.date}</td>
                                    <td>{item.personInCharge}</td>
                                    <td className="fw-700 text-danger">{formatCurrency(item.amount)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="payment-pagination-row">
                    <div className="payment-pagination">
                        <button 
                            className="payment-page-btn" 
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            <FiChevronLeft />
                        </button>
                        <div className="payment-page-indicator">
                            <span>{currentPage}</span>
                            <small>/ {totalPages}</small>
                        </div>
                        <button 
                            className="payment-page-btn" 
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
