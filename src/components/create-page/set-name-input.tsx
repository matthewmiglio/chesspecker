"use client";

import { Pencil } from "lucide-react";
import { useState, useEffect } from "react";

type FancyNameInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function FancyNameInput({ value, onChange }: FancyNameInputProps) {
  const [focused, setFocused] = useState(false);
  const isEmpty = value.trim() === "";

  useEffect(() => {
    if (!isEmpty) setFocused(false); // optional fade out icon on typing
  }, [isEmpty]);

  return (
    <div className="relative mb-4">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Name your set..."
        className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground text-white caret-white"
      />

      {/* Underline */}
      <div
        className={`h-[2px] w-full transition-all duration-300 absolute bottom-0 left-0 ${
          focused || !isEmpty ? "bg-white" : "bg-muted"
        }`}
      />

      {/* Pencil icon */}
      {isEmpty && !focused && (
        <Pencil
          className="absolute right-0 bottom-1 text-muted-foreground opacity-60 pointer-events-none transition-opacity duration-200"
          size={20}
        />
      )}
    </div>
  );
}
