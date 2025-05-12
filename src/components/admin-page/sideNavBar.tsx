"use client";

export default function SideNavBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: "figures" | "tables";
  setActiveTab: (tab: "figures" | "tables") => void;
}) {
  return (
    <div className="min-h-0 md:min-h-screen border-r border-sidebar-border bg-sidebar text-sm text-sidebar-foreground">
      <nav className="flex flex-col space-y-2">
        <button
          onClick={() => setActiveTab("figures")}
          className={`px-5 rounded text-left font-medium transition-all duration-150 ${
            activeTab === "figures"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "hover:bg-sidebar-accent text-sidebar-primary-foreground"
          }`}
        >
          Figures
        </button>
        <button
          onClick={() => setActiveTab("tables")}
          className={`px-5 rounded text-left font-medium transition-all duration-150 ${
            activeTab === "tables"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "hover:bg-sidebar-accent text-sidebar-primary-foreground"
          }`}
        >
          Raw Tables
        </button>
      </nav>
    </div>
  );
}
