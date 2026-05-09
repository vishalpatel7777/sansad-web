import { useParams } from "react-router-dom";
import { useCallback, useRef, useEffect, useMemo } from "react";
import { useScrollContext } from "@context/ScrollContext";
import HeaderProfile from "@components/common/HeaderProfile";
import useAssurances from "../hooks/useAssurances";
import { LoadingState, EmptyState, PageHeading } from "@/shared/components";

export default function Assurances() {
  const { id } = useParams();
  const { setCompact, setProfile } = useScrollContext();

  const {
    member,
    loading,
    summary,
    filteredRecords,
    formattedRecords,
    uniqueStatuses,
    uniqueYears,
    uniqueMinistries,
    currentPage,
    setCurrentPage,
    searchKeyword,
    setSearchKeyword,
    selectedStatus,
    setSelectedStatus,
    selectedMinistry,
    setSelectedMinistry,
    selectedYear,
    setSelectedYear,
  } = useAssurances(id);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!member) return;

    const scrollRoot = document.querySelector("[data-scroll-root]");

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCompact = !entry.isIntersecting;

        setCompact(isCompact);

        if (isCompact) {
          setProfile({
            image: member.image,
            title: member.name,
            primaryMeta: [member.house, member.state],
            secondaryMeta: ["Assurances"],
          });
        } else {
          setProfile(null);
        }
      },
      { root: scrollRoot, threshold: 0 },
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      observer.disconnect();
      setCompact(false);
      setProfile(null);
    };
  }, [member, setCompact, setProfile]);

  const ROWS_PER_PAGE = 5;
  const totalPages = Math.ceil(filteredRecords.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const currentRecords = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return formattedRecords.slice(start, start + ROWS_PER_PAGE);
  }, [formattedRecords, currentPage]);

  const formatSource = useCallback((source) => {
    if (!source) return "–";
    const upper = source.toUpperCase();
    if (
      upper.startsWith("USQ") ||
      upper.startsWith("SSQ") ||
      upper.startsWith("LSQ") ||
      upper.startsWith("RSQ")
    ) {
      return "QUESTION";
    }
    return source;
  }, []);

  const formatAssuranceNo = useCallback((no) => {
    if (!no) return "–";
    return no.replace(/^\s*\/\s*/, "").trim();
  }, []);

  const paginationRange = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (left > 1) {
      rangeWithDots.push(1);
      if (left > 2) rangeWithDots.push("...");
    }

    rangeWithDots.push(...range);

    if (right < totalPages) {
      if (right < totalPages - 1) rangeWithDots.push("...");
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);

  if (loading) return <LoadingState message="Loading Assurances..." />;

  if (!member)
    return (
      <EmptyState
        title="Assurances record not found"
        message="The assurances record you are looking for does not exist."
      />
    );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setSearchKeyword("");
    setSelectedStatus("");
    setSelectedMinistry("");
    setSelectedYear("");
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
  };

  return (
    <div className="bg-slate-50 ">
      <div ref={sentinelRef} className="h-px" />
      <HeaderProfile
        image={member.image}
        title={member.name}
        badge="MEMBER OF PARLIAMENT"
        primaryMeta={[member.house, member.state]}
        secondaryMeta={[]}
      />

      <div className="mt-1 pb-2">
        <PageHeading
          title="Parliamentary Assurances Tracker"
          subtitle="Official compliance record of parliamentary assurances and their fulfillment status"
        />

        <section className="mb-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-3">
              <p className="flex justify-center-safe text-xs  uppercase text-slate-400 font-semibold mb-2">
                Total Assurances
              </p>
              <p className="text-3xl flex justify-center-safe font-bold text-gray-900">
                {summary.total}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3">
              <p className="flex justify-center-safe text-xs uppercase text-slate-400 font-semibold mb-2">
                Fulfilled
              </p>
              <p className="flex justify-center-safe text-4xl font-bold text-green-600">
                {summary.fulfilled}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3">
              <p className="flex justify-center-safe text-xs uppercase text-slate-400 font-semibold mb-2">
                Pending
              </p>
              <p className="flex justify-center-safe text-4xl font-bold text-yellow-600">
                {summary.pending}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3">
              <p className="flex justify-center-safe text-xs uppercase text-slate-400 font-semibold mb-2">
                Partially Fulfilled
              </p>
              <p className="flex justify-center-safe text-4xl font-bold text-blue-600">
                {summary.partial}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-3 mb-2">
          <h3 className="text-lg font-bold text-gray-900 mb-2 pb-1 border-b-2 border-slate-200">
            Search & Filter
          </h3>

          <div className="flex flex-col lg:flex-row  gap-4 ">
            <div className="w-full lg:w-1/2">
              <label
                htmlFor="keyword-search"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Search by Assurance ID or Keyword
              </label>
              <input
                id="keyword-search"
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search by ID, description, or related business..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full lg:w-[35%]">
              <div>
                <label
                  htmlFor="status-filter"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Status
                </label>
                <select
                  id="status-filter"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-1 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
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
                  className="w-full px-1 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  <option value="">All Ministries</option>
                  {uniqueMinistries.map((ministry) => (
                    <option key={ministry} value={ministry}>
                      {ministry}
                    </option>
                  ))}
                </select>
              </div>

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
                  className="w-full px-1  py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
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

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-[25%] lg:mt-6">
              <button
                onClick={handleApplyFilters}
                className="w-full sm:w-auto px-6 py-3 bg-blue-900  text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={handleResetFilters}
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
          <div className="pt-2 flex justify-end-safe">
            <p className="text-sm text-slate-600">
              Showing {filteredRecords.length} assurances
            </p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2 pb-3 border-b-2 border-slate-200">
            Assurance Compliance Register
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 w-[15%] text-xs uppercase text-slate-400 font-semibold">
                    Session / Assurance No.
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                    Source
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                    Subject
                  </th>
                  <th className="text-center py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                    Ministry
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                    Clubbed Members
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <p className="text-sm text-slate-500">
                        No assurances match your current filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((assurance) => (
                    <tr
                      key={assurance.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <p className="text-sm font-mono font-semibold text-gray-900">
                          {formatAssuranceNo(assurance.assuranceNo)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-semibold text-slate-800 uppercase">
                          {formatSource(assurance.source)}
                        </p>
                      </td>
                      <td className="py-4 px-2">
                        <p className="text-sm font-medium text-gray-900">
                          {assurance.subject}
                        </p>
                      </td>
                      <td className="text-center py-4 px-2 w-[20%]">
                        <p className="text-sm text-slate-600">
                          {assurance.formattedDate}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-700">
                          {assurance.ministry}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-600">
                          {assurance.clubbedMembers || "—"}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredRecords.length > 0 && totalPages > 1 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <div className="text-sm text-slate-600">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredRecords.length)} of{" "}
                  {filteredRecords.length} assurances
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  {paginationRange.map((item, i) =>
                    item === "..." ? (
                      <span
                        key={`dots-${i}`}
                        className="h-10 w-10 flex items-center justify-center text-gray-400"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => handlePageChange(item)}
                        className={`h-10 w-10 flex items-center justify-center rounded border ${
                          currentPage === item
                            ? "bg-blue-900 text-white border-blue-900"
                            : "border-slate-300 text-slate-700 hover:bg-slate-50"
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
