import "./FAQItem.css";

export default function FAQItem({ faq }) {
  return (
    <article className="student-faq-item" tabIndex={0}>
      <div className="student-faq-question">
        <span>{faq.question}</span>
        <span className="student-faq-caret" aria-hidden="true">?</span>
      </div>

      <div className="student-faq-answer">{faq.answer}</div>
    </article>
  );
}


