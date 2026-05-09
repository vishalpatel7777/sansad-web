import { Outlet } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Sidebar from "@components/persondetails/Sidebar";

export default function PersonGeneralInfo() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRootRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Close sidebar when route changes (mobile)
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen, isMobile]);

  // Set initial sidebar state based on screen size and handle resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-close sidebar when resizing to mobile
      if (mobile) {
        setSidebarOpen(false);
      } else {
        // Auto-open sidebar when resizing to desktop
        setSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden relative bg-slate-50">
      {/* Sidebar - Responsive width */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 z-40
  pt-16 md:pt-0    
          bg-white border-r border-slate-200
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-56 sm:w-64" : "w-0 md:w-16 lg:w-20"}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <Sidebar
          collapsed={!sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
          onClose={handleCloseSidebar}
        />
      </div>

      {/* Overlay - Only on mobile when sidebar is open */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed  inset-0 bg-black/40 z-30 md:hidden transition-opacity duration-300 ease-in-out"
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main content area */}
      <div
        ref={scrollRootRef}
        data-scroll-root
        className="flex-1 overflow-y-auto bg-slate-50 relative w-full"
      >
        {/* Mobile menu button - shows only on mobile when sidebar is closed */}
        {!sidebarOpen && isMobile && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-3 left-3 z-50 p-2 bg-white rounded-lg shadow-lg border border-slate-200 md:hidden hover:bg-slate-50 active:bg-slate-100 transition-colors duration-200"
            aria-label="Open menu"
            title="Open menu"
          >
            <svg
              className="w-5 h-5 text-slate-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}

        {/* Content wrapper with padding to avoid overlap with menu button */}
        <div
          className={`min-h-full ${!sidebarOpen && isMobile ? "pt-16" : ""}`}
        >
            <Outlet context={{ scrollRootRef }} />
         
        </div>
      </div>
    </div>
  );
}
