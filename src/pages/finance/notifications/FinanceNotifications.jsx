import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiSend, FiMessageCircle, FiMail, FiClock, FiUsers, FiFilter, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";

export default function FinanceNotifications() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [channel, setChannel] = useState("sms");

    const handleBroadcast = (target) => {
        toast.info(`Hệ thống đang chuẩn bị gởi thông báo ${channel.toUpperCase()} đến nhóm ${target}...`);
        setTimeout(() => toast.success(`Đã xếp hàng 125 thông báo gởi thành công!`), 1500);
    };

    return (
        <div className="fin-notif" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem'}}>
            <PageHeader
                title="Trung Tâm Truy Thông & Nhắc Nợ"
                eyebrow="Tự động hóa outreach qua SMS Brandname và Email"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="broadcast-config" style={{display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: '1.5rem'}}>
                <div className="report-panel">
                    <h4 style={{marginBottom: '1.5rem'}}><FiFilter /> Cấu hình Đối tượng</h4>
                    
                    <div className="aging-triggers" style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                        <button className="btn-secondary" style={{justifyContent: 'flex-start', textAlign: 'left', padding: '1rem'}} onClick={() => handleBroadcast('Nợ quá hạn > 60 ngày')}>
                            <div style={{color: '#dc2626', fontWeight: 600}}>Nhóm Nợ Đỏ ( &gt; 60 ngày)</div>
                            <div style={{fontSize: '0.75rem', color: '#64748b'}}>Phát 15 thông báo khẩn cấp</div>
                        </button>
                        <button className="btn-secondary" style={{justifyContent: 'flex-start', textAlign: 'left', padding: '1rem'}} onClick={() => handleBroadcast('Nợ quá hạn > 30 ngày')}>
                            <div style={{color: '#f59e0b', fontWeight: 600}}>Nhóm Nợ Cam ( 31 - 60 ngày)</div>
                            <div style={{fontSize: '0.75rem', color: '#64748b'}}>Phát 32 thông báo nhắc nợ lần 2</div>
                        </button>
                        <button className="btn-secondary" style={{justifyContent: 'flex-start', textAlign: 'left', padding: '1rem'}} onClick={() => handleBroadcast('Tất cả HS chưa đóng')}>
                            <div style={{fontWeight: 600}}>Thông báo học phí mới</div>
                            <div style={{fontSize: '0.75rem', color: '#64748b'}}>Phát 1,200 thông báo đồng loạt</div>
                        </button>
                    </div>
                </div>

                <div className="report-panel">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                        <h4 style={{margin: 0}}><FiMessageCircle /> Nội dung Thông báo</h4>
                        <div style={{display: 'flex', background: '#f1f5f9', padding: '0.3rem', borderRadius: '0.5rem', gap: '0.3rem'}}>
                            <button className={`btn-tab-mini ${channel === 'sms' ? 'active' : ''}`} onClick={() => setChannel('sms')} style={{border: 'none', padding: '0.3rem 0.6rem', borderRadius: '0.3rem', cursor: 'pointer', background: channel === 'sms' ? '#fff' : 'transparent'}}>SMS</button>
                            <button className={`btn-tab-mini ${channel === 'email' ? 'active' : ''}`} onClick={() => setChannel('email')} style={{border: 'none', padding: '0.3rem 0.6rem', borderRadius: '0.3rem', cursor: 'pointer', background: channel === 'email' ? '#fff' : 'transparent'}}>Email</button>
                        </div>
                    </div>

                    <div className="template-editor" style={{background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0'}}>
                        <div style={{marginBottom: '1rem'}}>
                            <label style={{fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase'}}>Mẫu tin nhắn</label>
                            <textarea 
                                className="rp-select" 
                                style={{width: '100%', height: '120px', marginTop: '0.5rem', padding: '1rem', background: '#fff'}}
                                defaultValue={channel === 'sms' ? "[THPT LMS] Thong bao: Hoc sinh {ten_hs} - {lop} con no hoc phi {so_tien}d. Han nop: {han_nop}. Vui long thanh toan tai {link}." : "Kính gửi Phụ huynh học sinh {ten_hs}..."}
                            />
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span style={{fontSize: '0.75rem', color: '#64748b'}}>{channel === 'sms' ? 'Số ký tự: 125/160 (1 tin nhắn)' : 'Kèm tệp đính kèm hóa đơn PDF'}</span>
                            <button className="btn-primary" onClick={() => handleBroadcast('Thao tác thủ công')}><FiSend /> Gửi Broadbast Ngay</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="report-panel" style={{marginTop: '1rem'}}>
                <h4 style={{marginBottom: '1.5rem'}}><FiClock /> Lịch sử Outreach</h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                    {[1, 2].map(i => (
                        <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #f1f5f9'}}>
                            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                                <div style={{width: '32px', height: '32px', borderRadius: '50%', background: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><FiCheckCircle /></div>
                                <div>
                                    <div style={{fontWeight: 600, fontSize: '0.9rem'}}>Thông báo Nhắc nợ lần 1 (Email)</div>
                                    <div style={{fontSize: '0.75rem', color: '#64748b'}}>Gởi lúc: 15/10/2026 08:30 • Đối tượng: Khối 10 • Thành công: 450/450</div>
                                </div>
                            </div>
                            <button className="btn-icon" style={{border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer'}}><FiMail /> Xem log</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

