import { useEffect, useState } from "react";
import { cachedRequest, normalizeError } from "@/shared/services";
import { getMemberAttendance, getMemberBySrno } from "../api/attendance.api";
import { mapMember, mapAttendance } from "../api/attendance.mapper";

export default function useAttendance(id) {
  const [member, setMember] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await preloadAttendance(id);
        if (!isActive) return;
        setMember(data.member);
        setAttendance(data.attendance);
      } catch (err) {
        if (!isActive) return;
        setError(normalizeError(err));
        setMember(null);
        setAttendance(null);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    if (id) load();

    return () => { isActive = false; };
  }, [id]);

  return { member, attendance, loading, error };
}

export async function preloadAttendance(id) {
  return cachedRequest(`attendance-${id}`, async () => {
    const [memberRes, attendanceRes] = await Promise.all([
      getMemberBySrno(Number(id)),
      getMemberAttendance(Number(id)),
    ]);

    return {
      member: mapMember(memberRes),
      attendance: mapAttendance(attendanceRes?.data),
    };
  });
}
