// src/App.jsx

import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import PipelinePage from "./pages/PipelinePage";
import ReportsPage from "./pages/ReportsPage";
import IncentivesPage from "./pages/IncentivesPage";
import ResourcesPage from "./pages/ResourcesPage";
import SettingsPage from "./pages/SettingsPage";

const quickFilterLabels = {
  all: "All Leads",
  "my-leads": "My Leads",
  "team-leads": "Team Leads",
  "pending-docs": "Pending Docs",
  "payout-due": "Payout Due",
};

function AppLayout({ activeFilter, setActiveFilter }) {
  return (
    <Layout
      activeFilter={activeFilter}
      setActiveFilter={setActiveFilter}
      quickFilterLabels={quickFilterLabels}
    >
      <Outlet />
    </Layout>
  );
}

function AppRoutes() {
  const [activeFilter, setActiveFilter] = useState(null);

  return (
    <Routes>
      {/* All routes open — no auth check */}
      <Route
        path="/"
        element={
          <AppLayout
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        }
      >
        <Route index element={<HomePage />} />
        <Route
          path="pipeline"
          element={<PipelinePage activeFilter={activeFilter} />}
        />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="incentives" element={<IncentivesPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;