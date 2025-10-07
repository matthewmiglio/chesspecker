"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { bumpLoginStreak } from "@/lib/api/loginStreakApi";

const LoginStreakDisplay = () => {
  const { data: session, status } = useSession();
  const [hasUpdated, setHasUpdated] = useState(false); // to prevent double updates

  useEffect(() => {
    const run = async () => {
      if (
        status === "authenticated" &&
        session?.user?.email &&
        !hasUpdated
      ) {
        // Update the login streak on the server
        await bumpLoginStreak();

        setHasUpdated(true); // prevent re-run
      }
    };

    run();
  }, [status, session, hasUpdated]);

  // Login streak tracking is now write-only - no display
  return null;
};

export default LoginStreakDisplay;
