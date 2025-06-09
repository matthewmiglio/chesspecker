"use client";

import { useEffect, useState } from "react";
import { Button } from "./button";

export default function FeedbackPopup({
  onConfirm,
  onDismiss,
}: {
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 500); // slight delay
    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-zinc-900 text-black dark:text-white p-6 rounded-xl shadow-lg w-[90%] max-w-sm text-center border border-border">
        <h2 className="text-lg font-semibold mb-3">
          Liking ChessPecker?
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Consider leaving some feedback!
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={onConfirm}>OK!</Button>
          <Button variant="outline" onClick={onDismiss}>
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
}
