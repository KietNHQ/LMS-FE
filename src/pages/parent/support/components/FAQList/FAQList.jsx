import { FaQuestionCircle } from "react-icons/fa";
import FAQItem from "../FAQItem/FAQItem";
import "./FAQList.css";

export default function FAQList({ groupedFaqs, keyword, onKeywordChange }) {
  const categories = Object.keys(groupedFaqs);

  return (
    <div className="parent-support-faq">
      <div className="parent-faq-header">
        <div className="parent-faq-title">
          <FaQuestionCircle className="parent-faq-icon" />
          <h3>Câu hỏi thường gặp</h3>
        </div>

        <label className="parent-faq-search" htmlFor="parent-faq-search-input">
          <input
            id="parent-faq-search-input"
            type="text"
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="Tìm câu hỏi..."
          />
        </label>
      </div>

      <div className="parent-faq-list">
        {categories.map((category, categoryIndex) => (
          <section key={categoryIndex} className="parent-faq-category">
            <h4>{category}</h4>

            {groupedFaqs[category].map((faq, faqIndex) => (
              <FAQItem key={`${categoryIndex}-${faqIndex}`} faq={faq} />
            ))}
          </section>
        ))}

        {categories.length === 0 && (
          <div className="parent-faq-empty">
            Không tìm thấy câu hỏi phù hợp. Hãy thử từ khóa khác hoặc liên hệ bộ phận hỗ trợ.
          </div>
        )}
      </div>
    </div>
  );
}


