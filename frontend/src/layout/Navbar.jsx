import HeaderProfileMini from "@components/common/HeaderProfileMini";
import { useScrollContext } from "@context/ScrollContext";

export default function Navbar() {
  const { compact, profile } = useScrollContext();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div
        className={`flex items-center px-10 transition-all duration-300 ${
          compact ? "py-2 gap-3" : "py-4 justify-between"
        }`}
      >
        {/* LEFT ZONE */}
        <div className="flex items-center gap-3">
          {/* Logo icon (always visible) */}
          <div className="text-blue-900 size-6 shrink-0">
            <svg viewBox="0 0 48 48" fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z"
              />
            </svg>
          </div>

          {/* Brand text – ONLY when not compact */}
          {!compact && (
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              Sansad
            </h2>
          )}

          {/* Profile docks NEXT to logo when compact */}
          {compact && profile && <HeaderProfileMini {...profile} />}
        </div>

        {/* RIGHT ZONE – Login ONLY when not compact */}
        {!compact && (
          <button
            className="h-10 px-4 text-sm font-bold text-white rounded-lg bg-blue-900 opacity-50 cursor-not-allowed"
            disabled
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
