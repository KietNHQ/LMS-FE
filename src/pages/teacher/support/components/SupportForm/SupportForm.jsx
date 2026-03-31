import { useState } from "react";
import "./SupportForm.css";

import { Bot, Send } from "lucide-react";

export default function SupportForm(){

  const [message,setMessage] = useState("");

  const [chat,setChat] = useState([
    {
      sender:"bot",
      text:"Xin chào! Tôi là trợ lý LMS. Bạn cần hỗ trợ gì?",
      time:"14:48"
    }
  ]);

  const sendMessage=()=>{

    if(message.trim()==="") return;

    setChat([
      ...chat,
      {
        sender:"user",
        text:message,
        time:"now"
      }
    ]);

    setMessage("");

  };

  return(

    <div className="teacher-support-form-container">

      <div className="teacher-support-form-header">

        <Bot size={18}/>

        Trợ lý LMS

      </div>

      <div className="teacher-support-form-body">

        {chat.map((msg,index)=>(

          <div
            key={index}
            className={`teacher-support-form-message ${msg.sender}`}
          >

            <p>{msg.text}</p>

            <span>{msg.time}</span>

          </div>

        ))}

      </div>

      <div className="teacher-support-form-input">

        <input
          placeholder="Nhập câu hỏi..."
          value={message}
          onChange={(e)=>setMessage(e.target.value)}
        />

        <button onClick={sendMessage}>
          <Send size={18}/>
        </button>

      </div>

    </div>

  );

}