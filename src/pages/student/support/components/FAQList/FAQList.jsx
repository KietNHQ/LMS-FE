import { FaQuestionCircle } from "react-icons/fa";
import FAQItem from "../FAQItem/FAQItem";
import "./FAQList.css";

export default function FAQList({ groupedFaqs, open, onToggle }) {
    return (
        <div className="support-faq">
            <div className="faq-title">
                <FaQuestionCircle className="faq-icon" />
                <h3>Câu hỏi thường gặp</h3>
            </div>

            <div className="faq-list">
                {Object.keys(groupedFaqs).map((category, cIndex) => (
                    <div key={cIndex} className="faq-category">
                        <h4>{category}</h4>

                        {groupedFaqs[category].map((faq, index) => {
                            const id = `${cIndex}-${index}`;

                            return (
                                <FAQItem
                                    key={id}
                                    id={id}
                                    faq={faq}
                                    open={open}
                                    onToggle={onToggle}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
