import "./ParentSupport.css";
import FAQSection from "./components/FAQSection/FAQSection";
import SupportContact from "./components/SupportContact/SupportContact";
import SupportForm from "./components/SupportForm/SupportForm";
import SupportHeader from "./components/SupportHeader/SupportHeader";

export default function ParentSupport() {
  return (
    <div className="parent-support-page">
      <SupportHeader
        faqCount={4}
        chatStatus="Hoạt động"
      />

      <div className="parent-support-container">
        <FAQSection />
        <SupportForm />
      </div>

      <footer className="parent-support-footer">
        <SupportContact />
      </footer>
    </div>
  );
}