// Single source of truth for all route paths.
// Use these constants in <Link to={ROUTES.HOME}> and <Route path={ROUTES.HOME}>.

export const ROUTES = {
  HOME: "/",

  // Member detail root — use buildPersonRoute() for parameterized URLs
  PERSON: "/person/:id",

  // Member sub-tabs
  PERSON_DASHBOARD: "dashboard",
  PERSON_PROFILE: "profile",
  PERSON_ATTENDANCE: "attendance",
  PERSON_DEBATES: "debates",
  PERSON_QUESTIONS: "questions",
  PERSON_SPECIAL_MENTIONS: "special-mentions",
  PERSON_ASSURANCES: "assurances",
  PERSON_COMMITTEES: "committees",
  PERSON_PRIVATE_BILLS: "private-bills",
  PERSON_TOURS: "tours",
  PERSON_GALLERY: "gallery",

  // Aggregate views
  ANALYTICS: "/analytics",
  DASHBOARD_ALL: "/dashboard/all",
};

/** Build a concrete member URL from a member id. */
export function buildPersonRoute(id) {
  return `/person/${id}`;
}
