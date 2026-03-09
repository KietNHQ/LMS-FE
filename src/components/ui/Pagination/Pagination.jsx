import "./Pagination.css";

export default function Pagination({ page, total, onChange }) {
  const pages = Array.from({length: total}, (_,i)=>i+1);
  return (
    <div className="pagination">
      {pages.map(p=>(
        <button key={p} onClick={()=>onChange(p)} className={p===page?"active":""}>
          {p}
        </button>
      ))}
    </div>
  );
}