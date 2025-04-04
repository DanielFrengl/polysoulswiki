import React from "react";

const NavBar = () => {
  return (
    <div className="flex flex-row justify-between items-center p-4 shadow-lg">
      <nav className="flex flex-row space-x-4 items-center text-2xl gap-4">
        <a href="/">
          <img src="logo/logo.png" className="w-[20vw] h-auto"></img>
        </a>
        <a href="/" className="text-white hover:text-gray-500">
          Home
        </a>
        <a href="/about" className="text-white hover:text-gray-500">
          About
        </a>
        <a href="/contact" className="text-white hover:text-gray-500">
          Contact
        </a>
        <a href="/login" className="text-white hover:text-gray-500">
          Login
        </a>
      </nav>
    </div>
  );
};

export default NavBar;
