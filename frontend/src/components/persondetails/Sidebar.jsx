import { useRef, useEffect, useMemo } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Menu, X } from "lucide-react";
import { PERSON_SIDEBAR_ITEMS } from "./PersonTableLayout";
import { preloadDashboard } from "@/hooks/useCachedDashboard";
import { preloadCommittees } from "@/features/committees";
import { preloadAssurances } from "@/features/assurances";
import { preloadAttendance } from "@/features/attendance";
import { preloadDebates } from "@/features/debates";
import { preloadGallery } from "@/features/gallery";
import { preloadPrivateBills } from "@/features/privatebills";
import { preloadProfile } from "@/features/profile";
import { preloadQuestions } from "@/features/questions";
import { preloadSpecialMentions } from "@/features/specialmentions";
import { preloadTours } from "@/features/tours";

export default function Sidebar({ collapsed = false, onToggle, onClose }) {
  const { id } = useParams();

  const hasPreloadedRef = useRef({});

  useEffect(() => {
    hasPreloadedRef.current = {};
  }, [id]);

  const preloadMap = useMemo(
    () => ({
      dashboard: () => preloadDashboard(id),

      committees: () => preloadCommittees(id),

      questions: () => preloadQuestions(id),

      debates: () => preloadDebates(id),

      assurances: () => preloadAssurances(id),

      specialmentions: () => preloadSpecialMentions(id),

      attendance: () => preloadAttendance(id),

      privatebills: () => preloadPrivateBills(id),

      gallery: () => preloadGallery(id),

      profile: () => preloadProfile(id),

      tours: () => preloadTours(id),
    }),
    [id],
  );

  const navigate = useNavigate();
  const shouldPreload =
    typeof navigator !== "undefined" &&
    navigator.connection?.effectiveType !== "2g";

  const handleBackClick = () => {
    navigate("/");
    // Close sidebar on mobile after navigation
    if (onClose) onClose();
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after clicking a nav item
    if (window.innerWidth < 768 && onClose) {
      onClose();
    }
  };

  return (
    <aside className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header - Responsive padding */}
      <div className="flex items-center justify-between px-2 sm:px-3 py-2 sm:py-3 border-b border-slate-200 shrink-0 gap-2">
        {/* Mobile Close Button - Shows on mobile when expanded */}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="md:hidden p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors duration-200 flex items-center justify-center shrink-0"
            aria-label="Close menu"
            title="Close menu"
          >
            <X size={18} className="text-slate-700" />
          </button>
        )}

        {/* Mobile Menu Label - Shows on mobile when collapsed */}
        {collapsed && (
          <button
            onClick={onToggle}
            className="md:hidden p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors duration-200 flex items-center justify-center shrink-0"
            aria-label="Open menu"
            title="Open menu"
          >
            <Menu size={18} className="text-slate-700" />
          </button>
        )}

        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-2 py-1 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 active:text-primary/90 transition-colors duration-200 rounded hover:bg-primary/5 flex-1 min-w-0"
          title="Go back"
        >
          <ArrowLeft size={16} className="shrink-0 sm:w-4.5 sm:h-4.5" />
          {!collapsed && (
            <span className="whitespace-nowrap hidden sm:inline truncate">
              Back
            </span>
          )}
        </button>

        {/* Desktop Toggle Button - Only shows on desktop */}
        <button
          onClick={onToggle}
          className="hidden md:block p-1.5 rounded hover:bg-slate-100 active:bg-slate-200 transition-colors duration-200 shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title="Toggle sidebar"
        >
          <Menu size={16} className="sm:w-4.5 sm:h-4.5" />
        </button>
      </div>

      {/* Navigation - Responsive spacing */}
      <nav className="flex flex-col gap-0.5 sm:gap-1 p-1 sm:p-2 flex-1 overflow-y-auto scrollbar-hide">
        {PERSON_SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={`/person/${id}/${item.path}`}
              onClick={handleNavClick}
              onMouseEnter={() => {
                if (!shouldPreload) return;
                if (item.path === "dashboard") {
                  if (typeof requestIdleCallback !== "undefined") {
                    requestIdleCallback(() => import("chart.js"));
                  } else {
                    setTimeout(() => import("chart.js"), 0);
                  }
                }

                if (hasPreloadedRef.current[item.path]) return;

                hasPreloadedRef.current[item.path] = true;
                preloadMap[item.path]?.();
              }}
              onFocus={() => {
                if (!shouldPreload) return;
                if (hasPreloadedRef.current[item.path]) return;

                hasPreloadedRef.current[item.path] = true;
                preloadMap[item.path]?.();
              }}
              className={({ isActive }) =>
                [
                  "flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/15 text-primary font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100",
                  collapsed ? "justify-center" : "justify-start",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className="shrink-0 sm:w-4.5 sm:h-4.5" />
                  {!collapsed && (
                    <span className="truncate text-xs sm:text-sm">
                      {item.label}
                    </span>
                  )}
                  {collapsed && <span className="sr-only">{item.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
