import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";

// --- Page Imports ---
import ProfilePage from "./pages/auth/ProfilePage.jsx";
import AllUsersPage from "./pages/auth/AllUsersPage.jsx";

import ValuationDashboard from "./pages/valuation/ValuationDashboard.jsx";

import FieldVerifications from "./pages/valuation/FieldVerifications.jsx";
import PropertyChecks from "./pages/valuation/PropertyChecks.jsx";
import ValuationDetails from "./pages/valuation/ValuationDetails.jsx";

import DepartmentLayout from "./components/DepartmentLayout.jsx";

// --- Router Configuration ---
const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/valuation/dashboard" replace /> },
  { path: "/all-users", element: <AllUsersPage /> },

  // Valuation routes (open access)
  {
    path: "/valuation",
    element: <DepartmentLayout />,
    children: [
      { index: true, path: "dashboard", element: <ValuationDashboard /> },
      { path: "field-verifications", element: <FieldVerifications /> },
      { path: "property-checks", element: <PropertyChecks /> },
      { path: ":id", element: <ValuationDetails /> },
    ],
  },

  // Profile route (open access)
  { path: "/profile", element: <ProfilePage /> },

  // Catch-all
  { path: "*", element: <Navigate to="/valuation/dashboard" replace /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;