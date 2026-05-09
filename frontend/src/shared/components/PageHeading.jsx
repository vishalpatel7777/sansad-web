export default function PageHeading({ title, subtitle }) {
  return (
    <div className="mb-2 px-2">
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
    </div>
  );
}
