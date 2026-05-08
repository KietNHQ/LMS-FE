import React from "react";
import "./SectionCard.css";

export default function SectionCard({ title, subtitle, actions = null, children }) {
  return (
    <section className="common-section-card">
      {(title || subtitle || actions) ? (
        <div className="common-section-card__header">
          <div>
            {title ? <h2>{title}</h2> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {actions ? <div className="common-section-card__actions">{actions}</div> : null}
        </div>
      ) : null}

      <div className="common-section-card__body">{children}</div>
    </section>
  );
}

