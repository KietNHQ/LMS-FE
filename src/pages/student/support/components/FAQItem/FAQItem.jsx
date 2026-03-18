import "./FAQItem.css";

export default function FAQItem({ faq }) {
    return (
        <article className="faq-item" tabIndex={0}>
            <div className="faq-question">
                <span>{faq.question}</span>
                <span className="faq-caret" aria-hidden="true">?</span>
            </div>
            <div className="faq-answer">{faq.answer}</div>
        </article>
    );
}
