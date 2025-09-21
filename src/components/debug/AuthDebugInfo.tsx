"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/lib/context/UserContext";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface ExtendedSession {
  supabase?: {
    access_token: string;
    user_id: string | null;
    expires_at: number | undefined;
  };
}

function truncateToken(token: string, showLength = 20): string {
  if (!token) return "null";
  if (token.length <= showLength) return token;
  return `${token.substring(0, showLength)}...`;
}

function formatTimestamp(timestamp: number | undefined): string {
  if (!timestamp) return "undefined";
  const date = new Date(timestamp * 1000);
  return `${date.toLocaleString()} (${timestamp})`;
}

export function AuthDebugInfo() {
  const { data: session, status } = useSession();
  const { email, userId, accessToken } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);

  const extendedSession = session as ExtendedSession;
  const supabaseData = extendedSession?.supabase;

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-card border rounded-lg shadow-lg p-4 text-sm font-mono z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-base">🔐 Auth Debug</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-muted rounded"
        >
          {isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-muted-foreground">Status:</span>{" "}
          <span className={status === "authenticated" ? "text-green-500" : "text-red-500"}>
            {status}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground">Email:</span>{" "}
          <span className="text-blue-400">{email || "null"}</span>
        </div>

        <div>
          <span className="text-muted-foreground">NextAuth User:</span>{" "}
          <span className="text-blue-400">
            {session?.user?.email ? truncateToken(session.user.email, 25) : "null"}
          </span>
        </div>

        {isExpanded && (
          <>
            <hr className="border-muted" />

            <div className="text-xs text-muted-foreground font-bold">SUPABASE DATA:</div>

            <div>
              <span className="text-muted-foreground">User ID:</span>{" "}
              <span className="text-green-400">
                {userId ? truncateToken(userId, 15) : "null"}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground">Access Token:</span>{" "}
              <span className="text-green-400">
                {accessToken ? truncateToken(accessToken, 30) : "null"}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground">Token Expires:</span>{" "}
              <span className="text-yellow-400">
                {supabaseData?.expires_at
                  ? formatTimestamp(supabaseData.expires_at)
                  : "undefined"
                }
              </span>
            </div>

            <div>
              <span className="text-muted-foreground">Refresh Token:</span>{" "}
              <span className="text-purple-400">
                {session ? "present in session" : "null"}
              </span>
            </div>

            <hr className="border-muted" />

            <div className="text-xs text-muted-foreground font-bold">RAW SESSION:</div>
            <div className="max-h-32 overflow-y-auto bg-muted/50 p-2 rounded text-xs">
              {session ? (
                <pre>{JSON.stringify(session, null, 1)}</pre>
              ) : (
                "No session"
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}