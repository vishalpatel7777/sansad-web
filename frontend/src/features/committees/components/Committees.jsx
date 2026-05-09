import { useParams } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
import { useScrollContext } from "@context/ScrollContext";
import HeaderProfile from "@components/common/HeaderProfile";
import { useCommittees } from "../hooks/useCommittees";
import { LoadingState, EmptyState, PageHeading } from "@/shared/components";

const PAGE_SIZE = 10;

function paginate(data, page) {
  const start = (page - 1) * PAGE_SIZE;
  return data.slice(start, start + PAGE_SIZE);
}

export default function Committees() {
  const { id } = useParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);

  const { setCompact, setProfile } = useScrollContext();
  const sentinelRef = useRef(null);

  const { member, current, past, loading } = useCommittees(id);

  useEffect(() => {
    setCurrentPage(1);
    setPastPage(1);
  }, [id]);

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
            secondaryMeta: ["Committee Membership"],
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

  const summary = useMemo(
    () => ({
      total: current.length + past.length,
      current: current.length,
      past: past.length,
    }),
    [current, past],
  );

  if (loading) return <LoadingState message="Loading committee records…" />;
  if (!member) return <EmptyState message="Committee record not found" />;

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

      <div className=" py-2">
        <PageHeading
          title="Committee Membership Record"
          subtitle="Complete record of parliamentary committee participation"
        />

        <section className="mb-2">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="bg-white rounded-lg shadow-sm p-3 border border-slate-200">
              <p className="flex justify-center-safe text-xs uppercase text-slate-400 font-semibold tracking-wider mb-2">
                Total Committees
              </p>
              <p className="flex justify-center-safe text-3xl font-bold text-blue-900">
                {summary.total}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border border-slate-200">
              <p className="flex justify-center-safe text-xs uppercase text-slate-400 font-semibold tracking-wider mb-2">
                Current Memberships
              </p>
              <p className="flex justify-center-safe text-3xl font-bold text-blue-900">
                {summary.current}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border border-slate-200">
              <p className="flex justify-center-safe text-xs uppercase text-slate-400 font-semibold tracking-wider mb-2">
                Past Memberships
              </p>
              <p className="flex justify-center-safe text-3xl font-bold text-blue-900">
                {summary.past}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-slate-200">
          <h3 className="text-lg font-bold text-gray-900 mb-1 pb-1 border-b-2 border-slate-200">
            Current Committees
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-3 py-3 text-left text-xs uppercase">S.No</th>
                  <th className="px-3 py-3 text-left text-xs uppercase">Committee</th>
                  <th className="px-4 py-3 text-center text-xs uppercase">House</th>
                  <th className="px-4 py-3 text-center text-xs uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs uppercase">Date From</th>
                </tr>
              </thead>
              <tbody>
                {paginate(current, currentPage).map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="px-3 py-3">
                      {(currentPage - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="px-3 py-3 font-medium">{row.committee}</td>
                    <td className="px-4 py-3 text-center">{row.house}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 text-xs font-bold bg-blue-900 text-white rounded">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-slate-600">
                      {row.dateFrom}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end gap-2 mt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={currentPage * PAGE_SIZE >= current.length}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 text-sm border rounded"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-3 mb-2 border border-slate-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2 pb-1 border-b-2 border-slate-200">
            Past Committees (Historical Record)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs uppercase">S.No</th>
                  <th className="px-4 py-3 text-left text-xs uppercase">Committee</th>
                  <th className="px-4 py-3 text-center text-xs uppercase">House</th>
                  <th className="px-4 py-3 text-center text-xs uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs uppercase">Date From</th>
                </tr>
              </thead>
              <tbody>
                {paginate(past, pastPage).map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="px-4 py-3">
                      {(pastPage - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="px-4 py-3 font-medium">{row.committee}</td>
                    <td className="px-4 py-3 text-center">{row.house}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 text-xs font-bold bg-blue-900 text-white rounded">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-slate-600">
                      {row.dateFrom}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end gap-2 mt-4">
              <button
                disabled={pastPage === 1}
                onClick={() => setPastPage((p) => p - 1)}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={pastPage * PAGE_SIZE >= past.length}
                onClick={() => setPastPage((p) => p + 1)}
                className="px-3 py-1 text-sm border rounded"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
