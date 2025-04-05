"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import Dropdown from "./Dropdown";
import { AuthProvider } from "@/context/AuthContext";
import { CiLocationArrow1 } from "react-icons/ci";

export default function AuthPopup() {
  const { user, loading } = useAuth();
  const [show, setShow] = useState(true);

  if (loading || !show) return null;

  return (
    <>
      {user ? (
        <Dropdown />
      ) : (
        <div className="flex flex-row items-center">
          <a
            href="/login"
            className="p-2 rounded-md uppercase text-semibold font-rubik text-white"
          >
            Login
          </a>
          <CiLocationArrow1 />
        </div>
      )}
    </>
  );
}
