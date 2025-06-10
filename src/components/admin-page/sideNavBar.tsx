"use client";

export default function SideNavBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: "figures" | "tables" | "feedback";
  setActiveTab: (tab: "figures" | "tables" | "feedback") => void;
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
        <button
          onClick={() => setActiveTab("feedback")}
          className={`px-5 rounded text-left font-medium transition-all duration-150 ${
            activeTab === "feedback"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "hover:bg-sidebar-accent text-sidebar-primary-foreground"
          }`}
        >
          Feedback
        </button>
      </nav>
    </div>
  );
}
