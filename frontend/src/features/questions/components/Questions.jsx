import { useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useScrollContext } from "@context/ScrollContext";
import HeaderProfile from "@components/common/HeaderProfile";
import { Download } from "lucide-react";
import useQuestions from "../hooks/useQuestions";
import { LoadingState, EmptyState, PageHeading } from "@/shared/components";
import { getPaginationRange } from "@/shared/utils/pagination";

export default function Questions() {
  const { id } = useParams();
  const {
    member,
    loading,
    records,
    filteredRecords,
    summary,
    uniqueYears,
    uniqueTypes,
    uniqueMinistries,
    currentPage,
    setCurrentPage,
    searchKeyword,
    setSearchKeyword,
    selectedYear,
    setSelectedYear,
    selectedType,
    setSelectedType,
    selectedMinistry,
    setSelectedMinistry,
  } = useQuestions(id);

  const { setCompact, setProfile } = useScrollContext();
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!member) return;

    const scrollRoot = document.querySelector("[data-scroll-root]") || null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCompact = !entry.isIntersecting;

        setCompact(isCompact);

        if (isCompact) {
          setProfile({
            image: member.image,
            title: member.name,
            primaryMeta: [member.house, member.state],
            secondaryMeta: ["Questions"],
          });
        } else {
          setProfile(null);
        }
      },
      {
        root: scrollRoot,
        threshold: 0,
      },
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

  const ROWS_PER_PAGE = 10;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / ROWS_PER_PAGE),
  );

  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages, setCurrentPage]);

  if (loading) return <LoadingState message="Loading questions…" />;
  if (!member) return <EmptyState message="Questions not found." />;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setSearchKeyword("");
    setSelectedYear("");
    setSelectedType("");
    setSelectedMinistry("");
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
  };

  return (
    <div className="bg-slate-50">
      <div ref={sentinelRef} className="h-px" />

      <HeaderProfile
        image={member.image}
        title={member.name}
        badge="MEMBER OF PARLIAMENT"
        primaryMeta={[member.house, member.state]}
        secondaryMeta={[]}
      />

      <div className="pb-2 mt-1">
        <PageHeading
          title="Parliamentary Questions Archive"
          subtitle="Complete record of questions raised in Parliament"
        />

        <section className="mb-2">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-5 ">
            <div className="bg-white  rounded-lg shadow-sm p-4">
              <p className="text-xs justify-center-safe flex uppercase text-slate-400 font-semibold mb-2">
                Total Questions
              </p>
              <p className="text-3xl flex justify-center font-bold text-gray-900">
                {summary.total}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 ">
              <p className="text-xs flex justify-center uppercase text-slate-400 font-semibold mb-2">
                Starred
              </p>
              <p className="text-3xl flex justify-center font-bold text-gray-900">
                {summary.starred}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-xs justify-center-safe flex uppercase text-slate-400 font-semibold mb-2">
                Unstarred
              </p>
              <p className="text-3xl flex justify-center  font-bold text-gray-900">
                {summary.unstarred}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-xs justify-center-safe flex uppercase text-slate-400 font-semibold mb-2">
                Answered
              </p>
              <p className="text-3xl flex justify-center  font-bold text-green-600">
                {summary.answered}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-3 mb-2">
          <h3 className="text-lg font-bold text-gray-900 mb-2 pb-1 border-b-2 border-slate-200">
            Search & Filter
          </h3>

          <div className="flex gap-4">
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
                placeholder="Search questions by subject..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-[35%]">
              <div>
                <label
                  htmlFor="year-filter"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Year
                </label>
                <select
                  id="year-filter"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-1 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  <option value="">All Years</option>
                  {uniqueYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="type-filter"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Type
                </label>
                <select
                  id="type-filter"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-1 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {uniqueTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="ministry-filter"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Ministry
                </label>
                <select
                  id="ministry-filter"
                  value={selectedMinistry}
                  onChange={(e) => setSelectedMinistry(e.target.value)}
                  className="w-full py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  <option value="">All Ministries</option>
                  {uniqueMinistries.map((ministry) => (
                    <option key={ministry} value={ministry}>
                      {ministry}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex h-[20%] w-[25%] mt-5 gap-3 pt-2">
              <button
                onClick={handleApplyFilters}
                className="px-6 py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={handleResetFilters}
                className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
          <div className="pt-2 flex justify-end-safe">
            <p className="text-sm text-slate-600">
              Showing {filteredRecords.length} of {records?.length ?? 0}{" "}
              questions
            </p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2 pb-3 border-b-2 border-slate-200">
            Questions Record
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 text-xs uppercase text-slate-400 font-semibold">
                    Sr. No
                  </th>
                  <th className="text-left py-3 px-2 text-xs uppercase text-slate-400 font-semibold">
                    Q. No
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                    Subject
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                    Session
                  </th>
                  <th className="text-center py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                    Ministry
                  </th>
                  <th className="text-center py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                    Type
                  </th>
                  <th className="text-center py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
                      <p className="text-sm text-slate-500">
                        No questions match your current filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((q, index) => (
                    <tr
                      key={q.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-2 py-2 font-mono font-semibold">
                        {(currentPage - 1) * ROWS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-4 py-4 font-mono font-semibold">
                        {q.qno}
                      </td>
                      <td className="py-4 w-[30%] px-4">
                        <p className="text-sm font-medium text-gray-900 hover:text-blue-900 cursor-pointer">
                          {q.subject}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-600">{q.session}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-600">{q.ministry}</p>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                          {q.type}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <p className="text-sm text-slate-600">
                          {new Date(q.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </td>
                      <td className="text-center py-4 px-4">
                        {q.pdfUrl ? (
                          <a
                            href={q.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Download Question PDF"
                            className="inline-flex items-center justify-center w-8 h-8 text-blue-900 hover:bg-blue-50 rounded"
                          >
                            <Download size={18} />
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredRecords.length > 0 && totalPages > 1 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredRecords.length)} of{" "}
                  {filteredRecords.length} questions
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  {getPaginationRange(currentPage, totalPages).map(
                    (item, idx) =>
                      item === "..." ? (
                        <span
                          key={`dots-${idx}`}
                          className="px-2 text-slate-400"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setCurrentPage(item)}
                          className={`px-3 py-1 border rounded ${
                            item === currentPage
                              ? "bg-blue-900 text-white"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          {item}
                        </button>
                      ),
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
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
