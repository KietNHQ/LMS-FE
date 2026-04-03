import React from "react";
import { FiPlus, FiChevronLeft, FiChevronRight, FiTag, FiFileText, FiDollarSign, FiUser, FiX } from "react-icons/fi";
import "./schoolExpenditureSection.css";

const ITEMS_PER_PAGE = 5;

export default function SchoolExpenditureSection({ expenditureData }) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const [showAddModal, setShowAddModal] = React.useState(false);
    const [newExp, setNewExp] = React.useState({
        category: "Sửa chữa",
        description: "",
        personInCharge: "",
        amount: 0
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // --- HELPERS FOR FORMATTING ---
    const formatInputNumber = (val) => {
        if (!val && val !== 0) return "";
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const parseInputNumber = (val) => {
        const cleanVal = val.toString().replace(/\./g, "");
        return Number(cleanVal) || 0;
    };

    const handleAdd = () => {
        window.alert(`Đã thêm khoản chi: ${newExp.description}`);
        setShowAddModal(false);
        setNewExp({ category: "Sửa chữa", description: "", personInCharge: "", amount: 0 });
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
                <button className="expenditure-add-btn" onClick={() => setShowAddModal(true)}>
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
            {/* Add Expenditure Modal */}
            {showAddModal && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal-card exp-modal-card">
                        <div className="modal-header exp-header">
                            <h3>Tạo khoản chi mới</h3>
                            <p>Vui lòng nhập đầy đủ thông tin để lưu vào nhật ký chi tiêu.</p>
                            <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        
                        <div className="modal-body exp-body">
                            <div className="exp-form-grid">
                                <div className="exp-form-item full-width">
                                    <label className="exp-label">
                                        <FiTag /> Hàng mục chi
                                    </label>
                                    <div className="exp-input-wrapper">
                                        <select 
                                            className="exp-select" 
                                            value={newExp.category}
                                            onChange={(e) => setNewExp({...newExp, category: e.target.value})}
                                        >
                                            <option>Sửa chữa</option>
                                            <option>Sự kiện</option>
                                            <option>Cơ sở vật chất</option>
                                            <option>Văn phòng phẩm</option>
                                            <option>Điện nước</option>
                                            <option>Công nghệ</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="exp-form-item full-width">
                                    <label className="exp-label">
                                        <FiFileText /> Mô tả chi tiết
                                    </label>
                                    <div className="exp-input-wrapper">
                                        <input 
                                            type="text" 
                                            className="exp-input"
                                            placeholder="VD: Mua mực in và giấy A4..."
                                            value={newExp.description}
                                            onChange={(e) => setNewExp({...newExp, description: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="exp-form-item">
                                    <label className="exp-label">
                                        <FiDollarSign /> Số tiền chi (VNĐ)
                                    </label>
                                    <div className="exp-input-wrapper">
                                        <input 
                                            type="text" 
                                            className="exp-input exp-amount-input"
                                            placeholder="0"
                                            value={formatInputNumber(newExp.amount)}
                                            onChange={(e) => setNewExp({...newExp, amount: parseInputNumber(e.target.value)})}
                                        />
                                        <span className="exp-currency-unit">vnđ</span>
                                    </div>
                                </div>

                                <div className="exp-form-item">
                                    <label className="exp-label">
                                        <FiUser /> Người phụ trách
                                    </label>
                                    <div className="exp-input-wrapper">
                                        <input 
                                            type="text" 
                                            className="exp-input"
                                            placeholder="Tên người chi..."
                                            value={newExp.personInCharge}
                                            onChange={(e) => setNewExp({...newExp, personInCharge: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer exp-footer">
                            <button className="exp-btn-cancel" onClick={() => setShowAddModal(false)}>Hủy bỏ</button>
                            <button className="exp-btn-submit" onClick={handleAdd}>
                                <FiPlus /> Lưu khoản chi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
