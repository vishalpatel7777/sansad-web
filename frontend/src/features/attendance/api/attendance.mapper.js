const NATIONAL_AVERAGE = 80;
const STATE_AVERAGE = 78;
const PARLIAMENT_NAME = "Rajya Sabha";

export function mapMember(raw) {
  return {
    id: raw?.srno,
    name: raw?.member_name,
    house: PARLIAMENT_NAME,
    state: raw?.state_ut,
    image: raw?.image_url || `/avatars/${raw?.srno}.jpg`,
  };
}

export function mapSession(raw) {
  const signed = Number(raw?.daysSigned) || 0;
  const presentNotSigned = Number(raw?.daysPresentNotSigned) || 0;
  const absent = Number(raw?.daysNotSigned) || 0;

  const attended = signed + presentNotSigned;
  const total = attended + absent;

  if (total === 0) return null;

  return {
    sessionNumber: isNaN(Number(raw?.session)) ? null : Number(raw?.session),
    name: raw?.session ?? null,
    attended,
    total,
    percentage: Math.round((attended / total) * 100),
  };
}

export function mapAttendance(rawSessions) {
  const sessions = (rawSessions ?? []).map(mapSession).filter(Boolean);

  const totalAttended = sessions.reduce((sum, s) => sum + s.attended, 0);
  const totalDays = sessions.reduce((sum, s) => sum + s.total, 0);

  return {
    summary: {
      parliament: PARLIAMENT_NAME,
      attended: totalAttended,
      total: totalDays,
      percentage: totalDays > 0 ? Math.round((totalAttended / totalDays) * 100) : 0,
      nationalAverage: NATIONAL_AVERAGE,
      stateAverage: STATE_AVERAGE,
      avgPerSession: sessions.length > 0 ? Math.round(totalAttended / sessions.length) : 0,
    },
    sessions,
  };
}
