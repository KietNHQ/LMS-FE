import "./Select.css";

export default function Select({ options=[], ...props }){
  return (
    <select className="select" {...props}>
      {options.map((o,i)=>(
        <option key={i} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}