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
import { FREE_TIER_LIMITS } from "@/lib/hooks/usePremiumStatus";
import { ChevronDown, Crown, Lock } from "lucide-react";
import Link from "next/link";

type ThemeSelectorProps = {
  selectedThemes: string[];
  onChange: (themes: string[]) => void;
  isPremium?: boolean;
  onLockedThemeClick?: () => void;
};

export default function ThemeSelector({ selectedThemes, onChange, isPremium = false, onLockedThemeClick }: ThemeSelectorProps) {
  const availableThemes = isPremium
    ? PUZZLE_THEMES_OVER_10K
    : FREE_TIER_LIMITS.freeThemes;

  const handleSelectAll = () => {
    onChange([...availableThemes]);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleToggleTheme = (theme: string) => {
    // Free users cannot select premium themes
    if (!isPremium && !(FREE_TIER_LIMITS.freeThemes as readonly string[]).includes(theme)) {
      onLockedThemeClick?.();
      return;
    }

    if (selectedThemes.includes(theme)) {
      onChange(selectedThemes.filter((t) => t !== theme));
    } else {
      onChange([...selectedThemes, theme]);
    }
  };

  const selectedCount = selectedThemes.length;
  const isThemeLocked = (theme: string) => !isPremium && !(FREE_TIER_LIMITS.freeThemes as readonly string[]).includes(theme);
  const lockedCount = PUZZLE_THEMES_OVER_10K.length - FREE_TIER_LIMITS.freeThemes.length;

  return (
    <div className="space-y-2">
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
            {!isPremium && (
              <span className="text-xs text-muted-foreground">
                {FREE_TIER_LIMITS.freeThemes.length} available
              </span>
            )}
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
          {PUZZLE_THEMES_OVER_10K.map((theme) => {
            const locked = isThemeLocked(theme);
            return (
              <DropdownMenuCheckboxItem
                key={theme}
                checked={selectedThemes.includes(theme)}
                onCheckedChange={() => handleToggleTheme(theme)}
                onSelect={(e) => e.preventDefault()}
                disabled={locked}
                className={locked ? "opacity-50" : ""}
              >
                <span className="flex items-center gap-2 w-full">
                  {THEME_DISPLAY_NAMES[theme] || theme}
                  {locked && <Lock className="w-3 h-3 ml-auto text-muted-foreground" />}
                </span>
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {!isPremium && (
        <Link
          href="/pricing"
          className="flex items-center gap-1.5 text-xs text-[var(--theme-color)] hover:underline"
        >
          <Crown className="w-3.5 h-3.5" />
          Upgrade to Premium to unlock {lockedCount} more themes
        </Link>
      )}
    </div>
  );
}
