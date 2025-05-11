"use client";

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center text-gray-700 dark:text-gray-200">
      <h1 className="text-4xl font-bold mb-4">Unauthorized Access</h1>
      <p className="text-lg">You do not have permission to view this page.</p>
      <p className="text-sm mt-2">Please contact the administrator if you believe this is a mistake.</p>
    </div>
  );
}
