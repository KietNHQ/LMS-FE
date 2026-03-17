import "./FAQItem.css";

export default function FAQItem({ id, faq, open, onToggle }) {
    return (
        <div className="faq-item" onClick={() => onToggle(id)}>
            <div className="faq-question">
                {faq.question}
                <span>{open === id ? "▲" : "▼"}</span>
            </div>

            {open === id && <div className="faq-answer">{faq.answer}</div>}
        </div>
    );
}
