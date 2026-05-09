import React from "react";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { useScrollContext } from "@context/ScrollContext";
import HeaderProfile from "@components/common/HeaderProfile";
import useSpecialMentions from "../hooks/useSpecialMentions";
import DOMPurify from "dompurify";
import { LoadingState, EmptyState, PageHeading } from "@/shared/components";

const TABLE_PER_PAGE = 10;

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-4 py-2 border rounded disabled:opacity-50"
      >
        Previous
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .slice(0, 3)
        .map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-4 py-2 rounded ${
              page === p ? "bg-blue-900 text-white" : "border hover:bg-slate-50"
            }`}
          >
            {p}
          </button>
        ))}

      {totalPages > 3 && <span className="px-2">…</span>}

      {totalPages > 3 && (
        <button
          onClick={() => onPageChange(totalPages)}
          className={`px-4 py-2 rounded ${
            page === totalPages
              ? "bg-blue-900 text-white"
              : "border hover:bg-slate-50"
          }`}
        >
          {totalPages}
        </button>
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-4 py-2 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

export default function SpecialMentions() {
  const { id } = useParams();
  const [expandedTableId, setExpandedTableId] = useState(null);
  const {
    member,
    loading,
    total,
    filteredRecords,
    uniqueYears,
    currentPage,
    setCurrentPage,
    searchKeyword,
    setSearchKeyword,
    selectedYear,
    setSelectedYear,
  } = useSpecialMentions(id);

  const { setCompact, setProfile } = useScrollContext();
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
            secondaryMeta: ["Special Mentions"],
          });
        } else {
          setProfile(null);
        }
      },
      { root: scrollRoot, threshold: 0 },
    );

    if (!sentinelRef.current) return;
    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
      setCompact(false);
      setProfile(null);
    };
  }, [member, setCompact, setProfile]);

  const tableRecords = useMemo(() => {
    const start = (currentPage - 1) * TABLE_PER_PAGE;
    return filteredRecords.slice(start, start + TABLE_PER_PAGE);
  }, [filteredRecords, currentPage]);

  const tableTotalPages = useMemo(() => {
    const pages = Math.ceil(filteredRecords.length / TABLE_PER_PAGE);
    return pages || 1;
  }, [filteredRecords]);

  useEffect(() => {
    if (currentPage > tableTotalPages) {
      setCurrentPage(tableTotalPages);
    }
  }, [tableTotalPages, currentPage, setCurrentPage]);

  if (loading) return <LoadingState message="Loading special mentions…" />;
  if (!member) return <EmptyState message="Special mentions not found." />;

  const handleResetFilters = () => {
    setSearchKeyword("");
    setSelectedYear("");
    setCurrentPage(1);
    setExpandedTableId(null);
  };

  const summary = {
    total,
    lastMentionDate: filteredRecords.length ? filteredRecords[0].date : null,
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
          title="Parliamentary Special Mentions Archive"
          subtitle="Complete record of special mentions raised in Parliament"
        />

        <section className="bg-white rounded-lg shadow-sm p-3 mb-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <p className="text-xs uppercase flex justify-center-safe text-slate-400 font-semibold mb-2">
                Total Special Mentions
              </p>
              <p className="text-3xl flex justify-center-safe font-bold text-gray-900">
                {summary.total}
              </p>
            </div>

            <div>
              <p className="text-xs  flex justify-center-safe uppercase text-slate-400 font-semibold mb-2">
                Last Mention Date
              </p>
              <p className="text-3xl flex justify-center-safe font-bold text-gray-900">
                {summary.lastMentionDate
                  ? new Date(summary.lastMentionDate).toLocaleDateString(
                      "en-GB",
                      { day: "2-digit", month: "long", year: "numeric" },
                    )
                  : "—"}
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
                placeholder="Search by title or content..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-[45%]">
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
            </div>

            <div className="flex h-[20%] w-[25%] mt-5 gap-3 pt-2">
              <button
                onClick={() => setCurrentPage(1)}
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
              Showing {filteredRecords.length} of {total} special mentions
            </p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-3 mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b-2 border-slate-200">
            Special Mention Records
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3  text-xs uppercase text-slate-400 font-semibold">
                    S. No
                  </th>
                  <th className="py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                    Subject
                  </th>
                  <th className="py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                    Ministry Concerned
                  </th>
                  <th className="py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                    Made Date
                  </th>
                  <th className="py-3 px-4 text-xs uppercase text-slate-400 font-semibold text-center">
                    Reply Sent
                  </th>
                  <th className="py-3 px-4 text-xs uppercase text-slate-400 font-semibold text-center">
                    View
                  </th>
                </tr>
              </thead>

              <tbody>
                {tableRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-12 text-center text-sm text-slate-500"
                    >
                      No special mentions match your filters.
                    </td>
                  </tr>
                ) : (
                  tableRecords.map((m, index) => {
                    const safeDetails = DOMPurify.sanitize(m.details || "", {
                      USE_PROFILES: { html: true },
                    });

                    return (
                      <React.Fragment key={m.id}>
                        <tr className="border-b border-slate-100">
                          <td className="px-3 py-4 font-mono font-semibold">
                            {(currentPage - 1) * TABLE_PER_PAGE + index + 1}
                          </td>
                          <td className="w-[50%] px-4 py-4 text-sm text-gray-900">
                            {m.subject}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            {m.ministry}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            {new Date(m.date).toLocaleDateString("en-GB")}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                m.replySent
                                  ? "bg-green-50 text-green-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {m.replySent ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() =>
                                setExpandedTableId(
                                  expandedTableId === m.id ? null : m.id,
                                )
                              }
                              className="text-blue-900 font-semibold hover:underline"
                            >
                              {expandedTableId === m.id ? "Hide ▲" : "View ▼"}
                            </button>
                          </td>
                        </tr>

                        {expandedTableId === m.id && (
                          <tr>
                            <td colSpan="6" className="px-6 py-4 bg-slate-50">
                              <div
                                className="prose prose-sm max-w-none text-slate-700"
                                dangerouslySetInnerHTML={{
                                  __html: safeDetails,
                                }}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
            {tableTotalPages > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-slate-600">
                  Showing {(currentPage - 1) * TABLE_PER_PAGE + 1} to{" "}
                  {Math.min(
                    currentPage * TABLE_PER_PAGE,
                    filteredRecords.length,
                  )}{" "}
                  of {filteredRecords.length} mentions
                </div>

                <Pagination
                  page={currentPage}
                  totalPages={tableTotalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
