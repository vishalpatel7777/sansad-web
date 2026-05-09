export default function AttendanceTable({ sessions }) {
  if (!sessions.length) {
    return (
      <section className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3 pb-3 border-b-2 border-slate-200">
          Session-wise Detailed Records
        </h3>
        <p className="text-sm text-slate-500 py-6 text-center">No session records available.</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h3 className="text-lg font-bold text-gray-900 mb-3 pb-3 border-b-2 border-slate-200">
        Session-wise Detailed Records
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                Session
              </th>
              <th className="text-center py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                Days Attended
              </th>
              <th className="text-center py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                Total Days
              </th>
              <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                Attendance Rate
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr
                key={session.sessionNumber}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="py-4 px-4">
                  <p className="font-semibold text-gray-900 text-sm">{session.name}</p>
                  <p className="text-xs text-slate-500 mt-1">Session #{session.sessionNumber}</p>
                </td>
                <td className="text-center py-4 px-4">
                  <p className="text-lg font-bold text-gray-900">{session.attended}</p>
                </td>
                <td className="text-center py-4 px-4">
                  <p className="text-lg font-medium text-slate-600">{session.total}</p>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-900 rounded-full"
                          style={{ width: `${session.percentage}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900 w-12 text-right">
                      {session.percentage}%
                    </p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
