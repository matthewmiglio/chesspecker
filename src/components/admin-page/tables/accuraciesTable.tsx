"use client";

type AccuracyData = {
    set_id: string;
    repeat_index: number;
    correct: number;
    incorrect: number;
};

export default function AccuraciesTable({ data }: { data: AccuracyData[] }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-300">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-800 font-semibold">
                    <tr>
                        <th className="p-3">Set ID</th>
                        <th className="p-3">Repeat Index</th>
                        <th className="p-3">Correct</th>
                        <th className="p-3">Incorrect</th>
                        <th className="p-3">Accuracy</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, idx) => {
                        const total = item.correct + item.incorrect;
                        const acc = total === 0 ? "—" : `${((item.correct / total) * 100).toFixed(1)}%`;
                        return (
                            <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="p-3">{item.set_id}</td>
                                <td className="p-3">{item.repeat_index}</td>
                                <td className="p-3">{item.correct}</td>
                                <td className="p-3">{item.incorrect}</td>
                                <td className="p-3">{acc}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
