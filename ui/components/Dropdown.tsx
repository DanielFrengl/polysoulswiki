"use client";
import { useState, useEffect, useRef } from "react";
import { FaUser } from "react-icons/fa";
import { handleSignout } from "@/app/utils/supabase/logout";

export default function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Updated logout function to close dropdown before signout
  const handleLogout = async () => {
    setIsOpen(false); // Close dropdown first
    await handleSignout(); // Sign out
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md bg-black text-white flex items-center"
      >
        <FaUser size={24} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg p-2 border">
          <a
            href="#"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Profile
          </a>
          <a
            href="#"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Settings
          </a>
          <button
            onClick={handleLogout} // Use the updated function
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
