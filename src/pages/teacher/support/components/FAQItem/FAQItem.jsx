import "./FAQItem.css";

export default function FAQItem({ faq }) {
  return (
    <article className="teacher-faq-item" tabIndex={0}>
      <div className="teacher-faq-question">
        <span>{faq.question}</span>
        <span className="teacher-faq-caret" aria-hidden="true">?</span>
      </div>

      <div className="teacher-faq-answer">{faq.answer}</div>
    </article>
  );
}


