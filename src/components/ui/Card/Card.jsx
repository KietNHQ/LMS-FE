import "./Card.css";

export default function Card({
  title,
  subtitle,
  actions = null,
  children,
  className = "",
  bodyClassName = "",
}) {
  return (
    <section className={`ui-card ${className}`.trim()}>
      {title || subtitle || actions ? (
        <header className="ui-card__header">
          <div className="ui-card__title-wrap">
            {title ? <h3 className="ui-card__title">{title}</h3> : null}
            {subtitle ? <p className="ui-card__subtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div className="ui-card__actions">{actions}</div> : null}
        </header>
      ) : null}

      <div className={`ui-card__body ${bodyClassName}`.trim()}>{children}</div>
    </section>
  );
}
