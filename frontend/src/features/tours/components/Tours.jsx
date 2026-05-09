import { useParams } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { useScrollContext } from "@context/ScrollContext";
import HeaderProfile from "@components/common/HeaderProfile";
import useTours from "../hooks/useTours";
import { LoadingState, EmptyState } from "@/shared/components";
import { getPaginationRange } from "@/shared/utils/pagination";

export default function Tours() {
  const { id } = useParams();
  const {
    member,
    loading,
    filteredTours,
    uniqueYears,
    uniqueVisitTypes,
    uniqueStates,
    currentPage,
    setCurrentPage,
    searchKeyword,
    setSearchKeyword,
    selectedYear,
    setSelectedYear,
    selectedVisitType,
    setSelectedVisitType,
    selectedState,
    setSelectedState,
  } = useTours(id);

  const RECORDS_PER_PAGE = 10;
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
            secondaryMeta: ["Official Tours"],
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
  }, [member, setCompact, setProfile]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTours.length / RECORDS_PER_PAGE),
  );

  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const tourRecords = filteredTours.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, setCurrentPage, totalPages]);

  const summary = useMemo(() => {
    const totalTours = filteredTours.length;
    const uniquePlaces = new Set(filteredTours.map((t) => t.tour_place)).size;
    const totalDaysOnTour = filteredTours.reduce((sum, tour) => {
      if (!tour.timefrom || !tour.timeto) return sum;
      const durationSeconds = Math.max(0, tour.timeto - tour.timefrom);
      const durationDays = Math.ceil(durationSeconds / 86400);
      return sum + durationDays;
    }, 0);
    const mostRecentTour = filteredTours[0]?.tour_date || null;

    return { totalTours, uniquePlaces, totalDaysOnTour, mostRecentTour };
  }, [filteredTours]);

  if (loading) return <LoadingState message="Loading official tour records…" />;

  if (!member)
    return (
      <EmptyState
        title="Member not found"
        message="The member you are looking for does not exist."
      />
    );

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return "—";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
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

      <div className="py-2">
        <section className="mb-2 px-1">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="flex justify-center-safe  text-xs uppercase text-slate-400 font-semibold mb-2 tracking-wider">Total Tours</p>
              <p className="flex justify-center-safe  text-3xl font-bold text-gray-900">{summary.totalTours}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="flex justify-center-safe  text-xs uppercase text-slate-400 font-semibold mb-2 tracking-wider">Regions Visited</p>
              <p className="flex justify-center-safe  text-3xl font-bold text-gray-900">{summary.uniquePlaces}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="flex justify-center-safe  text-xs uppercase text-slate-400 font-semibold mb-2 tracking-wider">Days on Tour</p>
              <p className="flex justify-center-safe  text-3xl font-bold text-gray-900">{summary.totalDaysOnTour}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="flex justify-center-safe  text-xs uppercase text-slate-400 font-semibold mb-2 tracking-wider">Most Recent Tour</p>
              <p className="flex justify-center-safe  text-2xl font-bold text-gray-900">
                {summary.mostRecentTour
                  ? new Date(summary.mostRecentTour).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                  : "N/A"}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg border border-slate-200 p-2 mb-2">
          <h3 className="text-lg font-bold text-gray-900 mb-2 pb-1 border-b-2 border-slate-200 uppercase tracking-wide">
            Filter Tour Records
          </h3>

          <div className="flex flex-col lg:flex-row  gap-8">
            <div className="w-full lg:w-1/2">
              <label htmlFor="keyword-search" className="block text-sm font-semibold text-gray-900 mb-2">
                Search by Purpose or Place
              </label>
              <input
                id="keyword-search"
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search tours..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full lg:w-[45%]">
              <div>
                <label htmlFor="year-filter" className="block text-sm font-semibold text-gray-900 mb-2">Year</label>
                <select id="year-filter" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full px-1 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent">
                  <option value="">All Years</option>
                  {uniqueYears.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="visit-type-filter" className="block text-sm font-semibold text-gray-900 mb-2">Visit Type</label>
                <select id="visit-type-filter" value={selectedVisitType} onChange={(e) => setSelectedVisitType(e.target.value)} className="w-full px-1 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent">
                  <option value="">All Types</option>
                  {uniqueVisitTypes.map((type) => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="state-filter" className="block text-sm font-semibold text-gray-900 mb-2">State</label>
                <select id="state-filter" value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="w-full px-1 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent">
                  <option value="">All States</option>
                  {uniqueStates.map((state) => <option key={state} value={state}>{state.charAt(0).toUpperCase() + state.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg border border-slate-200 p-2 mb-2">
          <h3 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b-2 border-slate-200 uppercase tracking-wide">
            Movement Register
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200">
                  {["S. No", "Number of Tours", "Purpose", "Tour Place", "Tour Date", "Time From", "Time To", "Description"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tourRecords.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
                      <p className="text-sm text-slate-500">No tour records available for this member.</p>
                    </td>
                  </tr>
                ) : (
                  tourRecords.map((tour, index) => (
                    <tr key={`${tour.id}-${tour.tour_date}-${index}`} className="border-b border-slate-100">
                      <td className="py-4 px-4"><p className="text-sm font-mono text-gray-900">{(currentPage - 1) * RECORDS_PER_PAGE + index + 1}</p></td>
                      <td className="py-4 px-4"><p className="text-sm text-gray-900">{tour.no_of_tours || "—"}</p></td>
                      <td className="py-4 px-4"><p className="text-sm text-gray-900">{tour.purpose || "—"}</p></td>
                      <td className="py-4 px-4"><p className="text-sm text-gray-900">{tour.tour_place || "—"}</p></td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-900">
                          {tour.tour_date ? new Date(tour.tour_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </p>
                      </td>
                      <td className="py-4 px-4"><p className="text-sm font-mono text-gray-900">{formatTime(tour.timefrom)}</p></td>
                      <td className="py-4 px-4"><p className="text-sm font-mono text-gray-900">{formatTime(tour.timeto)}</p></td>
                      <td className="py-4 px-4"><p className="text-sm text-slate-700">{tour.description || "—"}</p></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {tourRecords.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Showing {tourRecords.length} of {filteredTours.length} tour records
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    Previous
                  </button>

                  {getPaginationRange(currentPage, totalPages).map((page, i) =>
                    page === "..." ? (
                      <span key={`dots-${i}`} className="px-3 py-2 text-slate-400">…</span>
                    ) : (
                      <button key={page} onClick={() => setCurrentPage(page)} className={`px-4 py-2 font-semibold rounded-lg transition-colors ${currentPage === page ? "bg-blue-900 text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"}`}>
                        {page}
                      </button>
                    ),
                  )}

                  <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
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
