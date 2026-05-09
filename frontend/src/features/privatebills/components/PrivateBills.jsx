import { useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useScrollContext } from "@context/ScrollContext";
import HeaderProfile from "@components/common/HeaderProfile";
import usePrivateBills from "../hooks/usePrivateBills";
import { Download } from "lucide-react";
import { LoadingState, EmptyState, PageHeading } from "@/shared/components";

export default function PrivateBills() {
  const { id } = useParams();

  const {
    member,
    loading,
    summary,
    filteredRecords,
    uniqueYears,
    uniqueStatuses,
    uniqueHouses,
    currentPage,
    setCurrentPage,
    searchKeyword,
    setSearchKeyword,
    selectedYear,
    setSelectedYear,
    selectedStatus,
    setSelectedStatus,
    selectedHouse,
    setSelectedHouse,
  } = usePrivateBills(id);

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
            secondaryMeta: ["Private Bills"],
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

  if (loading) return <LoadingState message="Loading private bills…" />;

  if (!member)
    return (
      <EmptyState
        title="Private bills record not found"
        message="The private bills record you are looking for does not exist."
      />
    );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setSearchKeyword("");
    setSelectedYear("");
    setSelectedStatus("");
    setSelectedHouse("");
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Passed":
        return "bg-green-50 text-green-700";
      case "Pending":
        return "bg-orange-50 text-orange-700";
      case "Lapsed":
      case "Withdrawn":
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-slate-100 text-slate-700";
    }
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
          title="Private Member's Bills Legislative Record"
          subtitle="Official parliamentary register of private member's bills introduced and their legislative progression"
        />

        <section className="mb-2">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="flex justify-center-safe text-xs uppercase text-slate-400 font-semibold mb-2">
                Total Introduced
              </p>
              <p className="flex justify-center-safe text-3xl font-bold text-blue-900">
                {summary?.total}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="flex justify-center-safe text-xs uppercase text-slate-400 font-semibold mb-2">
                Passed
              </p>
              <p className="flex justify-center-safe text-3xl font-bold text-blue-900">
                {summary.passed}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="flex justify-center-safe text-xs uppercase text-slate-400 font-semibold mb-2">
                Pending
              </p>
              <p className="flex justify-center-safe text-3xl font-bold text-blue-900">
                {summary.pending}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="flex justify-center-safe text-xs uppercase text-slate-400 font-semibold mb-2">
                Lapsed / Withdrawn
              </p>
              <p className="flex justify-center-safe text-3xl font-bold text-blue-900">
                {summary.lapsedOrWithdrawn}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg border border-slate-200 p-2 mb-2">
          <h3 className="text-lg font-bold text-gray-900 mb-2 pb-1 border-b-2 border-slate-200">
            Filter Bills
          </h3>

          <div className="flex flex-col lg:flex-row  gap-4 ">
            <div className="w-full lg:w-1/2">
              <label
                htmlFor="keyword-search"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Search by Title or Bill Number
              </label>
              <input
                id="keyword-search"
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search bills..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full lg:w-[35%]">
              <div>
                <label htmlFor="year-filter" className="block text-sm font-semibold text-gray-900 mb-2">Year</label>
                <select
                  id="year-filter"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-1 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  <option value="">All Years</option>
                  {uniqueYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status-filter" className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                <select
                  id="status-filter"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-1 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="house-filter" className="block text-sm font-semibold text-gray-900 mb-2">House</label>
                <select
                  id="house-filter"
                  value={selectedHouse}
                  onChange={(e) => setSelectedHouse(e.target.value)}
                  className="w-full px-1 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  <option value="">All Houses</option>
                  {uniqueHouses.map((house) => (
                    <option key={house} value={house}>{house}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-[25%] lg:mt-6">
              <button onClick={handleApplyFilters} className="w-full sm:w-auto px-6 py-3  bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors">
                Apply Filters
              </button>
              <button onClick={handleResetFilters} className="w-full sm:w-auto px-6 py-3  bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors">
                Reset
              </button>
            </div>
          </div>
          <div className="pt-2 flex justify-end-safe">
            <p className="text-sw text-slate-600">
              Showing {filteredRecords.length} of {summary?.total ?? 0} bills
            </p>
          </div>
        </section>

        <section className="bg-white rounded-lg border border-slate-200 p-3 mb-2">
          <h3 className="text-lg font-bold text-gray-900 mb-2 pb-1 border-b-2 border-slate-200">
            Legislative Register
          </h3>

          <div className="overflow-x-auto">
            <table className="whitespace-pre">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-1 text-xs uppercase text-slate-400 font-semibold ">S. No</th>
                  <th className=" text-left py-2 px-4 text-xs uppercase text-slate-400 font-semibold ">Bill Number</th>
                  <th className=" text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold">Bill Name</th>
                  <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold ">Date of Introduction</th>
                  <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold ">Introduced in House</th>
                  <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold">Ministry</th>
                  <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold">Member</th>
                  <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold">Bill Category</th>
                  <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold ">Debates / Date Passed in LS</th>
                  <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold ">Debates / Date Passed in RS</th>
                  <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold ">Referred to Committee / Report Presented</th>
                  <th className="text-left py-2 px-2 text-xs uppercase text-slate-400 font-semibold ">Assent Date / Gazette Notification / Act No.</th>
                  <th className="text-center py-3 px-4 text-xs uppercase text-slate-400 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="py-12 text-center">
                      <p className="text-sm text-slate-500">No bills match your current filters.</p>
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((bill, index) => (
                    <tr key={`${bill.billNumber}-${index}`} className=" w-full border-b border-slate-100">
                      <td className="py-2 px-2">
                        <p className="text-sm font-semibold text-gray-900 ">{(currentPage - 1) * ROWS_PER_PAGE + index + 1}</p>
                      </td>
                      <td className="py-2 px-4">
                        <p className=" text-sm font-mono font-bold text-gray-900 ">{bill.billNumber}</p>
                      </td>
                      <td className="w-full  lg:w-[80%]  py-4 px-4 ">
                        <p className="  text-sm font-medium text-gray-900">{bill.billName}</p>
                      </td>
                      <td className="w-full py-4 px-4">
                        <p className="text-sm text-slate-600 ">
                          {new Date(bill.introductionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </td>
                      <td className=" py-4 px-4">
                        <p className="text-sm text-slate-600 ">{bill.introducedHouse}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-600">{bill.ministry}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-600">{bill.member}</p>
                      </td>
                      <td className=" py-4 px-4">
                        <p className="text-sm text-slate-600">{bill.category}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-600">{bill.debatesLS}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-600">{bill.debatesRS}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-600">{bill.committeeReference}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-600">{bill.assentDetails}</p>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(bill.status)}`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        {bill.pdfUrl ? (
                          <a href={bill.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-8 h-8 text-blue-900 hover:bg-blue-50 rounded transition-colors" title="Download Bill PDF">
                            <Download size={18} />
                          </a>
                        ) : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredRecords.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredRecords.length)} of{" "}
                  {filteredRecords.length} records
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button key={page} onClick={() => handlePageChange(page)} className={`px-4 py-2 font-semibold rounded-lg transition-colors ${currentPage === page ? "bg-blue-900 text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"}`}>
                        {page}
                      </button>
                    ))}

                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
