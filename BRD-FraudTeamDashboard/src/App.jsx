import { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Sidebar from "./components/Sidebar";
import Header from "./components/layout/Header";

import Home from "./pages/Home";
import Cases from "./pages/Cases";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import CaseDetails from "./pages/CaseDetails";

import { HiMenu } from "react-icons/hi";

export default function App() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Page title logic
  const path = location.pathname;
  const pageTitle =
    path === "/home" ? "Dashboard" :
    path.startsWith("/cases/") ? "Case Details" :
    path === "/cases" ? "Cases" :
    path === "/analytics" ? "Analytics" :
    path === "/reports" ? "Reports" :
    path === "/settings" ? "Settings" :
    "";

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* SIDEBAR */}
      <>
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black opacity-50"
              onClick={() => setSidebarOpen(false)}
            ></div>
            <div className="relative w-64 h-full bg-white shadow-xl z-50">
              <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden md:block md:w-64 bg-white shadow-lg">
          <Sidebar open={false} setOpen={setSidebarOpen} />
        </div>
      </>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* HEADER */}
        <Header title={pageTitle} onOpenSidebar={() => setSidebarOpen(true)} />

        {/* PAGE CONTENT */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/cases/:caseId" element={<CaseDetails />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}