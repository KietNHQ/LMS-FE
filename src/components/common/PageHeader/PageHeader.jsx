import React from "react";
import { Link } from "react-router-dom";
import "./PageHeader.css";

export default function PageHeader({
  title,
  description,
  actions = null,
  actionRight = null,
  eyebrow = null,
  breadcrumbs = [],
}) {
  return (
    <div className="common-page-header">
      <div className="common-page-header__left">
        {eyebrow ? <span className="common-page-header__eyebrow">{eyebrow}</span> : null}

        {breadcrumbs.length > 0 ? (
          <div className="common-page-header__breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              const label = typeof item === "object" ? item.label : item;
              const path = typeof item === "object" ? item.path : null;

              return (
                <React.Fragment key={`${label}-${index}`}>
                  {path && !isLast ? (
                    <Link to={path} className="breadcrumb-link">{label}</Link>
                  ) : (
                    <span>{label}</span>
                  )}
                  {!isLast ? <span className="breadcrumb-separator">/</span> : null}
                </React.Fragment>
              );
            })}
          </div>
        ) : null}

        <div className="common-page-header__title-container">
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
      </div>

      <div className="common-page-header__right">
        {actions ? <div className="common-page-header__actions">{actions}</div> : null}
        {actionRight ? <div className="common-page-header__action-right">{actionRight}</div> : null}
      </div>
    </div>
  );
}

