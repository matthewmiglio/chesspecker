"use client";

export default function SideNavBar({
    activeTab,
    setActiveTab,
}: {
    activeTab: "figures" | "tables";
    setActiveTab: (tab: "figures" | "tables") => void;
}) {
    return (
        <div className="w-48 min-h-screen border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm">
            <nav className="flex flex-col p-4 space-y-2">
                <button
                    onClick={() => setActiveTab("figures")}
                    className={`px-4 py-2 rounded text-left font-medium transition-all duration-150 ${activeTab === "figures"
                        ? "bg-indigo-600 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                        }`}
                >
                    Figures
                </button>
                <button
                    onClick={() => setActiveTab("tables")}
                    className={`px-4 py-2 rounded text-left font-medium transition-all duration-150 ${activeTab === "tables"
                        ? "bg-indigo-600 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                        }`}
                >
                    Raw Tables
                </button>
            </nav>
        </div>
    );
}
