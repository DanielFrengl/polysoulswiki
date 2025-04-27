"use client";

import React, { useState } from "react";
import { Nav } from "./NavLogic";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; // assuming you have this from shadcn/ui

interface NavEditorProps {
  nav: Nav;
  onSubmit: (nav: Nav) => void;
}

export default function NavEditor({ nav, onSubmit }: NavEditorProps) {
  const [id, setId] = useState<number>(nav?.id);
  const [title, setTitle] = useState(nav?.title || "");
  const [position, setPosition] = useState<number>(nav?.position || 0);
  const [dropdown, setDropdown] = useState<boolean>(nav?.dropdown || false);

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          id,
          title,
          position,
          dropdown,
        });
        console.log("Form submitted:", {
          id,
          title,
          position,
          dropdown,
        });
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="mb-2">Nav Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <Label className="mb-2">Position</Label>
          <Input
            type="number"
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          checked={dropdown}
          onCheckedChange={(checked) => setDropdown(!!checked)}
        />
        <Label>Dropdown</Label>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Navigation
      </button>
    </form>
  );
}
