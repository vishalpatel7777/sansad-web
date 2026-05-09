import { useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import { formatPhone } from "@utils/formatters";
import useCachedDashboard from "@/hooks/useCachedDashboard";
import HeaderProfile from "@components/common/HeaderProfile";
import { useScrollContext } from "@context/ScrollContext";
import { initializeChart, Chart } from "@utils/chartSetup";

const CHART_COLORS = {
  primary: "#1F2937",
  secondary: "#3B82F6",
  tertiary: "#10B981",
  accent: "#F59E0B",
  neutral: "#D1D5DB",
};

const tooltipConfig = {
  enabled: true,
  backgroundColor: "rgba(31, 41, 55, 0.95)",
  titleColor: "#FFFFFF",
  bodyColor: "#FFFFFF",
  borderColor: "rgba(255, 255, 255, 0.2)",
  borderWidth: 1,
  padding: 12,
  displayColors: false,
  cornerRadius: 6,
  titleFont: { weight: "bold", size: 12 },
  bodyFont: { size: 11 },
};

export default function Dashboard() {
  const { id } = useParams();
  const { compact, setCompact, setProfile } = useScrollContext();
  const { member, aggregate, loading, isAggregateMode } =
    useCachedDashboard(id);

  const sentinelRef = useRef(null);

  const questionsCanvasRef = useRef(null);
  const debateCanvasRef = useRef(null);
  const billsCanvasRef = useRef(null);
  const committeesCanvasRef = useRef(null);
  const mentionsCanvasRef = useRef(null);
  const assurancesCanvasRef = useRef(null);

  const questionsChartRef = useRef(null);
  const debateChartRef = useRef(null);
  const billsChartRef = useRef(null);
  const committeesChartRef = useRef(null);
  const mentionsChartRef = useRef(null);
  const assurancesChartRef = useRef(null);

  useEffect(() => {
      if (!member && isAggregateMode === undefined) return;
  

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCompact = !entry.isIntersecting;

        // update global scroll state
        setCompact(isCompact);

        // when compact → push profile into navbar
        if (isCompact && !isAggregateMode && member) {
          setProfile({
            image: member.image,
            title: member.name,
            primaryMeta: [member.house, member.state],
            secondaryMeta: [member.party, member.email, member.phone],
          });
        } else {
          setProfile(null);
        }
      },
      { threshold: 0 },
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [member, isAggregateMode, setCompact, setProfile]);



  useEffect(() => {
    if (loading) return;
    if (!isAggregateMode && !member?.dashboard) return;
    if (isAggregateMode && !aggregate) return;

    let isMounted = true;

    async function createCharts() {
      await initializeChart();

     
      if (!isMounted) return;

      questionsChartRef.current?.destroy();
      debateChartRef.current?.destroy();
      billsChartRef.current?.destroy();
      committeesChartRef.current?.destroy();
      mentionsChartRef.current?.destroy();
      assurancesChartRef.current?.destroy();

      requestAnimationFrame(() => {
        if (!questionsCanvasRef.current) return;

        /* ================= QUESTIONS ================= */
        const questionsData = isAggregateMode
          ? [
              aggregate.questions.totalStarred,
              aggregate.questions.totalUnstarred,
            ]
          : [
              member.dashboard.questions.starred,
              member.dashboard.questions.unstarred,
            ];

        questionsChartRef.current = new Chart(questionsCanvasRef.current, {
          type: "doughnut",
          data: {
            datasets: [
              {
                data: questionsData,
                backgroundColor: [CHART_COLORS.primary, CHART_COLORS.neutral],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: "70%",
            plugins: { legend: { display: false }, tooltip: tooltipConfig },
          },
        });

        /* ================= DEBATES ================= */
        if (isAggregateMode || member?.dashboard?.debates?.hasData) {
          const debateData = isAggregateMode
            ? [
                aggregate.debates.avgInvolvement,
                100 - aggregate.debates.avgInvolvement,
              ]
            : [
                member.dashboard.debates.involvementPercent,
                100 - member.dashboard.debates.involvementPercent,
              ];

          debateChartRef.current = new Chart(debateCanvasRef.current, {
            type: "doughnut",
            data: {
              datasets: [
                {
                  data: debateData,
                  backgroundColor: [
                    CHART_COLORS.secondary,
                    CHART_COLORS.neutral,
                  ],
                  borderWidth: 0,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              cutout: "70%",
              plugins: { legend: { display: false }, tooltip: tooltipConfig },
            },
          });
        }

        /* ================= BILLS ================= */
        const billsByYear = isAggregateMode
          ? aggregate?.bills?.byYear || {}
          : member?.dashboard?.bills?.byYear || {};

        if (Object.keys(billsByYear).length > 0) {
          billsChartRef.current = new Chart(billsCanvasRef.current, {
            type: "bar",
            data: {
              labels: Object.keys(billsByYear),
              datasets: [
                {
                  data: Object.values(billsByYear),
                  backgroundColor: CHART_COLORS.primary,
                  borderRadius: 6,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              plugins: { legend: { display: false }, tooltip: tooltipConfig },
              scales: { y: { beginAtZero: true } },
            },
          });
        }

        /* ================= COMMITTEES ================= */
        const committeesValue = isAggregateMode
          ? (aggregate?.totals?.committees ?? 0)
          : (member?.dashboard?.totals?.committees ?? 0);

        if (committeesValue > 0) {
          committeesChartRef.current = new Chart(committeesCanvasRef.current, {
            type: "doughnut",
            data: {
              datasets: [
                {
                  data: [committeesValue, 10 - committeesValue],
                  backgroundColor: [
                    CHART_COLORS.tertiary,
                    CHART_COLORS.neutral,
                  ],
                  borderWidth: 0,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              cutout: "70%",
              plugins: { legend: { display: false }, tooltip: tooltipConfig },
            },
          });
        }

        /* ================= SPECIAL MENTIONS ================= */
        const mentionsValue = isAggregateMode
          ? (aggregate?.totals?.specialMentions ?? 0)
          : (member?.dashboard?.totals?.specialMentions ?? 0);

        if (mentionsValue > 0) {
          mentionsChartRef.current = new Chart(mentionsCanvasRef.current, {
            type: "bar",
            data: {
              labels: ["Mentions"],
              datasets: [
                {
                  data: [mentionsValue],
                  backgroundColor: CHART_COLORS.accent,
                  borderRadius: 6,
                },
              ],
            },
            options: {
              indexAxis: "y",
              responsive: true,
              maintainAspectRatio: true,
              plugins: { legend: { display: false }, tooltip: tooltipConfig },
            },
          });
        }

        /* ================= ASSURANCES ================= */
        const assurancesValue = isAggregateMode
          ? (aggregate?.totals?.assurances ?? 0)
          : (member?.dashboard?.totals?.assurances ?? 0);

        if (assurancesValue > 0) {
          assurancesChartRef.current = new Chart(assurancesCanvasRef.current, {
            type: "bar",
            data: {
              labels: ["Assurances"],
              datasets: [
                {
                  data: [assurancesValue],
                  backgroundColor: CHART_COLORS.secondary,
                  borderRadius: 6,
                },
              ],
            },
            options: {
              indexAxis: "y",
              responsive: true,
              maintainAspectRatio: true,
              plugins: { legend: { display: false }, tooltip: tooltipConfig },
            },
          });
        }
      });
    }

    createCharts();

    return () => {
      isMounted = false;
      questionsChartRef.current?.destroy();
      debateChartRef.current?.destroy();
      billsChartRef.current?.destroy();
      committeesChartRef.current?.destroy();
      mentionsChartRef.current?.destroy();
      assurancesChartRef.current?.destroy();
    };
  }, [loading, isAggregateMode, member?.dashboard, aggregate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading dashboard…
      </div>
    );
  }

  if (!isAggregateMode && !member) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading member dashboard…
      </div>
    );
  }

  const data = isAggregateMode ? aggregate : member?.dashboard;

  const heroTitle = isAggregateMode ? "All Members Overview" : member.name;
  const heroSubtitle = isAggregateMode
    ? `Analytics across ${aggregate.totalMembers} members`
    : `${member.house} | ${member.constituency}`;

  return (
    <div className="bg-slate-50">
      <div ref={sentinelRef} className="h-px" />


      {!compact && !isAggregateMode && member && (
        <HeaderProfile
          image={member.image}
          title={member.name}
          badge="MEMBER OF PARLIAMENT"
          primaryMeta={[member.house, member.state]}
          secondaryMeta={[
            member.party,
            member.email,
            member.phone !== "—" ? formatPhone(member.phone) : "—",
          ]}
        />
      )}

      <div className={`py-1 ${compact ? "mt-16" : ""}`}>
        <div className="grid grid-cols-12 gap-2 mb-2">
          <div className="col-span-8 grid grid-cols-2 gap-2">
            <ChartCard title="Questions Asked" canvas={questionsCanvasRef} />
            {member?.dashboard?.debates?.hasData ? (
              <ChartCard title="Debate Involvement" canvas={debateCanvasRef} />
            ) : (
              <NoData label="debate" />
            )}

            {Object.keys(member?.dashboard?.bills?.byYear || {}).length > 0 ? (
              <div className="col-span-1">
                <div className="bg-white shadow-sm rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Bills Participated
                  </h3>
                  <div className="h-48">
                    <canvas ref={billsCanvasRef} />
                  </div>
                </div>
              </div>
            ) : (
              <NoData label="bills" />
            )}

            <div>
              {member?.dashboard?.totals?.assurances > 0 ? (
                <div className="bg-white shadow-sm rounded-xl p-3 h-full">
                  <h3 className="font-bold text-gray-900 mb-2">Assurances</h3>
                  <div className="h-32">
                    <canvas ref={assurancesCanvasRef} />
                  </div>
                </div>
              ) : (
                <NoData label="assurances" />
              )}
            </div>
          </div>

          <div className="col-span-4 space-y-2 ">
            <ProgressCard
              title="Attendance"
              value={
                isAggregateMode
                  ? (aggregate?.attendance?.avgPercentage ?? null)
                  : (member?.dashboard?.attendance?.percentage ?? null)
              }
              attended={
                isAggregateMode
                  ? (aggregate?.attendance?.totalAttended ?? 0)
                  : (member?.dashboard?.attendance?.attended ?? 0)
              }
              total={
                isAggregateMode
                  ? (aggregate?.attendance?.totalSessions ?? 0)
                  : (member?.dashboard?.attendance?.total ?? 0)
              }
              subtitle="Based on recorded attendance sessions"
            />

            {member?.dashboard?.funds ? (
              <FundsCard funds={member.dashboard.funds} />
            ) : (
              <NoData label="funds" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            {member?.dashboard?.totals?.committees > 0 ? (
              <ChartCard
                title="Committee Memberships"
                canvas={committeesCanvasRef}
              />
            ) : (
              <NoData label="committee membership" />
            )}
          </div>

          <div>
            {member?.dashboard?.totals?.specialMentions > 0 ? (
              <div className="bg-white shadow-sm rounded-xl p-6 h-full">
                <h3 className="font-bold text-gray-900 mb-4">
                  Special Mentions
                </h3>
                <div className="h-32">
                  <canvas ref={mentionsCanvasRef} />
                </div>
              </div>
            ) : (
              <NoData label="special mentions" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, canvas }) {
  return (
    <div className="bg-white shadow-sm rounded-xl p-6">
      <h3 className="font-bold text-gray-900 mb-4">{title}</h3>
      <div className="flex justify-center">
        <div className="w-32 h-32">
          <canvas ref={canvas} />
        </div>
      </div>
    </div>
  );
}

function ProgressCard({ title, value, attended, total, subtitle }) {
  if (value === null) {
    return <NoData label="attendance" />;
  }

  return (
    <div className="bg-white shadow-sm rounded-xl p-6">
      <p className="text-xs uppercase text-slate-400 font-semibold">{title}</p>
      <p className="text-4xl font-bold text-gray-900 mt-2">{value}%</p>
      <p className="text-xs text-slate-600 mt-1">
        {attended} / {total} Sessions
      </p>
      <div className="h-2 bg-slate-200 mt-3 rounded">
        <div
          className="h-full bg-blue-900 rounded"
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-2">{subtitle}</p>
    </div>
  );
}

function FundsCard({ funds }) {
  const totalWidth = funds.total;
  const utilizedWidth = (funds.utilized / totalWidth) * 100;
  const committedWidth = (funds.committed / totalWidth) * 100;
  const remainingWidth = (funds.remaining / totalWidth) * 100;

  return (
    <div className="bg-white shadow-sm rounded-xl p-2">
      <p className="font-bold text-gray-900 mb-4">MPLADS Fund Utilization</p>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-900">
          ₹ {funds.utilized.toFixed(2)} Cr / ₹ {funds.total.toFixed(2)} Cr
        </span>
        <span className="font-bold text-gray-900">{funds.efficiency}%</span>
      </div>
      <div className="flex h-3 bg-slate-200 rounded overflow-hidden">
        <div className="bg-blue-900" style={{ width: `${utilizedWidth}%` }} />
        <div className="bg-blue-500" style={{ width: `${committedWidth}%` }} />
        <div className="bg-slate-300" style={{ width: `${remainingWidth}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-3 text-center">
        <div>
          <p className="font-semibold">UTILISED</p>
        </div>
        <div>
          <p className="font-semibold">COMMITTED</p>
        </div>
        <div>
          <p className="font-semibold">BALANCE</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
        <div>
          <p className="text-gray-900 font-bold">
            ₹{funds.utilized.toFixed(2)} Cr
          </p>
        </div>
        <div>
          <p className="text-gray-900 font-bold">
            ₹{funds.committed.toFixed(2)} Cr
          </p>
        </div>
        <div>
          <p className="text-gray-900 font-bold">
            ₹{funds.remaining.toFixed(2)} Cr
          </p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500 uppercase font-semibold mb-2">
          Sector Breakdown
        </p>
        <div className="space-y-1 text-xs text-slate-600">
          <p>SECTOR: INFRASTRUCTURE ({funds.sectors.infrastructure}%)</p>
          <p>SECTOR: HEALTHCARE ({funds.sectors.healthcare}%)</p>
          <p>SECTOR: EDUCATION ({funds.sectors.education}%)</p>
        </div>
      </div>
    </div>
  );
}

function NoData({ label }) {
  return (
    <div className="bg-white shadow-sm rounded-xl p-6 flex items-center justify-center h-full">
      <p className="text-sm text-slate-500 font-semibold">
        No {label} data found
      </p>
    </div>
  );
}
