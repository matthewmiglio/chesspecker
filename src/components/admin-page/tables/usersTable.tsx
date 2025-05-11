"use client";




type User = {
  email: string;
  created_at: string;
  puzzle_starts: number;
  correct_puzzles: number;
  incorrect_puzzles: number;
  set_creates: number;
  hints: number;
};

export default function UsersTable({ data }: { data: User[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-800 font-semibold">
          <tr>
            <th className="p-3">Email</th>
            <th className="p-3">Joined</th>
            <th className="p-3">Starts</th>
            <th className="p-3">Correct</th>
            <th className="p-3">Incorrect</th>
            <th className="p-3">Creates</th>
            <th className="p-3">Hints</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user, idx) => (
            <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="p-3">{user.email}</td>
              <td className="p-3">{new Date(user.created_at).toLocaleDateString()}</td>
              <td className="p-3">{user.puzzle_starts}</td>
              <td className="p-3">{user.correct_puzzles}</td>
              <td className="p-3">{user.incorrect_puzzles}</td>
              <td className="p-3">{user.set_creates}</td>
              <td className="p-3">{user.hints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
