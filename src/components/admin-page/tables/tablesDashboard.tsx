
"use client";

import AccuraciesTable from "@/components/admin-page/tables/accuraciesTable"
import UsersTable from "@/components/admin-page/tables/usersTable"
import DailyStatsTable from "@/components/admin-page/tables/dailyStatsTable"
import SetsTable from "@/components/admin-page/tables/setsTable"

type User = {
    email: string;
    created_at: string;
    puzzle_starts: number;
    correct_puzzles: number;
    incorrect_puzzles: number;
    set_creates: number;
    hints: number;
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

export default function RawTables({ accuracyData, usersData, dailydata, setsData }: {
    accuracyData: AccuracyData[]
    usersData: User[]
    dailydata: DailyStats[]
    setsData: SetData[]
}) {
    return (
        <div>
            <section>
                <h2 className="text-xl font-semibold mb-2">Accuracy Data</h2>
                <AccuraciesTable data={accuracyData} />
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">Users</h2>
                <UsersTable data={usersData} />
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">Daily Stats</h2>
                <DailyStatsTable data={dailydata} />
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">Sets</h2>
                <SetsTable data={setsData} />
            </section></div>
    );
}
