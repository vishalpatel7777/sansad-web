import { useMemo } from "react";

const TREND_COUNT = 5;

export default function AttendanceChart({ sessions }) {
  const trendSessions = useMemo(() => sessions.slice(0, TREND_COUNT), [sessions]);

  if (!trendSessions.length) return null;

  return (
    <section className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h3 className="text-lg font-bold text-gray-900 mb-3 pb-3 border-b-2 border-slate-200">
        Attendance Trend (Last {TREND_COUNT} Sessions)
      </h3>

      <div className="py-7">
        <div className="flex items-end justify-around gap-2 h-64">
          {trendSessions.map((session) => (
            <div
              key={session.sessionNumber}
              className="flex flex-col items-center flex-1 max-w-16"
            >
              <p className="text-sm font-bold text-gray-900 mb-2">{session.percentage}%</p>

              <div className="w-full flex items-end" style={{ height: "220px" }}>
                <div
                  className="w-full bg-blue-900 rounded-t transition-all hover:bg-blue-800"
                  style={{ height: `${session.percentage}%` }}
                />
              </div>

              <p className="text-xs text-slate-600 mt-3 text-center">Session</p>
              <p className="text-xs font-bold text-gray-900 text-center">#{session.sessionNumber}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
