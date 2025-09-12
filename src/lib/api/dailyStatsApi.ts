"use client";

const BASE = "/api/daily_stats";

async function postTo(endpoint: string): Promise<boolean> {
    try {
        const res = await fetch(`${BASE}/${endpoint}`, { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `POST to ${endpoint} failed`);
        return true;
    } catch (err) {
        return false;
    }
}

export const incrementCorrect = () => postTo("addCorrect");
export const incrementIncorrect = () => postTo("addIncorrect");
export const incrementPuzzleStart = () => postTo("addPuzzleStart");
export const incrementSetCreate = () => postTo("addSetCreate");
export const incrementPuzzleRequest = async (count = 1) => {
    try {
        const res = await fetch(`${BASE}/addPuzzleRequest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ count }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "POST to addPuzzleRequest failed");
        return true;
    } catch (err) {
        return false;
    }
};


export const getAllDailyStats = async () => {
    try {
        const res = await fetch(`${BASE}/getAll`, { method: "GET" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch daily stats");
        return data.days;
    } catch (err) {
        return null;
    }
};
