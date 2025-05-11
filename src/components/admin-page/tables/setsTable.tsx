"use client";

type SetData = {
    set_id: string;
    name: string;
    email: string;
    elo: number;
    size: number;
    repeats: number;
    create_time: string;
};




export default function SetsTable({ data }: { data: SetData[] }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-300">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-800 font-semibold">
                    <tr>
                        <th className="p-3">Set ID</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Creator</th>
                        <th className="p-3">ELO</th>
                        <th className="p-3">Size</th>
                        <th className="p-3">Repeats</th>
                        <th className="p-3">Created</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((set, idx) => (
                        <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="p-3">{set.set_id}</td>
                            <td className="p-3">{set.name}</td>
                            <td className="p-3">{set.email}</td>
                            <td className="p-3">{set.elo}</td>
                            <td className="p-3">{set.size}</td>
                            <td className="p-3">{set.repeats}</td>
                            <td className="p-3">{new Date(set.create_time).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
