"use client";

function getVisitorId(): string {
  const key = 'analytics_visitor_id'
  let visitorId = localStorage.getItem(key)
  if (!visitorId) {
    visitorId = crypto.randomUUID()
    localStorage.setItem(key, visitorId)
  }
  return visitorId
}

function getSessionId(): string {
  const key = 'analytics_session_id'
  const timestampKey = 'analytics_session_timestamp'
  const sessionTimeout = 30 * 60 * 1000

  const now = Date.now()
  const lastActivity = localStorage.getItem(timestampKey)

  if (lastActivity && (now - parseInt(lastActivity)) < sessionTimeout) {
    localStorage.setItem(timestampKey, now.toString())
    return localStorage.getItem(key) || crypto.randomUUID()
  }

  const sessionId = crypto.randomUUID()
  localStorage.setItem(key, sessionId)
  localStorage.setItem(timestampKey, now.toString())
  return sessionId
}

export async function trackPageView(path: string): Promise<{ success: boolean; error?: unknown; data?: any }> {
  const eventData = {
    path: path || window.location.pathname,
    referrer: document.referrer || null,
    visitor_id: getVisitorId(),
    session_id: getSessionId(),
    ua: navigator.userAgent,
  }

  try {
    const response = await fetch('/api/analytics/add_event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    return { success: true, data: await response.json() }
  } catch (err: unknown) {
    return { success: false, error: err }
  }
}