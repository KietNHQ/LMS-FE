import "./FAQItem.css";

export default function FAQItem({ faq }) {
  return (
    <article className="parent-faq-item" tabIndex={0}>
      <div className="parent-faq-question">
        <span>{faq.question}</span>
        <span className="parent-faq-caret" aria-hidden="true">?</span>
      </div>

      <div className="parent-faq-answer">{faq.answer}</div>
    </article>
  );
}

