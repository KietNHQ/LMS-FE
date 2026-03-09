import React from "react";
import "./PageHeader.css";

export default function PageHeader({
  title,
  description,
  actions = null,
  eyebrow = null,
  breadcrumbs = [],
}) {
  return (
    <div className="common-page-header">
      <div className="common-page-header__main">
        {eyebrow ? <span className="common-page-header__eyebrow">{eyebrow}</span> : null}

        {breadcrumbs.length > 0 ? (
          <div className="common-page-header__breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={`${item}-${index}`}>
                <span>{item}</span>
                {index < breadcrumbs.length - 1 ? <span>/</span> : null}
              </React.Fragment>
            ))}
          </div>
        ) : null}

        <div>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
      </div>

      {actions ? <div className="common-page-header__actions">{actions}</div> : null}
    </div>
  );
}
