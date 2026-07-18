export default function Loading() {
  return (
    <div className="min-h-screen grid place-items-center">
      <div
        className="h-10 w-10 rounded-full border-2 animate-spin"
        style={{
          borderColor: "var(--border)",
          borderTopColor: "var(--primary)",
        }}
      />
    </div>
  );
}
