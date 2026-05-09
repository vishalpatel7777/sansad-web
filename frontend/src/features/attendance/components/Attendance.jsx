import { useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useScrollContext } from "@context/ScrollContext";
import HeaderProfile from "@components/common/HeaderProfile";
import { getErrorMessage } from "@/shared/services";
import useAttendance from "../hooks/useAttendance";
import AttendanceStats from "./AttendanceStats";
import AttendanceTable from "./AttendanceTable";
import AttendanceChart from "./AttendanceChart";
import { LoadingState, EmptyState } from "@/shared/components";

export default function Attendance() {
  const { id } = useParams();
  const { setCompact, setProfile } = useScrollContext();
  const sentinelRef = useRef(null);
  const { member, attendance, loading, error } = useAttendance(id);

  useEffect(() => {
    if (!member || !attendance || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCompact = !entry.isIntersecting;
        setCompact(isCompact);
        if (isCompact) {
          setProfile({
            image: member.image,
            title: member.name,
            primaryMeta: [member.house, member.state],
            secondaryMeta: ["Attendance"],
          });
        } else {
          setProfile(null);
        }
      },
      { threshold: 0 },
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
      setCompact(false);
      setProfile(null);
    };
  }, [member, attendance, setCompact, setProfile]);

  if (loading) return <LoadingState message="Loading Attendance..." />;

  if (error)
    return (
      <EmptyState
        title="Failed to load attendance"
        message={getErrorMessage(error)}
      />
    );

  if (!member || !attendance)
    return (
      <EmptyState
        title="Attendance record not found"
        message="The attendance record you are looking for does not exist."
      />
    );

  const { summary, sessions } = attendance;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div ref={sentinelRef} className="h-px" />

      <HeaderProfile
        image={member.image}
        title={member.name}
        badge="MEMBER OF PARLIAMENT"
        primaryMeta={[member.house, member.state]}
        secondaryMeta={[]}
      />

      <div className="py-2">
        <div className="px-2 mb-3">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Attendance Record</h2>
          <p className="text-sm text-slate-600">
            Official parliamentary attendance record for {summary.parliament}
          </p>
        </div>

        <AttendanceStats summary={summary} sessionCount={sessions.length} />
        <AttendanceTable sessions={sessions} />
        <AttendanceChart sessions={sessions} />
      </div>
    </div>
  );
}
