"use client";

type DailyStats = {
    day: string;
    correct_puzzles: number;
    incorrect_puzzles: number;
    puzzle_starts: number;
    set_creates: number;
    puzzle_requests: number;
};

export default function DailyStatsTable({ data }: { data: DailyStats[] }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-300">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-800 font-semibold">
                    <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Starts</th>
                        <th className="p-3">Requests</th>
                        <th className="p-3">Correct</th>
                        <th className="p-3">Incorrect</th>
                        <th className="p-3">Set Creates</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((stat, idx) => (
                        <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="p-3">{stat.day}</td>
                            <td className="p-3">{stat.puzzle_starts}</td>
                            <td className="p-3">{stat.puzzle_requests}</td>
                            <td className="p-3">{stat.correct_puzzles}</td>
                            <td className="p-3">{stat.incorrect_puzzles}</td>
                            <td className="p-3">{stat.set_creates}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
