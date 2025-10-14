"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PUZZLE_THEMES_OVER_10K, THEME_DISPLAY_NAMES } from "@/lib/constants/puzzleThemes";
import { ChevronDown } from "lucide-react";

type ThemeSelectorProps = {
  selectedThemes: string[];
  onChange: (themes: string[]) => void;
};

export default function ThemeSelector({ selectedThemes, onChange }: ThemeSelectorProps) {
  const handleSelectAll = () => {
    onChange([...PUZZLE_THEMES_OVER_10K]);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleToggleTheme = (theme: string) => {
    if (selectedThemes.includes(theme)) {
      onChange(selectedThemes.filter((t) => t !== theme));
    } else {
      onChange([...selectedThemes, theme]);
    }
  };

  const selectedCount = selectedThemes.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
        >
          <span>Puzzle Themes</span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">
              ({selectedCount} selected)
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 max-h-[400px] overflow-y-auto">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Select Themes</span>
        </DropdownMenuLabel>
        <div className="flex gap-2 px-2 pb-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="flex-1 h-7 text-xs"
          >
            Select All
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="flex-1 h-7 text-xs"
          >
            Clear All
          </Button>
        </div>
        <DropdownMenuSeparator />
        {PUZZLE_THEMES_OVER_10K.map((theme) => (
          <DropdownMenuCheckboxItem
            key={theme}
            checked={selectedThemes.includes(theme)}
            onCheckedChange={() => handleToggleTheme(theme)}
            onSelect={(e) => e.preventDefault()}
          >
            {THEME_DISPLAY_NAMES[theme] || theme}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
