"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import Dropdown from "./Dropdown";
import { AuthProvider } from "@/context/AuthContext";
import { CiLocationArrow1 } from "react-icons/ci";
import { DropDownNav } from "@/components/DropDownNav";
import { Button } from "@/components/ui/button";

export default function AuthPopup() {
  const { user, loading } = useAuth();
  const [show, setShow] = useState(true);

  if (loading || !show) return null;

  return (
    <>
      {user ? (
        <DropDownNav />
      ) : (
        <div className="flex flex-row items-center">
          <a href="/login">
            <Button variant="default" className="text-white dark:text-black">
              Login
            </Button>
          </a>
        </div>
      )}
    </>
  );
}
