"use client";

import { useEffect, useState } from "react";

import {
  fetchAccuracyData,
  fetchUserStats,
  fetchDailyStats,
  fetchSets,
} from "@/lib/api/adminDataApi";

import RawTables from "@/components/admin-page/tables/tablesDashboard";
import { fetchAllLoginStreaks } from "@/lib/api/adminDataApi";
import FiguresDashboard from "@/components/admin-page/figures/figuresDashboard";
import SideNavBar from "@/components/admin-page/sideNavBar";
import Unauthorized from "@/components/admin-page/unauthorized";
import { useSession } from "next-auth/react";
import FeedbackTable from "@/components/admin-page/tables/FeedbackTable";

import { AccuracyData, DailyStats, SetData, UserTableUser } from "@/lib/types";
import { fetchAllFeedback } from "@/lib/api/feedbackApi"; // ✅ add this impo

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"figures" | "tables" | "feedback">(
    "figures"
  );

  const [accuracy, setAccuracy] = useState<AccuracyData[]>([]);
  const [users, setUsers] = useState<UserTableUser[]>([]);
  const [daily, setDaily] = useState<DailyStats[]>([]);
  const [streaks, setStreaks] = useState<
    { email: string; login_count: number }[]
  >([]);
  const [sets, setSets] = useState<SetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<
    { email:string, text:string, timestamp:string }[]
  >([]);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  useEffect(() => {
    if (!session) return;
    if (!adminEmail) {
      console.error("Admin email is not set in environment variables.");
      return;
    }
    if (!session.user) return;
    if (!session?.user?.email) return;
    if (session?.user?.email !== adminEmail) return;

    async function loadData() {
      setLoading(true);
      const [
        accuracyData,
        userData,
        dailyData,
        setsData,
        streakData,
        feedbackData,
      ] = await Promise.all([
        fetchAccuracyData(),
        fetchUserStats(),
        fetchDailyStats(),
        fetchSets(),
        fetchAllLoginStreaks(),
        fetchAllFeedback(),
      ]);

      setAccuracy(accuracyData.sets || []);
      setUsers(userData.users || []);
      setDaily(dailyData.days || []);
      setSets(setsData.sets || []);
      setStreaks(streakData.data || []);
      setFeedback(feedbackData || []);
      console.log("Feedback data loaded:", feedbackData);
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

  const userStats = users.map(({ email, created_at }) => ({
    email,
    created_at,
  }));

  const creates = daily.map(({ day, set_creates }) => ({
    day,
    value: set_creates,
  }));
  const starts = daily.map(({ day, puzzle_starts }) => ({
    day,
    value: puzzle_starts,
  }));
  const requests = daily.map(({ day, puzzle_requests }) => ({
    day,
    value: puzzle_requests,
  }));
  const puzzles = daily.map(({ day, correct_puzzles, incorrect_puzzles }) => ({
    day,
    value: correct_puzzles + incorrect_puzzles,
  }));

  return (
    <div className="flex flex-col md:flex-row">
      <SideNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 max-w-6xl mx-auto px-0 md:px-8 py-7 md:py-24 space-y-5  md:space-y-12">
        <h1 className="text-3xl font-bold ">Admin Dashboard</h1>

        {loading ? (
          <p>Loading data...</p>
        ) : activeTab === "figures" ? (
          <FiguresDashboard
            creates={creates}
            puzzles={puzzles}
            requests={requests}
            starts={starts}
            totals={totals}
            userStats={userStats}
            streaks={streaks}
          />
        ) : activeTab === "tables" ? (
          <RawTables
            accuracyData={accuracy}
            usersData={users}
            dailydata={daily}
            setsData={sets}
            streaksData={streaks}
          />
        ) : (
          <FeedbackTable feedback={feedback} /> // ✅ new tab
        )}
      </div>
    </div>
  );
}
