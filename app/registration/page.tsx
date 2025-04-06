"use client";
import React, { useState } from "react";
import { MdEmail, MdLock, MdPerson } from "react-icons/md";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleRegister = async () => {
    // This is where you'd call Supabase auth signUp or your API
    console.log("Registering:", { name, email, password });
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="p-20 bg-black rounded-2xl">
        <div className="flex flex-col items-center justify-center w-full max-w-md">
          <h1 className="text-center text-5xl mb-10 text-white">Register</h1>
          <div className="flex flex-col gap-8 w-full">
            {/* Name */}
            <div className="relative w-full">
              <MdPerson
                size={24}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-600"
              />
              <input
                className="bg-white text-black text-xl pl-12 pr-4 py-4 rounded-lg w-full"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="relative w-full">
              <MdEmail
                size={24}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-600"
              />
              <input
                className="bg-white text-black text-xl pl-12 pr-4 py-4 rounded-lg w-full"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="relative w-full">
              <MdLock
                size={24}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-600"
              />
              <input
                className="bg-white text-black text-xl pl-12 pr-4 py-4 rounded-lg w-full"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="relative w-full">
              <MdLock
                size={24}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-600"
              />
              <input
                className="bg-white text-black text-xl pl-12 pr-4 py-4 rounded-lg w-full"
                type="password"
                placeholder="Type your password again"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Submit */}
            <button
              className="bg-emerald-800 hover:bg-white hover:text-black text-white text-xl font-semibold rounded py-3 mt-4 transition duration-200 ease-in-out shadow-lg"
              onClick={handleRegister}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
