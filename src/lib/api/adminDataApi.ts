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

export async function fetchAnalyticsEvents() {
  console.log('[adminDataApi] fetchAnalyticsEvents: Making request to /api/analytics/get_events');

  try {
    const res = await fetch("/api/analytics/get_events");

    console.log('[adminDataApi] fetchAnalyticsEvents: Response status:', res.status);
    console.log('[adminDataApi] fetchAnalyticsEvents: Response headers:', Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      console.error('[adminDataApi] fetchAnalyticsEvents: Request failed with status:', res.status);
      const errorText = await res.text();
      console.error('[adminDataApi] fetchAnalyticsEvents: Error response:', errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log('[adminDataApi] fetchAnalyticsEvents: Success! Received data:', {
      eventsCount: data.events?.length || 0,
      sampleEvent: data.events?.[0] || null,
      fullResponse: data
    });

    return data;
  } catch (error) {
    console.error('[adminDataApi] fetchAnalyticsEvents: Error occurred:', error);
    throw error;
  }
}
