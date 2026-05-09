// Backward-compat barrel — re-exports from feature modules.
// TODO: remove once all consumers import directly from @/features/<name>.
// Only Dashboard.jsx still lives in subcomponents/; all others are in features/.

export { Dashboard } from "@/features/dashboard";
export { Profile } from "@/features/profile";
export { Attendance } from "@/features/attendance";
export { Debates } from "@/features/debates";
export { Questions } from "@/features/questions";
export { SpecialMentions } from "@/features/specialmentions";
export { Assurances } from "@/features/assurances";
export { Committees } from "@/features/committees";
export { PrivateBills } from "@/features/privatebills";
export { Tours } from "@/features/tours";
export { Gallery } from "@/features/gallery";
