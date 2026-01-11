"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useToast } from "@/lib/context/ToastContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Check, Loader2, Lock } from "lucide-react";

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const { profile, loading, hasUsername, updateUsername } = useUserProfile();
  const { success, error: showError } = useToast();

  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Initialize username field when profile loads
  useEffect(() => {
    if (profile?.username) {
      setUsername(profile.username);
    }
  }, [profile?.username]);

  // Validate username as user types
  const validateUsername = (value: string): string | null => {
    if (!value) return "Username is required";
    if (value.length > 20) return "Maximum 20 characters";
    if (!/^[a-zA-Z0-9]+$/.test(value)) return "Only letters and numbers allowed";
    return null;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    setValidationError(validateUsername(value));
  };

  const handleSave = async () => {
    const trimmed = username.trim();
    const error = validateUsername(trimmed);
    if (error) {
      setValidationError(error);
      return;
    }

    setSaving(true);
    const ok = await updateUsername(trimmed);
    setSaving(false);

    if (ok) {
      success("Username set successfully!");
    } else {
      showError("Failed to set username. It may already be taken.");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-400" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.1)" }}
            >
              <User className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1
                className="text-3xl text-white font-light tracking-wide"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Profile
              </h1>
              <p className="text-neutral-500 text-sm mt-1">{profile?.email}</p>
            </div>
          </div>
          <div className="w-24 h-px bg-gradient-to-r from-red-400/50 to-transparent" />
        </div>

        {/* Username Section */}
        <div
          className="rounded-lg p-6 border"
          style={{
            background: "rgba(255,255,255,0.02)",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <h2 className="text-lg text-white font-medium mb-2">Username</h2>

          {hasUsername ? (
            // Username already set - show as locked/permanent
            <>
              <p className="text-neutral-400 text-sm mb-6">
                Your username is set and cannot be changed.
              </p>
              <div className="flex items-center gap-3 p-4 rounded-md bg-black/30 border border-neutral-800">
                <Lock className="w-5 h-5 text-neutral-500" />
                <span className="text-white font-medium text-lg">{profile?.username}</span>
              </div>
            </>
          ) : (
            // No username yet - show input form
            <>
              <p className="text-neutral-400 text-sm mb-6">
                Choose a unique username to display instead of your email. Only letters and numbers allowed (max 20 characters).
                <span className="text-yellow-500 font-medium"> This cannot be changed once set.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="Enter username"
                    maxLength={20}
                    className="bg-black/50 border-neutral-800 text-white placeholder:text-neutral-600"
                    disabled={saving}
                  />
                  {validationError && (
                    <p className="text-red-400 text-sm mt-2">{validationError}</p>
                  )}
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving || !!validationError || !username.trim()}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Set Username
                </Button>
              </div>

              {/* Current display name preview */}
              <div className="mt-6 pt-6 border-t border-neutral-800">
                <p className="text-neutral-500 text-sm">
                  Display name preview:{" "}
                  <span className="text-white font-medium">
                    {username || profile?.email?.split("@")[0] || "User"}
                  </span>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Account Info */}
        <div
          className="rounded-lg p-6 border mt-6"
          style={{
            background: "rgba(255,255,255,0.02)",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <h2 className="text-lg text-white font-medium mb-4">Account</h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-neutral-400">Email</span>
              <span className="text-white">{profile?.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-neutral-800">
              <span className="text-neutral-400">Tier</span>
              <span
                className={`font-medium ${
                  profile?.tier === "premium" ? "text-yellow-400" : "text-neutral-300"
                }`}
              >
                {profile?.tier === "premium" ? "Premium" : "Free"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
