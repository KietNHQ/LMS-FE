import "./Table.css";

export default function Table({ columns=[], data=[] }){
  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((c,i)=><th key={i}>{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((row,i)=>(
          <tr key={i}>
            {row.map((cell,j)=><td key={j}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}