import members from "@data/members";

export function aggregateAllMembers() {
  const agg = {
    totalMembers: members.length,
    summary: {
      questions: 0,
      debates: 0,
      bills: 0,
      committees: 0,
      specialMentions: 0,
      assurances: 0,
    },
    attendance: {
      avgPercentage: 0,
      totalAttended: 0,
      totalSessions: 0,
      natAvg: 0,
    },
    funds: {
      totalAllocated: 0,
      totalUtilized: 0,
      totalCommitted: 0,
      totalRemaining: 0,
      avgEfficiency: 0,
      sectors: {
        infrastructure: 0,
        healthcare: 0,
        education: 0,
      },
    },
    questions: {
      totalAsked: 0,
      totalStarred: 0,
      totalUnstarred: 0,
    },
    debates: {
      totalHours: 0,
      totalZeroHour: 0,
      totalBudget: 0,
      avgInvolvement: 0,
    },
    bills: {
      totalBills: 0,
      byYear: {
        2021: 0,
        2022: 0,
        2023: 0,
        2024: 0,
      },
    },
  };

  members.forEach((member) => {
    const d = member.dashboard;

    agg.summary.questions += d.summary.questions;
    agg.summary.debates += d.summary.debates;
    agg.summary.bills += d.summary.bills;
    agg.summary.committees += d.summary.committees;
    agg.summary.specialMentions += d.summary.specialMentions;
    agg.summary.assurances += d.summary.assurances;

    agg.attendance.totalAttended += d.attendance.attended;
    agg.attendance.totalSessions += d.attendance.total;
    agg.attendance.natAvg = d.attendance.nationalAverage;

    agg.funds.totalAllocated += d.funds.total;
    agg.funds.totalUtilized += d.funds.utilized;
    agg.funds.totalCommitted += d.funds.committed;
    agg.funds.totalRemaining += d.funds.remaining;
    agg.funds.sectors.infrastructure += d.funds.sectors.infrastructure;
    agg.funds.sectors.healthcare += d.funds.sectors.healthcare;
    agg.funds.sectors.education += d.funds.sectors.education;

    agg.questions.totalAsked += d.questions.total;
    agg.questions.totalStarred += d.questions.starred;
    agg.questions.totalUnstarred += d.questions.unstarred;

    agg.debates.totalHours += d.debates.hours;
    agg.debates.totalZeroHour += d.debates.zeroHour;
    agg.debates.totalBudget += d.debates.budget;
    agg.debates.avgInvolvement += d.debates.involvementPercent;

    agg.bills.totalBills += d.bills.total;
    agg.bills.byYear[2021] += d.bills.byYear[2021];
    agg.bills.byYear[2022] += d.bills.byYear[2022];
    agg.bills.byYear[2023] += d.bills.byYear[2023];
    agg.bills.byYear[2024] += d.bills.byYear[2024];
  });

  agg.attendance.avgPercentage = Math.round(
    (agg.attendance.totalAttended / agg.attendance.totalSessions) * 100,
  );
  agg.funds.avgEfficiency = Math.round(
    (agg.funds.totalUtilized / agg.funds.totalAllocated) * 100,
  );
  agg.debates.avgInvolvement = Math.round(
    agg.debates.avgInvolvement / members.length,
  );

  agg.funds.sectors.infrastructure = Math.round(
    agg.funds.sectors.infrastructure / members.length,
  );
  agg.funds.sectors.healthcare = Math.round(
    agg.funds.sectors.healthcare / members.length,
  );
  agg.funds.sectors.education = Math.round(
    agg.funds.sectors.education / members.length,
  );

  return agg;
}
