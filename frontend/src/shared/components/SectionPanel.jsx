export default function SectionPanel({ title, children, className = "" }) {
  return (
    <section className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-bold text-gray-900 mb-2 pb-1 border-b-2 border-slate-200">
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}
