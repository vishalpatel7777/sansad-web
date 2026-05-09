// Dashboard feature component — re-exports from the legacy location.
// The Dashboard component is large and tightly coupled to aggregate analytics;
// it will be refactored in a later phase. For now we proxy the export here so
// routes can import from @/features/dashboard without touching the original file.
export { default } from "@components/persondetails/subcomponents/Dashboard";
