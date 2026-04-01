import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'

import Dashboard           from './pages/Dashboard'
import UpdateAgent         from './pages/UpdateAgent'
import UpdatePayout        from './pages/UpdatePayout'
import UpdateRepayment     from './pages/UpdateRepayment'
import AgentPerformance    from './pages/AgentPerformance'
import PerformanceTemplate from './pages/PerformanceTemplate'
import ManageTenants       from './pages/ManageTenants'
import PromotionalOffers   from './pages/PromotionalOffers'

const App = () => {
  return (
    <Routes>
  <Route path="/" element={<Navigate to="/dashboard/dashboard" replace />} />
  <Route path="/dashboard" element={<DashboardLayout />}>
    <Route index element={<Navigate to="/dashboard/dashboard" replace />} />
    <Route path="dashboard"            element={<Dashboard />} />
    <Route path="update-agent"         element={<UpdateAgent />} />
    <Route path="update-payout"        element={<UpdatePayout />} />
    <Route path="update-repayment"     element={<UpdateRepayment />} />
    <Route path="agent-performance"    element={<AgentPerformance />} />
    <Route path="performance-template" element={<PerformanceTemplate />} />
    <Route path="manage-tenants"       element={<ManageTenants />} />
    <Route path="promotional-offers"   element={<PromotionalOffers />} />
  </Route>
</Routes>
  )
}

export default App