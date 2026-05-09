export default function AttendanceStats({ summary, sessionCount }) {
  return (
    <section className="bg-white rounded-lg shadow-sm p-4 mb-3">
      <h3 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b-2 border-slate-200">
        Overall Attendance Summary
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="mb-3">
            <p className="text-4xl font-bold text-gray-900">{summary.percentage}%</p>
            <p className="text-sm text-slate-600 mt-1">
              {summary.attended} of {summary.total} sittings attended
            </p>
          </div>

          <div className="mb-3">
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-900 rounded-full transition-all"
                style={{ width: `${summary.percentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 p-2 rounded">
              <p className="text-xs uppercase text-slate-400 font-semibold mb-1">
                National Average
              </p>
              <p className="text-xl font-bold text-gray-900">{summary.nationalAverage}%</p>
            </div>
            <div className="bg-slate-50 p-2 rounded">
              <p className="text-xs uppercase text-slate-400 font-semibold mb-1">
                State Average
              </p>
              <p className="text-xl font-bold text-gray-900">{summary.stateAverage}%</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="text-center p-6 bg-slate-50 rounded-lg w-full">
            <p className="text-xs uppercase text-slate-400 font-semibold mb-2">Parliament</p>
            <p className="text-xl font-bold text-gray-900 mb-4">{summary.parliament}</p>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Total Sessions Recorded: {sessionCount}</p>
              <p>Average per Session: {summary.avgPerSession} days</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
