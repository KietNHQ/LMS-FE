import "./ChildSwitcher.css"
import { FiUsers } from "react-icons/fi"

export default function ChildSwitcher(){

return(

<div className="child-switcher">

<div className="child-label">
<FiUsers className="child-icon"/>
<span>Chọn con:</span>
</div>

<button className="active">
Nguyễn Minh Tuấn
</button>

<button>
Trần Thị Bảo Châu
</button>

</div>

)

}