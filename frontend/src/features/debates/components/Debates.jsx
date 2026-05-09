import { useParams } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { Download } from "lucide-react";
import useDebates from "../hooks/useDebates";
import { useScrollContext } from "@context/ScrollContext";
import HeaderProfile from "@components/common/HeaderProfile";
import { LoadingState, EmptyState, PageHeading } from "@/shared/components";
import { getPaginationRange } from "@/shared/utils/pagination";

export default function Debates() {
  const { id } = useParams();
  const { records, member, summary, loading } = useDebates(id);

  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const { setCompact, setProfile } = useScrollContext();
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!member) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCompact = !entry.isIntersecting;

        setCompact(isCompact);

        if (isCompact) {
          setProfile({
            image: member.image,
            title: member.name,
            primaryMeta: [member.house, member.state],
            secondaryMeta: ["Debates"],
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

    return () => {
      observer.disconnect();
      setCompact(false);
      setProfile(null);
    };
  }, [member]);

  const safeRecords = records ?? [];

  const filteredRecords = useMemo(() => {
    return safeRecords.filter((record) => {
      const matchesKeyword =
        !searchKeyword ||
        (record.title ?? "")
          .toLowerCase()
          .includes(searchKeyword.toLowerCase()) ||
        (record.excerpt ?? "")
          .toLowerCase()
          .includes(searchKeyword.toLowerCase()) ||
        (record.subject ?? "")
          .toLowerCase()
          .includes(searchKeyword.toLowerCase());

      const matchesSession =
        !selectedSession || record.session === selectedSession;

      const matchesYear =
        !selectedYear || record.year.toString() === selectedYear;

      return matchesKeyword && matchesSession && matchesYear;
    });
  }, [safeRecords, searchKeyword, selectedSession, selectedYear]);

  const ROWS_PER_PAGE = 6;
  const totalTablePages = Math.ceil(filteredRecords.length / ROWS_PER_PAGE);
  const tableStartIndex = (currentTablePage - 1) * ROWS_PER_PAGE;
  const tableEndIndex = tableStartIndex + ROWS_PER_PAGE;
  const currentTableRecords = filteredRecords.slice(
    tableStartIndex,
    tableEndIndex,
  );

  const uniqueSessions = useMemo(() => {
    return [...new Set(safeRecords.map((r) => r.session))].sort();
  }, [safeRecords]);

  const uniqueYears = useMemo(() => {
    return [...new Set(safeRecords.map((r) => r.year))].sort((a, b) => b - a);
  }, [safeRecords]);

  const handleApplyFilters = () => {
    setCurrentTablePage(1);
  };

  const handleResetFilters = () => {
    setSearchKeyword("");
    setSelectedSession("");
    setSelectedYear("");
    setCurrentTablePage(1);
  };

  const handleTablePageChange = (page) => {
    setCurrentTablePage(page);
    document.getElementById("debates-table-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading) return <LoadingState message="Loading debates…" />;

  if (!safeRecords.length)
    return (
      <EmptyState
        title="Debates record not found"
        message="This member has no recorded debates."
      />
    );

  return (
    <div className="bg-slate-50 ">
      <div ref={sentinelRef} className="h-px" />

      {member && (
        <HeaderProfile
          image={member.image}
          title={member.name}
          badge="MEMBER OF PARLIAMENT"
          primaryMeta={[member.house, member.state]}
          secondaryMeta={[]}
        />
      )}

      <div className="py-2">
        <PageHeading
          title="Parliamentary Debates Archive"
          subtitle="Complete record of parliamentary interventions and contributions"
        />

        <section className="bg-white rounded-lg shadow-sm p-3 mb-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2 pb-1 border-b-2 border-slate-200">
            Summary Statistics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">
                {summary?.totalDebates ?? 0}
              </p>
              <p className="text-sm text-slate-600 mt-1 uppercase font-semibold">
                Total Debates
              </p>
            </div>

            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">
                {summary?.speakingInstances ?? 0}
              </p>
              <p className="text-sm text-slate-600 mt-2 uppercase font-semibold">
                Speaking Instances
              </p>
            </div>

            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">
                {summary?.lastParticipated ?? "—"}
              </p>
              <p className="text-sm text-slate-600 mt-2 uppercase font-semibold">
                Last Participated
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-4 mt-2 mb-2">
          <h3 className="text-lg font-bold text-gray-900 mb-2 pb-2 border-b-2 border-slate-200">
            Search & Filter
          </h3>

          <div className="space-y-2 flex gap-6  ">
            <div className="w-[50%]">
              <label
                htmlFor="keyword-search"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Search by Keyword
              </label>
              <input
                id="keyword-search"
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search debates by title, subject, or content..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>
            <div className="flex gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="session-filter"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Filter by Session
                  </label>
                  <select
                    id="session-filter"
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  >
                    <option value="">All Sessions</option>
                    {uniqueSessions.map((session) => (
                      <option key={session} value={session}>
                        {session}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="year-filter"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Filter by Year
                  </label>
                  <select
                    id="year-filter"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  >
                    <option value="">All Years</option>
                    {uniqueYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 h-[50%] mt-8">
                <button
                  onClick={handleApplyFilters}
                  className="px-4 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
          <div className="pt-2 justify-end-safe flex">
            <p className="text-sm text-slate-600">
              Showing {filteredRecords.length} of {safeRecords.length} debates
            </p>
          </div>
        </section>

        <section
          id="debates-table-section"
          className="bg-white rounded-lg shadow-sm p-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b-2 border-slate-200">
            Detailed Debate Records
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 text-xs uppercase text-slate-400 font-semibold">
                    S. No
                  </th>
                  <th className="text-left py-3 px-3 text-xs uppercase text-slate-400 font-semibold">
                    Debate Title
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                    Subject
                  </th>
                  <th className="text-left py-3 px-8 text-xs uppercase text-slate-400 font-semibold">
                    Ministry
                  </th>
                  <th className="text-center py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                    Session
                  </th>
                  <th className="text-center py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                    Debate Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                    Question Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentTableRecords.map((debate, index) => (
                  <tr
                    key={debate.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-2  px-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {tableStartIndex + index + 1}
                      </p>
                    </td>
                    <td className="py-3 w-full">
                      <p className="text-sm font-semibold text-gray-900">
                        {debate.title}
                      </p>
                    </td>
                    <td className="py-3 px-1 w-full">
                      <p className="text-sm text-slate-600">{debate.subject}</p>
                    </td>
                    <td className="py-4 px-1 w-full">
                      <p className="text-sm text-slate-600">
                        {debate.ministry}
                      </p>
                    </td>
                    <td className="text-center py-4 ">
                      <p className="text-sm text-slate-600">{debate.session}</p>
                    </td>
                    <td className="text-left py-4 w-full">
                      <p className="text-sm text-slate-600">
                        {debate.date
                          ? new Date(debate.date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </p>
                    </td>
                    <td className="py-4 px-2 w-full">
                      <p className="text-sm text-slate-600">
                        {debate.debateType}
                      </p>
                    </td>
                    <td className="py-4 px-8">
                      <p className="text-sm text-slate-600">
                        {debate.questionType}
                      </p>
                    </td>
                    <td className="text-right">
                      <a
                        href={debate.pdfUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 text-blue-900 hover:bg-blue-50 rounded transition-colors"
                        title="Download PDF"
                      >
                        <Download size={18} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-slate-500">
                No debates match your current filters.
              </p>
            </div>
          )}

          {filteredRecords.length > 0 && totalTablePages > 1 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Showing {tableStartIndex + 1} to{" "}
                  {Math.min(tableEndIndex, filteredRecords.length)} of{" "}
                  {filteredRecords.length} debates
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTablePageChange(currentTablePage - 1)}
                    disabled={currentTablePage === 1}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {getPaginationRange(currentTablePage, totalTablePages).map(
                    (page, i) =>
                      page === "..." ? (
                        <span
                          key={`dots-${i}`}
                          className="px-3 py-2 text-slate-400"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handleTablePageChange(page)}
                          className={`px-4 py-2 font-semibold rounded-lg transition-colors ${
                            currentTablePage === page
                              ? "bg-blue-900 text-white"
                              : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                  )}
                  <button
                    onClick={() => handleTablePageChange(currentTablePage + 1)}
                    disabled={currentTablePage === totalTablePages}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
