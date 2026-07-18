"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <p className="font-bold text-lg">Something went wrong</p>
        {error.message && (
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {error.message}
          </p>
        )}
        <button
          className="btn-primary px-5 py-2.5 mt-4"
          onClick={reset}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
