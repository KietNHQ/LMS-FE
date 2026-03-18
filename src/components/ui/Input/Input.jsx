import "./Input.css";

export default function Input({
  label,
  hint,
  error,
  type = "text",
  id,
  className = "",
  inputClassName = "",
  ...props
}) {
  const inputId = id || props.name;

  return (
    <div className={`ui-input ${className}`.trim()}>
      {label ? (
        <label className="ui-input__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        type={type}
        className={`ui-input__field ${error ? "is-error" : ""} ${inputClassName}`.trim()}
        {...props}
      />

      {error ? <p className="ui-input__meta is-error">{error}</p> : null}
      {!error && hint ? <p className="ui-input__meta">{hint}</p> : null}
    </div>
  );
}