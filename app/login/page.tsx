"use client";
import React, { useState } from "react";
import { MdEmail, MdLock } from "react-icons/md";
import { createClient } from "@supabase/supabase-js";

// ✅ Setup Supabase client
const supabase = createClient(
  "https://your-project.supabase.co", // ← replace with your Supabase URL
  "your-anon-key" // ← replace with your anon/public key
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ Login handler
  const handleLogin = async () => {
    setError("");
    setSuccess("");

    // 1. Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message); // Show error message
    } else {
      setSuccess("Login successful! Redirecting...");

      // You can redirect after login here:
      // window.location.href = "/dashboard"; // example
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="p-20 bg-black rounded-2xl">
        <div className="flex flex-col items-center justify-center w-full max-w-md">
          <h1 className="text-center text-5xl mb-10 text-white">Login</h1>
          <div className="flex flex-col gap-8 w-full">
            {/* Email input */}
            <div className="relative w-full">
              <MdEmail
                size={24}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-600"
              />
              <input
                className="bg-white text-black text-xl pl-12 pr-4 py-4 rounded-lg w-full"
                type="email"
                placeholder="Enter your e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password input */}
            <div>
              <div className="relative w-full">
                <MdLock
                  size={24}
                  className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-600"
                />

                <input
                  className="bg-white text-black text-xl pl-12 pr-4 py-4 rounded-lg w-full"
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <a href="/" className="">
                Forgot your password?
              </a>
            </div>
            {/* Error / Success Feedback */}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {success && (
              <p className="text-green-500 text-sm mt-2">{success}</p>
            )}

            {/* Button */}
            <button
              onClick={handleLogin}
              className="bg-emerald-800 hover:bg-white hover:text-black text-white text-xl font-semibold rounded py-3 mt-4 transition duration-200 ease-in-out shadow-lg"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
