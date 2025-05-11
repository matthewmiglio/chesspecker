"use client";

import { useEffect, useState } from "react";
import {
    fetchAccuracyData,
    fetchUserStats,
    fetchDailyStats,
    fetchSets,
} from "@/lib/api/adminDataApi";

import RawTables from "@/components/admin-page/tables/tablesDashboard";
import FiguresDashboard from "@/components/admin-page/figures/figuresDashboard";
import SideNavBar from "@/components/admin-page/sideNavBar";
import Unauthorized from "@/components/admin-page/unauthorized";
import { useSession } from "next-auth/react";

import { AccuracyData, DailyStats, SetData, UserStats } from "@/lib/types";

export default function AdminPage() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState<"figures" | "tables">("figures");
    const [accuracy, setAccuracy] = useState<AccuracyData[]>([]);
    const [users, setUsers] = useState<UserStats[]>([]);
    const [daily, setDaily] = useState<DailyStats[]>([]);
    const [sets, setSets] = useState<SetData[]>([]);
    const [loading, setLoading] = useState(true);

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    useEffect(() => {
        if (session?.user?.email !== adminEmail) return;

        async function loadData() {
            setLoading(true);
            const [accuracyData, userData, dailyData, setsData] = await Promise.all([
                fetchAccuracyData(),
                fetchUserStats(),
                fetchDailyStats(),
                fetchSets(),
            ]);

            setAccuracy(accuracyData.sets || []);
            setUsers(userData.users || []);
            setDaily(dailyData.days || []);
            setSets(setsData.sets || []);
            setLoading(false);
        }

        loadData();
    }, [session, adminEmail]);

    if (status === "loading") return <p className="p-6">Authenticating...</p>;
    if (session?.user?.email !== adminEmail) return <Unauthorized />;

    const totals = {
        total_accuracy_rows: accuracy.length,
        total_unique_emails_in_sets: new Set(sets.map((s) => s.email)).size,
        total_set_rows: sets.length,
        total_user_rows: users.length,
        total_daily_stats_rows: daily.length,
    };

    const creates = daily.map(({ day, set_creates }) => ({ day, value: set_creates }));
    const starts = daily.map(({ day, puzzle_starts }) => ({ day, value: puzzle_starts }));
    const requests = daily.map(({ day, puzzle_requests }) => ({ day, value: puzzle_requests }));
    const puzzles = daily.map(({ day, correct_puzzles, incorrect_puzzles }) => ({
        day,
        value: correct_puzzles + incorrect_puzzles,
    }));


    return (
        <div className="flex">
            <SideNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex-1 max-w-6xl mx-auto px-8 py-24 space-y-12">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>

                {loading ? (
                    <p>Loading data...</p>
                ) : activeTab === "figures" ? (
                    <FiguresDashboard
                        creates={creates}
                        puzzles={puzzles}
                        requests={requests}
                        starts={starts}
                        totals={totals}
                    />
                ) : (
                    <RawTables
                        accuracyData={accuracy}
                        usersData={users}
                        dailydata={daily}
                        setsData={sets}
                    />
                )}
            </div>
        </div>
    );
}
