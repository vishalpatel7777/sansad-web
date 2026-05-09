import { useParams } from "react-router-dom";
import { useEffect, useRef, useMemo } from "react";
import { useScrollContext } from "@context/ScrollContext";
import HeaderProfile from "@components/common/HeaderProfile";
import { Download } from "lucide-react";
import useGallery from "../hooks/useGallery";
import { LoadingState, EmptyState, PageHeading } from "@/shared/components";
import { getPaginationRange } from "@/shared/utils/pagination";

export default function Gallery() {
  const { id } = useParams();
  const ITEMS_PER_PAGE = 10;
  const {
    member,
    loading,
    records: videoRecords,
    uniqueYears,
    uniqueDebateTypes,
    currentPage,
    setCurrentPage,
    searchKeyword,
    setSearchKeyword,
    selectedYear,
    setSelectedYear,
    selectedDebateType,
    setSelectedDebateType,
  } = useGallery(id);

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
            secondaryMeta: ["Gallery"],
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

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
      setCompact(false);
      setProfile(null);
    };
  }, [member, setCompact, setProfile]);

  const totalPages = Math.max(
    1,
    Math.ceil(videoRecords.length / ITEMS_PER_PAGE),
  );

  const paginatedVideos = videoRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage, setCurrentPage]);

  const { totalVideos, debateTypesCount, totalVideoSize, mostRecentDate } =
    useMemo(() => {
      const totalVideos = videoRecords.length;
      const debateTypesCount = uniqueDebateTypes.length;
      const totalVideoSize = videoRecords.reduce((sum, video) => {
        const sizeMatch =
          typeof video.sizeOfVideo === "string"
            ? video.sizeOfVideo.match(/(\d+)/)
            : null;
        return sum + (sizeMatch ? parseInt(sizeMatch[1]) : 0);
      }, 0);
      const mostRecentDate =
        videoRecords.length > 0
          ? videoRecords.reduce((latest, video) => {
              return new Date(video.eventDate) > new Date(latest)
                ? video.eventDate
                : latest;
            }, videoRecords[0].eventDate)
          : null;

      return { totalVideos, debateTypesCount, totalVideoSize, mostRecentDate };
    }, [videoRecords, uniqueDebateTypes]);

  if (loading) return <LoadingState message="Loading gallery records…" />;

  if (!member)
    return (
      <EmptyState
        title="Member not found"
        message="The member you are looking for does not exist."
      />
    );

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

      <div className="mt-1 pb-2 px-1">
        <PageHeading
          title="Audiovisual Parliamentary Record"
          subtitle="Official video archive of parliamentary interventions and proceedings"
        />

        <section className="mb-2">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="flex justify-center-safe text-xs uppercase text-slate-400 font-semibold mb-2">
                Total Videos
              </p>
              <p className="flex justify-center-safe text-3xl font-bold text-blue-900">
                {totalVideos}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="flex justify-center-safe text-xs uppercase text-slate-400 font-semibold mb-2">
                Debate Types Covered
              </p>
              <p className="flex justify-center-safe text-3xl font-bold text-blue-900">
                {debateTypesCount}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="flex justify-center-safe text-xs uppercase text-slate-400 font-semibold mb-2">
                Total Video Size
              </p>
              <p className="flex justify-center-safe text-2xl font-bold text-blue-900">
                {totalVideoSize} MB
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="flex justify-center-safe text-xs uppercase text-slate-400 font-semibold mb-2">
                Most Recent Video Date
              </p>
              <p className="flex justify-center-safe text-2xl font-bold text-blue-900">
                {mostRecentDate
                  ? new Date(mostRecentDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg border border-slate-200 p-3 mb-2">
          <h3 className="text-lg font-bold text-gray-900 mb-2 pb-1 border-b-2 border-slate-200">
            Search & Filter
          </h3>

          <div className="flex flex-col lg:flex-row  gap-4">
            <div className="w-full lg:w-1/2">
              <label
                htmlFor="subject-search"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Search by Subject Title
              </label>
              <input
                id="subject-search"
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search videos by subject or title..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full lg:w-[45%]">
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

              <div>
                <label
                  htmlFor="debate-type-filter"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Debate Type
                </label>
                <select
                  id="debate-type-filter"
                  value={selectedDebateType}
                  onChange={(e) => setSelectedDebateType(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  <option value="">All Debate Types</option>
                  {uniqueDebateTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2 pb-3 border-b-2 border-slate-200">
            Video Record Register
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full ">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-xs uppercase text-slate-400 font-semibold ">
                    S. No
                  </th>
                  <th className="text-left py-2 px-4 text-xs uppercase text-slate-400 font-semibold ">
                    Event Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold">
                    Subject / Title
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold ">
                    Debate Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase text-slate-400 font-semibold ">
                    Video Size
                  </th>
                </tr>
              </thead>
              <tbody>
                {videoRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <p className="text-sm text-slate-500">
                        No video records available for this member.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedVideos.map((video, index) => (
                    <tr key={video.id} className="border-b border-slate-100">
                      <td className="py-4 px-3">
                        <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-600 whitespace-nowrap">
                          {new Date(video.eventDate).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-medium text-gray-900">
                          {video.subject_title}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-600 whitespace-nowrap">
                          {video.debateType}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-600 whitespace-nowrap">
                          {video.sizeOfVideo}
                        </p>
                      </td>
                      <td className="text-center py-4 px-4">
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title="Download Video"
                        >
                          <Download size={18} />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {videoRecords.length > 0 && (
            <div className=" pt-6 border-t border-slate-200 flex justify-between items-center">
              <div className="text-sm text-slate-600">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, videoRecords.length)} of{" "}
                {videoRecords.length}
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-40"
                >
                  Prev
                </button>

                {getPaginationRange(currentPage, totalPages).map((item, idx) =>
                  item === "..." ? (
                    <span key={`dots-${idx}`} className="px-2 text-slate-400">
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
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
