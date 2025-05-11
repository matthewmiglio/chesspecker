export const CurrentTotals = ({ totals }: { totals: Record<string, number> }) => (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-2 text-sm text-gray-900 dark:text-gray-100">
      <h3 className="text-lg font-semibold mb-4">Current Totals</h3>
      <p><strong>Accuracy Rows:</strong> {totals.total_accuracy_rows}</p>
      <p><strong>Unique Set Creators:</strong> {totals.total_unique_emails_in_sets}</p>
      <p><strong>Total Sets:</strong> {totals.total_set_rows}</p>
      <p><strong>Registered Users:</strong> {totals.total_user_rows}</p>
      <p><strong>Active Days:</strong> {totals.total_daily_stats_rows}</p>
    </div>
  );
