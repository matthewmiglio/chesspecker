"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AccuraciesTable from "@/components/admin-page/tables/accuraciesTable";
import UsersTable from "@/components/admin-page/tables/usersTable";
import DailyStatsTable from "@/components/admin-page/tables/dailyStatsTable";
import SetsTable from "@/components/admin-page/tables/setsTable";
import StreaksTable from "@/components/admin-page/tables/StreaksTable";
import { Streak } from "@/lib/types";


type UserTableUser = {
  email: string;
  created_at: string;
  puzzle_starts: number;
  correct_puzzles: number;
  incorrect_puzzles: number;
  set_creates: number;
  hints: number;
  puzzle_requests: number;
};

type SetData = {
  set_id: string;
  name: string;
  email: string;
  elo: number;
  size: number;
  repeats: number;
  create_time: string;
};

type DailyStats = {
  day: string;
  correct_puzzles: number;
  incorrect_puzzles: number;
  puzzle_starts: number;
  set_creates: number;
  puzzle_requests: number;
};

type AccuracyData = {
  set_id: string;
  repeat_index: number;
  correct: number;
  incorrect: number;
};

type RawTablesProps = {
  accuracyData: AccuracyData[];
  usersData: UserTableUser[];
  dailydata: DailyStats[];
  setsData: SetData[];
  streaksData: Streak[];
};

export default function RawTables({
  accuracyData,
  usersData,
  dailydata,
  setsData,
  streaksData,
}: RawTablesProps) {
  return (
    <Tabs defaultValue="accuracies" className="w-full">
      <TabsList className="grid grid-cols-5 w-full mb-4">
        <TabsTrigger value="accuracies">Accuracy</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="daily">Daily Stats</TabsTrigger>
        <TabsTrigger value="sets">Sets</TabsTrigger>
        <TabsTrigger value="streaks">Streaks</TabsTrigger>
      </TabsList>

      <TabsContent value="accuracies">
        <h2 className="text-xl font-semibold mb-2">Accuracy Data</h2>
        <AccuraciesTable data={accuracyData} />
      </TabsContent>

      <TabsContent value="streaks">
        <h2 className="text-xl font-semibold mb-2">Login Streaks</h2>
        <StreaksTable data={streaksData} />
      </TabsContent>

      <TabsContent value="users">
        <h2 className="text-xl font-semibold mb-2">Users</h2>
        <UsersTable data={usersData} />
      </TabsContent>

      <TabsContent value="daily">
        <h2 className="text-xl font-semibold mb-2">Daily Stats</h2>
        <DailyStatsTable data={dailydata} />
      </TabsContent>

      <TabsContent value="sets">
        <h2 className="text-xl font-semibold mb-2">Sets</h2>
        <SetsTable data={setsData} />
      </TabsContent>
    </Tabs>
  );
}
