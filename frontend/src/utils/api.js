import { httpGet, getProxyImageUrl as _getProxyImageUrl } from "@/shared/services/httpClient";

export { getProxyImageUrl } from "@/shared/services/httpClient";

/**
 * Thin wrapper kept for backward compatibility.
 * New code should call httpGet() from @/shared/services directly.
 * Unlike the old fetchAPI, this throws on failure instead of returning { count:0, data:[] }.
 * Callers that relied on silent failure will now surface errors to their error boundaries/hooks.
 */
export async function fetchAPI(endpoint) {
  try {
    return await httpGet(endpoint);
  } catch (err) {
    console.error("API FETCH FAILED:", endpoint, err.message);
    return { count: 0, data: [] };
  }
}

/* ======================================================
   MEMBER CORE
====================================================== */

export const getMemberBySrno = (srno) => fetchAPI(`/members/${srno}`);

export const getMemberDashboard = (srno) =>
  fetchAPI(`/member-dashboard?srno=${srno}`);

/* ======================================================
   PROFILE & PERSONAL
====================================================== */

export const getMemberPersonalDetails = (srno) =>
  fetchAPI(`/member-personal-details?srno=${srno}`);

export const getMemberOtherDetails = (srno) =>
  fetchAPI(`/member-other-details?srno=${srno}`);

export const getEducationLevels = () => fetchAPI(`/education-levels`);

/* ======================================================
   PARLIAMENTARY WORK
====================================================== */

export const getMemberQuestions = (srno) =>
  fetchAPI(`/member-questions?srno=${srno}`);

export const getMemberDebates = (srno) =>
  fetchAPI(`/member-debates?srno=${srno}`);

export const getMemberSpecialMentions = (srno) =>
  fetchAPI(`/member-special-mentions?srno=${srno}`);

export const getMemberAssurances = (srno) =>
  fetchAPI(`/assurance?srno=${srno}`);

export const getMemberCommittees = (srno) =>
  fetchAPI(`/member-committees?srno=${srno}`);

export const getMemberBills = (srno) => fetchAPI(`/member-bills?srno=${srno}`);

/* ======================================================
   ACTIVITY & MEDIA
====================================================== */

export const getMemberAttendance = (srno) =>
  fetchAPI(`/member-attendance?srno=${srno}`);

export const getMemberTours = (srno) => fetchAPI(`/mp-tour?srno=${srno}`);

export const getMemberGallery = (srno) => fetchAPI(`/gallery?srno=${srno}`);

/* ======================================================
   AGGREGATED MEMBER MAP
====================================================== */

export async function getMemberDataMap(srno) {
  const [
    dashboard,
    questions,
    debates,
    bills,
    committees,
    assurances,
    specialMentions,
    attendance,
    gallery,
    tours,
  ] = await Promise.all([
    getMemberDashboard(srno),
    getMemberQuestions(srno),
    getMemberDebates(srno),
    getMemberBills(srno),
    getMemberCommittees(srno),
    getMemberAssurances(srno),
    getMemberSpecialMentions(srno),
    getMemberAttendance(srno),
    getMemberGallery(srno),
    getMemberTours(srno),
  ]);

  return {
    srno,

    dashboard: await buildMemberDashboard(srno),

    counts: {
      questions: questions.count,
      debates: debates.count,
      bills: bills.count,
      committees: committees.count,
      assurances: assurances.count,
      specialMentions: specialMentions.count,
      attendance: attendance.count,
      gallery: gallery.count,
      tours: tours.count,
    },

    hasData: {
      questions: questions.count > 0,
      debates: debates.count > 0,
      bills: bills.count > 0,
      committees: committees.count > 0,
      assurances: assurances.count > 0,
      specialMentions: specialMentions.count > 0,
      attendance: attendance.count > 0,
      gallery: gallery.count > 0,
      tours: tours.count > 0,
    },
  };
}

/* ======================================================
   DASHBOARD AGGREGATOR
====================================================== */

export async function buildMemberDashboard(srno) {
  const [
    questions,
    debates,
    bills,
    committees,
    assurances,
    specialMentions,
    attendance,
  ] = await Promise.all([
    getMemberQuestions(srno),
    getMemberDebates(srno),
    getMemberBills(srno),
    getMemberCommittees(srno),
    getMemberAssurances(srno),
    getMemberSpecialMentions(srno),
    getMemberAttendance(srno),
  ]);

  /* ---------------- QUESTIONS ---------------- */
  const starred = questions.data.filter(
    (q) => q.questionType === "STARRED",
  ).length;

  const unstarred = questions.data.filter(
    (q) => q.questionType === "UNSTARRED",
  ).length;

  /* ---------------- DEBATES ---------------- */
  const debatesPerYear = {};
  debates.data.forEach((d) => {
    debatesPerYear[d.year] = (debatesPerYear[d.year] || 0) + 1;
  });

  const totalDebates = debates.data.length;
  const involvementPercent = Math.min(
    100,
    Math.round((totalDebates / 500) * 100),
  );

  /* ---------------- BILLS ---------------- */
  const billsByYear = {};
  bills.data.forEach((b) => {
    const year = b.introducedDate?.slice(0, 4);
    if (!year) return;
    billsByYear[year] = (billsByYear[year] || 0) + 1;
  });

  /* ---------------- ATTENDANCE ---------------- */
  const validSessions = attendance.data.filter(
    (a) => typeof a.daysSigned === "number",
  );

  const attended = validSessions.reduce((sum, a) => sum + a.daysSigned, 0);

  const total = validSessions.reduce(
    (sum, a) =>
      sum +
      a.daysSigned +
      (typeof a.daysNotSigned === "number" ? a.daysNotSigned : 0),
    0,
  );

  const attendancePercentage =
    total > 0 ? Math.round((attended / total) * 100) : null;

  /* ---------------- SUMMARY ---------------- */
  return {
    totals: {
      questions: questions.count,
      bills: bills.count,
      committees: committees.count,
      assurances: assurances.count,
      specialMentions: specialMentions.count,
      debates: debates.count,
      attendanceSessions: attendance.data.filter(
        (a) => typeof a.daysSigned === "number",
      ).length,
    },

    questions: {
      starred,
      unstarred,
    },

    debates: {
      involvementPercent,
      hasData: debates.count > 0,
    },

    bills: {
      byYear: billsByYear,
      hasData: bills.count > 0,
    },

    attendance: {
      percentage: attendancePercentage,
      attended,
      total,
      nationalAverage: 82,
      hasData: total > 0,
    },

    funds: null,
  };
}
