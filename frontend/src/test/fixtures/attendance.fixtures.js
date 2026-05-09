// Raw API shapes — exactly what the backend returns before any mapping

export const rawMember = {
  srno: 42,
  member_name: "Priya Sharma",
  state_ut: "Maharashtra",
};

export const rawSessions = [
  { session: "1", daysSigned: 18, daysPresentNotSigned: 0, daysNotSigned: 2 },
  { session: "2", daysSigned: 20, daysPresentNotSigned: 0, daysNotSigned: 5 },
  { session: "3", daysSigned: 0,  daysPresentNotSigned: 0, daysNotSigned: 0 },  // zero-total — must be filtered
  { session: "Budget", daysSigned: 10, daysPresentNotSigned: 0, daysNotSigned: 5 }, // non-numeric session name
];

export const rawSessionsEmpty = [];

// Mapped shapes — what components receive after transformation

export const mappedMember = {
  id: 42,
  name: "Priya Sharma",
  house: "Rajya Sabha",
  state: "Maharashtra",
  image: "/avatars/42.jpg",
};

export const mappedSummary = {
  parliament: "Rajya Sabha",
  attended: 48,   // 18+20+10
  total: 60,      // 20+25+15
  percentage: 80, // Math.round(48/60*100)
  nationalAverage: 80,
  stateAverage: 78,
  avgPerSession: 16, // Math.round(48/3)
};

export const mappedSessions = [
  { sessionNumber: 1,    name: "1",      attended: 18, total: 20, percentage: 90 },
  { sessionNumber: 2,    name: "2",      attended: 20, total: 25, percentage: 80 },
  { sessionNumber: null, name: "Budget", attended: 10, total: 15, percentage: 67 },
];
