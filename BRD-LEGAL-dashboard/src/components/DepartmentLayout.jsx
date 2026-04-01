import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { MessageProvider } from "../context/MessageContext";
import GlobalMessageDisplay from "./GlobalMessageDisplay";

const DepartmentLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <MessageProvider>
      <div className="flex flex-col min-h-screen">
        {/* HEADER */}
        <div className="lg:pl-64">
          <Header setMobileSidebarOpen={setMobileSidebarOpen} />
        </div>

        {/* BODY */}
        <div className="flex">
          {/* SIDEBAR */}
          <Sidebar
            mobileSidebarOpen={mobileSidebarOpen}
            setMobileSidebarOpen={setMobileSidebarOpen}
          />

          {/* MAIN CONTENT */}
          <main className="flex-1 bg-gray-50 min-h-screen lg:pl-64 pt-16">
            <div className="p-3 sm:p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <GlobalMessageDisplay />
    </MessageProvider>
  );
};

export default DepartmentLayout;