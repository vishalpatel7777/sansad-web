import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "@pages/Home";
import PersonGeneralInfo from "@pages/PersonGeneralInfo";
import { ErrorBoundary } from "@/shared/components";

function lazyFeature(importFn) {
  return lazy(() => importFn().catch(() => ({ default: ChunkErrorFallback })));
}

function ChunkErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 p-6 text-center">
      <p className="text-lg font-semibold text-gray-900">Failed to load</p>
      <p className="text-sm text-slate-500">
        This section could not be loaded. Check your connection and refresh.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
      >
        Refresh
      </button>
    </div>
  );
}

const Dashboard = lazyFeature(() =>
  import("@/features/dashboard").then((m) => ({ default: m.Dashboard })),
);
const Profile = lazyFeature(() =>
  import("@/features/profile").then((m) => ({ default: m.Profile })),
);
const Attendance = lazyFeature(() =>
  import("@/features/attendance").then((m) => ({ default: m.Attendance })),
);
const Debates = lazyFeature(() =>
  import("@/features/debates").then((m) => ({ default: m.Debates })),
);
const Questions = lazyFeature(() =>
  import("@/features/questions").then((m) => ({ default: m.Questions })),
);
const SpecialMentions = lazyFeature(() =>
  import("@/features/specialmentions").then((m) => ({ default: m.SpecialMentions })),
);
const Assurances = lazyFeature(() =>
  import("@/features/assurances").then((m) => ({ default: m.Assurances })),
);
const Committees = lazyFeature(() =>
  import("@/features/committees").then((m) => ({ default: m.Committees })),
);
const PrivateBills = lazyFeature(() =>
  import("@/features/privatebills").then((m) => ({ default: m.PrivateBills })),
);
const Tours = lazyFeature(() =>
  import("@/features/tours").then((m) => ({ default: m.Tours })),
);
const Gallery = lazyFeature(() =>
  import("@/features/gallery").then((m) => ({ default: m.Gallery })),
);

function FeatureFallback() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <p className="text-sm text-slate-500">Loading...</p>
    </div>
  );
}

function Feature({ children }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<FeatureFallback />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/person/:id" element={<PersonGeneralInfo />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Feature><Dashboard /></Feature>} />
        <Route path="profile" element={<Feature><Profile /></Feature>} />
        <Route path="attendance" element={<Feature><Attendance /></Feature>} />
        <Route path="debates" element={<Feature><Debates /></Feature>} />
        <Route path="questions" element={<Feature><Questions /></Feature>} />
        <Route path="special-mentions" element={<Feature><SpecialMentions /></Feature>} />
        <Route path="assurances" element={<Feature><Assurances /></Feature>} />
        <Route path="committees" element={<Feature><Committees /></Feature>} />
        <Route path="private-bills" element={<Feature><PrivateBills /></Feature>} />
        <Route path="tours" element={<Feature><Tours /></Feature>} />
        <Route path="gallery" element={<Feature><Gallery /></Feature>} />
      </Route>

      <Route path="/analytics" element={<Feature><Dashboard /></Feature>} />
      <Route path="/dashboard/all" element={<Feature><Dashboard /></Feature>} />
    </Routes>
  );
}
