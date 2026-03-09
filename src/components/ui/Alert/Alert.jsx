import "./Alert.css";

export default function Alert({ type="info", message }){
  return <div className={`alert alert-${type}`}>{message}</div>
}