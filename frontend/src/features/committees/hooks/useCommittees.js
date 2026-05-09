import { useEffect, useState } from "react";
import { cachedAsync } from "@utils/cache";
import { getMemberBySrno, getMemberCommittees } from "@utils/api";

export function useCommittees(id) {
  const [member, setMember] = useState(null);
  const [current, setCurrent] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function load() {
      setLoading(true);

      try {
        const { memberData, currentData, pastData } = await preloadCommittees(id);

        if (!isActive) return;

        setMember(memberData);
        setCurrent(currentData);
        setPast(pastData);
      } catch (err) {
        if (!isActive) return;
        console.error("Committees load failed:", err);
        setMember(null);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    load();

    return () => {
      isActive = false;
    };
  }, [id]);

  return { member, current, past, loading };
}

export async function preloadCommittees(id) {
  return cachedAsync(`committees-page-${id}`, async () => {
    const [memberRes, committeeRes] = await Promise.all([
      getMemberBySrno(Number(id)),
      getMemberCommittees(Number(id)),
    ]);

    const memberData = {
      id: memberRes?.srno,
      name: memberRes?.member_name,
      house: "Rajya Sabha",
      state: memberRes?.state_ut,
      image: memberRes?.image_url || `/avatars/${memberRes?.srno}.jpg`,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const safeData = committeeRes?.data ?? [];

    const normalised = safeData.map((c) => ({
      committee: c.committeeName,
      house: c.house,
      status: c.status,
      dateFrom: c.Date,
    }));

    const sortByDateDesc = (a, b) =>
      new Date(b.dateFrom) - new Date(a.dateFrom);

    const currentData = normalised
      .filter((c) => new Date(c.dateFrom) >= today)
      .sort(sortByDateDesc);

    const pastData = normalised
      .filter((c) => new Date(c.dateFrom) < today)
      .sort(sortByDateDesc);

    return { memberData, currentData, pastData };
  });
}
