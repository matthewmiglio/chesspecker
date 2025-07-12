"use client";

type FeedbackEntry = {
  email: string;
  timestamp: string;
  text: string;
};

export default function FeedbackTable({ feedback }: { feedback: FeedbackEntry[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Feedback Submissions</h2>

      {feedback.length === 0 ? (
        <p className="text-gray-500 italic">No feedback submitted yet.</p>
      ) : (
        <ul className="space-y-4">
          {feedback.map((f, idx) => (
            <li key={idx} className="bg-gray-800 text-white rounded-lg shadow p-4">
              {/* Header row: email + timestamp */}
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm break-all">{f.email}</span>
                <span className="text-xs text-gray-400">{new Date(f.timestamp).toLocaleString()}</span>
              </div>

              {/* Body: text */}
              <div className="text-sm whitespace-pre-wrap">
                {f.text || <span className="italic text-gray-400">No message</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
