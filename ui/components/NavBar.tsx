"use client";

import React, { useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import WikiSearch from "./SearchBar";
import { FaUser } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import AuthPopup from "./Auth";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-black w-full px-4 sm:px-6 lg:px-8 py-8 shadow-lg text-white relative">
      {/* Increased max-width slightly for more space if needed, optional */}
      <div className="max-w-screen-xl xl:max-w-screen-2xl mx-auto flex items-center justify-between flex-wrap">
        {/* --- Logo Section (Mobile/Medium) --- */}
        <div className="flex-shrink-0 lg:hidden">
          <a href="/">
            <img
              src="logo/logo.png"
              className="w-32 md:w-48 h-auto"
              alt="Logo"
            />
          </a>
        </div>

        {/* --- Mobile Menu Button --- */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white hover:text-gray-300 focus:outline-none focus:text-gray-300"
            aria-label="Toggle menu"
          >
            {isOpen ? <HiX size={30} /> : <HiMenu size={30} />}
          </button>
        </div>

        {/* --- Navigation Section --- */}
        {/* Added lg:gap-x-6 to create space between left/right groups */}
        <nav
          className={`w-full lg:flex lg:items-center lg:justify-between lg:gap-x-6 ${
            // Added gap here
            isOpen ? "block" : "hidden"
          } mt-4 lg:mt-0`}
        >
          {/* Left/Center Group (Logo on Large + Links) */}
          {/* Added lg:min-w-0 to allow shrinking overall */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-y-3 lg:gap-y-0 lg:gap-x-6 xl:gap-x-8 lg:min-w-0">
            {/* Inline Logo (Large Screens) */}
            <div className="hidden lg:flex lg:items-center flex-shrink-0 mr-6">
              <a href="/">
                <img
                  src="logo/logo.png"
                  className="w-48 xl:w-56 h-auto"
                  alt="Logo"
                />
              </a>
            </div>

            {/* Links Container */}
            {/* Added lg:min-w-0 and lg:flex-shrink */}
            {/* Reduced gaps slightly for more space if needed: lg:gap-x-3 xl:gap-x-5 */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-y-3 lg:gap-y-0 lg:gap-x-3 xl:gap-x-5 text-base lg:text-lg uppercase font-rubik font-semibold lg:min-w-0 lg:flex-shrink">
              {/* Links... */}
              <a
                href="/"
                className="hover:text-gray-400 flex items-center gap-1 flex-shrink-0"
              >
                {" "}
                {/* Added flex-shrink-0 to individual links if needed */}
                Explore <IoMdArrowDropdown />
              </a>
              <a
                href="/about"
                className="hover:text-gray-400 flex items-center gap-1 flex-shrink-0"
              >
                World <IoMdArrowDropdown />
              </a>
              <a
                href="/contact"
                className="hover:text-gray-400 flex items-center gap-1 flex-shrink-0"
              >
                Game <IoMdArrowDropdown />
              </a>
              <a
                href="/login"
                className="hover:text-gray-400 flex items-center gap-1 flex-shrink-0"
              >
                Report a Bug <IoMdArrowDropdown />
              </a>
              <a
                href="/login"
                className="hover:text-gray-400 flex items-center gap-1 flex-shrink-0"
              >
                Development <IoMdArrowDropdown />
              </a>
              <a href="/login" className="hover:text-gray-400 flex-shrink-0">
                Community
              </a>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center gap-y-4 lg:gap-y-0 lg:gap-x-4 xl:gap-x-6 mt-4 lg:mt-0 lg:flex-shrink-0">
            <div>
              {" "}
              {/* Ensure WikiSearch itself doesn't prevent shrinking if it has internal fixed widths */}
              <WikiSearch />
            </div>
            {/* User Icon */}
            <AuthPopup />
          </div>
        </nav>
      </div>
    </div>
  );
};

export default NavBar;
