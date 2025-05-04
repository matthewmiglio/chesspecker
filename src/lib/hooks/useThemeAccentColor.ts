import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Returns red if dark mode, blue if light mode.
 */
export const useThemeAccentColor = (): string => {
  const { resolvedTheme } = useTheme();
  const [color, setColor] = useState("var(--red-progress-color)");

  useEffect(() => {
    setColor(
      resolvedTheme === "dark"
        ? "var(--red-progress-color)"
        : "var(--blue-progress-color)"
    );
  }, [resolvedTheme]);

  return color;
};
