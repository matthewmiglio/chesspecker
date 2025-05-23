"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { updateLoginStreak, getLoginStreak } from "@/lib/api/loginStreakApi";
import { Flame } from "lucide-react";

const LoginStreakDisplay = () => {
  const { data: session, status } = useSession();
  const [streak, setStreak] = useState<number | null>(null);
  const [hasUpdated, setHasUpdated] = useState(false); // to prevent double updates

  useEffect(() => {
    const run = async () => {
      if (
        status === "authenticated" &&
        session?.user?.email &&
        !hasUpdated
      ) {
        const email = session.user.email;

        // First update the login streak on the server
        const updated = await updateLoginStreak(email);

        if (updated !== null) {
          setStreak(updated);
        } else {
          // fallback if update fails
          const fallback = await getLoginStreak(email);
          setStreak(fallback);
        }

        setHasUpdated(true); // prevent re-run
      }
    };

    run();
  }, [status, session, hasUpdated]);

  if (status !== "authenticated" || streak === null) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-orange-50 text-orange-600 dark:bg-orange-900 dark:text-orange-200 border border-orange-300 dark:border-orange-700 shadow-sm">
      <Flame className="w-4 h-4" />
      <span>{streak}-day streak</span>
    </div>
  );
};

export default LoginStreakDisplay;
