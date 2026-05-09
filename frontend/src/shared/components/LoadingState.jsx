export default function LoadingState({ message = "Loading…" }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
