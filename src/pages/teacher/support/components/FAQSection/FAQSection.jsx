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

    <div className="teacher-faq-section-container">

      <h2 className="teacher-faq-section-title">

        <HelpCircle size={20} className="teacher-faq-section-icon"/>

        Câu hỏi thường gặp

      </h2>

      <div className="teacher-faq-section-list">

        {faqs.map((item,index)=>(

          <div key={index} className="teacher-faq-section-item">

            <p className="teacher-faq-section-category">
              {item.category}
            </p>

            <div
              className="teacher-faq-section-question"
              onClick={()=>toggle(index)}
            >

              {item.question}

              <ChevronDown size={18}/>

            </div>

            {open===index && (

              <div className="teacher-faq-section-answer">
                {item.answer}
              </div>

            )}

          </div>

        ))}

      </div>

    </div>

  );

}