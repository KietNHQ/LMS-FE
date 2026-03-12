import React from "react";
import CreateRequestSection from "./components/createRequestSection/CreateRequestSection";
import RequestListSection from "./components/requestListSection/RequestListSection";
import RequestStatusSection from "./components/requestStatusSection/RequestStatusSection";
import "./TeacherRequest.css";

export default function TeacherRequest() {
    return (
        <div className="teacher-request">
            <h1>Yêu cầu</h1>
            <CreateRequestSection />
            <RequestStatusSection />
            <RequestListSection />
        </div>
    );
}

