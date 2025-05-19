// src/lib/api/adminDataApi.ts
export async function fetchAccuracyData() {
  const res = await fetch("/api/accuracy/getAll", {
    method: "POST",
    body: JSON.stringify({ set_id: "any", repeat_index: 0 }),
  });
  return res.json();
}

export async function fetchUserStats() {
  const res = await fetch("/api/userStats/getAll");
  return res.json();
}

export async function fetchDailyStats() {
  const res = await fetch("/api/daily_stats/getAll");
  return res.json();
}

export async function fetchSets() {
  const res = await fetch("/api/sets/getAll");
  return res.json();
}

export async function fetchAllLoginStreaks() {
  const res = await fetch("/api/login_streak/getAll");
  return res.json();
}
