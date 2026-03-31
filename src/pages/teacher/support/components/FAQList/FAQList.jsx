import { FaQuestionCircle } from "react-icons/fa";
import FAQItem from "../FAQItem/FAQItem";
import "./FAQList.css";

export default function FAQList({ groupedFaqs, keyword, onKeywordChange }) {
  const categories = Object.keys(groupedFaqs);

  return (
    <div className="teacher-support-faq">
      <div className="teacher-faq-header">
        <div className="teacher-faq-title">
          <FaQuestionCircle className="teacher-faq-icon" />
          <h3>Câu hỏi thường gặp</h3>
        </div>

        <label className="teacher-faq-search" htmlFor="teacher-faq-search-input">
          <input
            id="teacher-faq-search-input"
            type="text"
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="Tìm câu hỏi..."
          />
        </label>
      </div>

      <div className="teacher-faq-list">
        {categories.map((category, categoryIndex) => (
          <section key={categoryIndex} className="teacher-faq-category">
            <h4>{category}</h4>

            {groupedFaqs[category].map((faq, faqIndex) => (
              <FAQItem key={`${categoryIndex}-${faqIndex}`} faq={faq} />
            ))}
          </section>
        ))}

        {categories.length === 0 && (
          <div className="teacher-faq-empty">
            Không tìm thấy câu hỏi phù hợp. Hãy thử từ khóa khác hoặc liên hệ bộ phận hỗ trợ.
          </div>
        )}
      </div>
    </div>
  );
}

