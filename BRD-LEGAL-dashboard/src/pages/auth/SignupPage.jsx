import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EnvelopeIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { register as registerApi } from "../../api/authApi.js";
import { useAuth } from "../../context/AuthContext.jsx";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "legal",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const primary = {
    50: "#eff6ff",
    200: "#bfdbfe",
    300: "#93c5fd",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.confirmPassword)
      return setError("Passwords do not match.");

    if (formData.password.length < 8)
      return setError("Password must be at least 8 characters.");

    setLoading(true);

    try {
      // Call the backend API — unchanged
      const response = await registerApi({
        email: formData.email,
        password: formData.password,
        password2: formData.confirmPassword,
        first_name: formData.name.split(" ")[0] || "",
        last_name: formData.name.split(" ").slice(1).join(" ") || "",
        role: formData.role,
      });

      // Update auth context — unchanged
      login(response.user);

      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => navigate(`/${response.user.role}`), 1200);
    } catch (err) {
      console.error("Registration error:", err);

      // Handle different error formats — unchanged
      let errorMsg = "Registration failed. Please try again.";
      if (err.error) {
        errorMsg = err.error;
      } else if (err.email) {
        errorMsg = Array.isArray(err.email) ? err.email[0] : err.email;
      } else if (err.password) {
        errorMsg = Array.isArray(err.password) ? err.password[0] : err.password;
      } else if (typeof err === "string") {
        errorMsg = err;
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div
        className="w-full max-w-md rounded-2xl shadow-card p-5 sm:p-8"
        style={{ border: `1px solid ${primary[200]}`, background: "#fff" }}
      >
        {/* Icon + Title */}
        <div className="flex flex-col items-center">
          <div
            className="h-11 w-11 sm:h-12 sm:w-12 rounded-full flex items-center justify-center"
            style={{ background: primary[50], color: primary[600] }}
          >
            <ShieldCheckIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <div className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-semibold text-gray-900 text-center">
            Create your account
          </div>

          <div className="mt-1 text-xs sm:text-sm text-gray-600 text-center">
            Sign up to join the Legal Dashboard
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div
            className="mt-3 rounded-lg p-3 text-xs sm:text-sm"
            style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca" }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            className="mt-3 rounded-lg p-3 text-xs sm:text-sm"
            style={{ background: primary[50], color: primary[700], border: `1px solid ${primary[200]}` }}
          >
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 sm:mt-6 space-y-3 sm:space-y-4">
          {/* Full Name */}
          <label className="block">
            <div className="text-xs sm:text-sm text-gray-900 mb-1">Full Name</div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full h-10 sm:h-11 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm border"
              style={{ borderColor: primary[200] }}
            />
          </label>

          {/* Email */}
          <label className="block">
            <div className="text-xs sm:text-sm text-gray-900 mb-1">Email</div>
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-10 sm:h-11 rounded-xl px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm border"
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
          <label className="block">
            <div className="text-xs sm:text-sm text-gray-900 mb-1">Password</div>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full h-10 sm:h-11 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm border"
              style={{ borderColor: primary[200] }}
            />
          </label>

          {/* Confirm Password */}
          <label className="block">
            <div className="text-xs sm:text-sm text-gray-900 mb-1">Confirm Password</div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full h-10 sm:h-11 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm border"
              style={{ borderColor: primary[200] }}
            />
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="h-10 sm:h-11 w-full rounded-xl text-white shadow transition disabled:opacity-50 text-sm sm:text-base font-medium mt-1"
            style={{ background: primary[600] }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Bottom Link */}
        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm">
          <span className="text-gray-700">Already have an account? </span>
          <Link
            to="/login"
            style={{ color: primary[600] }}
            className="font-medium hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;