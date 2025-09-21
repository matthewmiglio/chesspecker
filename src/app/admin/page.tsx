"use client";

import { useEffect, useState } from "react";

import {
  fetchAccuracyData,
  fetchUserStats,
  fetchDailyStats,
  fetchSets,
  fetchAnalyticsEvents,
} from "@/lib/api/adminDataApi";

import RawTables from "@/components/admin-page/tables/tablesDashboard";
import { fetchAllLoginStreaks } from "@/lib/api/adminDataApi";
import FiguresDashboard from "@/components/admin-page/figures/figuresDashboard";
import SideNavBar from "@/components/admin-page/sideNavBar";
import Unauthorized from "@/components/admin-page/unauthorized";
import { useSession } from "next-auth/react";
import FeedbackTable from "@/components/admin-page/tables/FeedbackTable";
import { SupabaseReauthBanner } from "@/components/auth/SupabaseReauthBanner";

import { AccuracyData, DailyStats, SetData, UserTableUser } from "@/lib/types";
import { fetchAllFeedback } from "@/lib/api/feedbackApi"; // ✅ add this impo

type AnalyticsEvent = {
  id: string;
  ts: string;
  path: string;
  referrer: string | null;
  visitor_id: string | null;
  session_id: string | null;
  ua: string | null;
  ip_hash: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
};

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
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  useEffect(() => {
    console.log('[AdminPage] useEffect triggered:', {
      hasSession: !!session,
      sessionStatus: status,
      sessionUser: session?.user,
      adminEmail: adminEmail,
      userEmail: session?.user?.email,
      isAdminMatch: session?.user?.email === adminEmail
    });

    if (!session) {
      console.log('[AdminPage] No session, returning early');
      return;
    }
    if (!adminEmail) {
      console.log('[AdminPage] No admin email configured, returning early');
      return;
    }
    if (!session.user) {
      console.log('[AdminPage] No session.user, returning early');
      return;
    }
    if (!session?.user?.email) {
      console.log('[AdminPage] No session.user.email, returning early');
      return;
    }
    if (session?.user?.email !== adminEmail) {
      console.log('[AdminPage] User email does not match admin email, returning early');
      return;
    }

    console.log('[AdminPage] All checks passed, proceeding to load data');

    async function loadData() {
      console.log('[AdminPage] loadData: Starting data fetch');
      setLoading(true);

      try {
        console.log('[AdminPage] loadData: Fetching analytics events...');
        const analyticsData = await fetchAnalyticsEvents();
        console.log('[AdminPage] loadData: Analytics events result:', analyticsData);

        console.log('[AdminPage] loadData: Fetching all other data...');
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

        console.log('[AdminPage] loadData: All data fetched, setting state...');
        setAccuracy(accuracyData.sets || []);
        setUsers(userData.users || []);
        setDaily(dailyData.days || []);
        setSets(setsData.sets || []);
        setStreaks(streakData.data || []);
        setFeedback(feedbackData || []);
        setAnalytics(analyticsData.events || []);

        console.log('[AdminPage] loadData: Analytics events set in state:', analyticsData.events?.length || 0);
        setLoading(false);
      } catch (error) {
        console.error('[AdminPage] loadData: Error occurred:', error);
        setLoading(false);
      }
    }

    loadData();
  }, [session, adminEmail, status]);

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

        <SupabaseReauthBanner />

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
            analyticsData={analytics}
          />
        ) : (
          <FeedbackTable feedback={feedback} /> // ✅ new tab
        )}
      </div>
    </div>
  );
}
