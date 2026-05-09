export default function EmptyState({ title, message }) {
  if (!title) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-900">{title}</p>
        {message && <p className="text-sm text-slate-500 mt-2">{message}</p>}
      </div>
    </div>
  );
}
