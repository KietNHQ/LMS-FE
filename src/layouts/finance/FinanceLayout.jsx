import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import "./FinanceLayout.css";

export default function FinanceLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`finance-layout theme-finance_staff ${isCollapsed ? "collapsed" : ""}`}>
            <Sidebar
                role="finance_staff"
                userName="Kế Toán"
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />
            <main className="finance-layout__main">
                <div className="finance-layout__content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
