import { useEffect, useMemo, useState } from "react";
import { cachedAsync } from "@utils/cache";
import { getMemberSpecialMentions, getMemberBySrno } from "@utils/api";

export default function useSpecialMentions(id) {
  const [member, setMember] = useState(null);
  const [mentionData, setMentionData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      setLoading(true);

      try {
        const { mentionsData, memberData } = await preloadSpecialMentions(id);

        if (!isActive) return;

        setMentionData(mentionsData);
        setMember(memberData);
      } catch (err) {
        if (!isActive) return;
        console.error("Failed to load special mentions:", err);
        setMentionData(null);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadData();
    return () => {
      isActive = false;
    };
  }, [id]);

  const { total = 0, records = [] } = mentionData || {};

  const processedRecords = useMemo(() => {
    return records.map((m) => ({
      id: m.id,
      subject: m.subject,
      ministry: m.ministry || m.ministryConcerned || "—",
      date: m.madeDate,
      replySent: m.reply === "Yes",
      details: m.details,
      parsedDate: m.madeDate ? new Date(m.madeDate) : null,
    }));
  }, [records]);

  const normalizedKeyword = searchKeyword.trim().toLowerCase();

  const filteredRecords = useMemo(() => {
    return processedRecords
      .filter((record) => {
        const matchesKeyword =
          !normalizedKeyword ||
          record.subject?.toLowerCase().includes(normalizedKeyword) ||
          record.ministry?.toLowerCase().includes(normalizedKeyword);

        const matchesYear =
          !selectedYear ||
          (record.parsedDate &&
            record.parsedDate.getFullYear().toString() === selectedYear);

        return matchesKeyword && matchesYear;
      })
      .sort((a, b) => {
        const dateA = a.parsedDate || new Date(0);
        const dateB = b.parsedDate || new Date(0);
        return dateB - dateA;
      });
  }, [processedRecords, normalizedKeyword, selectedYear]);

  const uniqueYears = useMemo(() => {
    return [
      ...new Set(
        processedRecords
          .map((r) =>
            r.parsedDate ? r.parsedDate.getFullYear().toString() : null,
          )
          .filter(Boolean),
      ),
    ].sort((a, b) => b - a);
  }, [processedRecords]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, selectedYear]);

  return {
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
  };
}

export async function preloadSpecialMentions(id) {
  return cachedAsync(`specialmentions-page-${id}`, async () => {
    const [mentionsRes, memberRes] = await Promise.all([
      getMemberSpecialMentions(Number(id)),
      getMemberBySrno(Number(id)),
    ]);

    return {
      mentionsData: {
        total: mentionsRes.count,
        records: mentionsRes.data || [],
      },
      memberData: {
        id: memberRes.srno,
        name: memberRes.member_name,
        house: "Rajya Sabha",
        state: memberRes.state_ut,
        image: memberRes.image_url || `/avatars/${memberRes.srno}.jpg`,
      },
    };
  });
}
