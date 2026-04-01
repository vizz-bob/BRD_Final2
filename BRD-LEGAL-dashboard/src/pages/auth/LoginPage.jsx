// src/pages/auth/LoginPage.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheckIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { login as loginApi } from "../../api/authApi.js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const primary = {
    50: "#eff6ff",
    200: "#bfdbfe",
    300: "#93c5fd",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Call the backend API — unchanged
      const response = await loginApi(email, password);

      if (rememberMe) {
        localStorage.setItem("remember_email", email);
      } else {
        localStorage.removeItem("remember_email");
      }

      // Update auth context — unchanged
      login(response.user);

      // Navigate to the user's role-based dashboard — unchanged
      navigate(`/${response.user.role}`);
    } catch (err) {
      setError(err.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div
        className="w-full max-w-md rounded-2xl shadow-card p-5 sm:p-8 border bg-white"
        style={{ borderColor: primary[200] }}
      >
        {/* Icon + Title */}
        <div className="flex flex-col items-center">
          <div
            className="h-11 w-11 sm:h-12 sm:w-12 rounded-full flex items-center justify-center"
            style={{ background: primary[50], color: primary[600] }}
          >
            <ShieldCheckIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <h2 className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-semibold text-gray-900 text-center">
            Legal Dashboard
          </h2>

          <p className="mt-1 text-xs sm:text-sm text-gray-600 text-center">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mt-3 rounded-lg p-3 text-xs sm:text-sm"
            style={{
              background: primary[50],
              color: primary[700],
              border: `1px solid ${primary[200]}`,
            }}
          >
            {error}
          </div>
        )}

        {/* Email */}
        <label className="block mt-5 sm:mt-6">
          <span className="text-xs sm:text-sm text-gray-900">Email</span>
          <div className="mt-1 relative">
            <input
              type="email"
              placeholder="admin@valuation.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 sm:h-11 rounded-xl px-3 pr-10 border focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
              style={{ borderColor: primary[200] }}
            />
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: primary[500] }}
            >
              <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
        </label>

        {/* Password */}
        <label className="block mt-3 sm:mt-4">
          <span className="text-xs sm:text-sm text-gray-900">Password</span>
          <div className="mt-1 relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 sm:h-11 rounded-xl px-3 pr-16 border focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
              style={{ borderColor: primary[200] }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-medium"
              style={{ color: primary[600] }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        {/* Remember + Forgot */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <label className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-gray-300"
            />
            <span>Remember me</span>
          </label>

          <Link
            to="/forgot-password"
            style={{ color: primary[600] }}
            className="text-xs sm:text-sm hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <div className="mt-5 sm:mt-6">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="h-10 sm:h-11 w-full rounded-xl text-white shadow transition disabled:opacity-50 text-sm sm:text-base font-medium"
            style={{ background: primary[600] }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <p className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-500">
          Create an account to get started
        </p>

        <p className="mt-1 sm:mt-2 text-center text-xs sm:text-sm">
          <span className="text-gray-700">Don't have an account? </span>
          <Link to="/signup" style={{ color: primary[600] }} className="font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}