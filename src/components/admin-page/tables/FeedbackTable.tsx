"use client";

type FeedbackEntry = {
  email: string;
  timestamp: string;
  text: string;
};

export default function FeedbackTable({ feedback }: { feedback: FeedbackEntry[] }) {

  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-semibold mb-4">Feedback Submissions</h2>

      {feedback.length === 0 ? (
        <p className="text-gray-500 italic">No feedback submitted yet.</p>
      ) : (
        <table className="w-full table-auto border-collapse text-sm md:text-base">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Text</th>
              <th className="px-4 py-2 border">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {feedback.map((f, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 border">{f.email}</td>
                <td className="px-4 py-2 border max-w-[200px] truncate">{f.text || "—"}</td>
                <td className="px-4 py-2 border whitespace-pre-wrap">{f.timestamp || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
