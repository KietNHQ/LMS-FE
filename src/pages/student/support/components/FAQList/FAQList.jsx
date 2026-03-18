import { FaQuestionCircle } from "react-icons/fa";
import FAQItem from "../FAQItem/FAQItem";
import "./FAQList.css";

export default function FAQList({ groupedFaqs, keyword, onKeywordChange }) {
    const categories = Object.keys(groupedFaqs);

    return (
        <div className="support-faq">
            <div className="faq-header">
                <div className="faq-title">
                    <FaQuestionCircle className="faq-icon" />
                    <h3>Câu hỏi thường gặp</h3>
                </div>

                <label className="faq-search" htmlFor="faq-search-input">
                    <input
                        id="faq-search-input"
                        type="text"
                        value={keyword}
                        onChange={(event) => onKeywordChange(event.target.value)}
                        placeholder="Tìm câu hỏi..."
                    />
                </label>
            </div>

            <div className="faq-list">
                {categories.map((category, cIndex) => (
                    <section key={cIndex} className="faq-category">
                        <h4>{category}</h4>

                        {groupedFaqs[category].map((faq, index) => (
                            <FAQItem key={`${cIndex}-${index}`} faq={faq} />
                        ))}
                    </section>
                ))}

                {categories.length === 0 && (
                    <div className="faq-empty">
                        Không tìm thấy câu hỏi phù hợp. Hãy thử từ khóa khác hoặc liên hệ bộ phận hỗ trợ.
                    </div>
                )}
            </div>
        </div>
    );
}
