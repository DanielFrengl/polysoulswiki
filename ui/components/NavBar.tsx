import React from "react";
import { IoMdArrowDropdown } from "react-icons/io";

const NavBar = () => {
  return (
    <div className="mt-20 px-40 p-4 bg-black/50 shadow-lg">
      <nav className="flex flex-col space-x-4 items-center justify-center text-2xl gap-4">
        <div className="flex flex-col items-center">
          <a href="/">
            <img src="logo/logo.png" className="w-[20vw] h-auto"></img>
          </a>
          <div className="flex flex-row gap-5 items-center justify-center uppercase font-rubik font-semibold">
            <a
              href="/"
              className="text-white hover:text-gray-500 flex flex-row"
            >
              Explore
              <IoMdArrowDropdown />
            </a>
            <a
              href="/about"
              className="text-white hover:text-gray-500 flex flex-row"
            >
              World
              <IoMdArrowDropdown />
            </a>
            <a
              href="/contact"
              className="text-white hover:text-gray-500 flex flex-row"
            >
              Game
              <IoMdArrowDropdown />
            </a>
            <a
              href="/login"
              className="text-white hover:text-gray-500 flex flex-row"
            >
              Report a Bug
              <IoMdArrowDropdown />
            </a>
            <a
              href="/login"
              className="text-white hover:text-gray-500 flex flex-row"
            >
              Development
              <IoMdArrowDropdown />
            </a>
            <a href="/login" className="text-white hover:text-gray-500">
              Community
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
