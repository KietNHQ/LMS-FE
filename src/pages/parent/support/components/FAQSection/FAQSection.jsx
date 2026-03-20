import { useState } from "react";
import "./FAQSection.css";

import { HelpCircle, ChevronDown } from "lucide-react";

export default function FAQSection(){

  const [open,setOpen] = useState(null);

  const faqs = [
    {
      category:"Học tập",
      question:"Làm sao để nộp bài tập?",
      answer:"Bạn vào mục Bài tập và chọn nộp bài."
    },
    {
      category:"Tài chính",
      question:"Học phí được thanh toán như thế nào?",
      answer:"Bạn có thể thanh toán online hoặc tại trường."
    },
    {
      category:"Liên hệ",
      question:"Làm sao để liên hệ với giáo viên?",
      answer:"Bạn có thể nhắn tin trực tiếp cho giáo viên."
    },
    {
      category:"Điểm danh",
      question:"Điểm danh được ghi nhận khi nào?",
      answer:"Điểm danh khi học sinh tham gia lớp học."
    }
  ];

  const toggle = (index)=>{
    if(open===index){
      setOpen(null);
    }else{
      setOpen(index);
    }
  };

  return(

    <div className="parent-faq-section-container">

      <h2 className="parent-faq-section-title">

        <HelpCircle size={20} className="parent-faq-section-icon"/>

        Câu hỏi thường gặp

      </h2>

      <div className="parent-faq-section-list">

        {faqs.map((item,index)=>(

          <div key={index} className="parent-faq-section-item">

            <p className="parent-faq-section-category">
              {item.category}
            </p>

            <div
              className="parent-faq-section-question"
              onClick={()=>toggle(index)}
            >

              {item.question}

              <ChevronDown size={18}/>

            </div>

            {open===index && (

              <div className="parent-faq-section-answer">
                {item.answer}
              </div>

            )}

          </div>

        ))}

      </div>

    </div>

  );

}