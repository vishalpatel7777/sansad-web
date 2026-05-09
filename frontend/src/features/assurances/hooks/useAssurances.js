import { useEffect, useMemo, useState } from "react";
import { cachedAsync } from "@utils/cache";
import { getMemberAssurances, getMemberBySrno } from "@utils/api";

export default function useAssurances(id) {
  const [member, setMember] = useState(null);
  const [assuranceData, setAssuranceData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedMinistry, setSelectedMinistry] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      setLoading(true);

      try {
        const { assuranceData, memberData } = await preloadAssurances(id);

        if (!isActive) return;

        setAssuranceData(assuranceData);
        setMember(memberData);
      } catch (error) {
        if (!isActive) return;
        console.error("Failed to load assurances:", error);
        setAssuranceData(null);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadData();

    return () => {
      isActive = false;
    };
  }, [id]);

  const { summary, records } = assuranceData || {
    summary: {},
    records: [],
  };

  const processedRecords = useMemo(() => {
    return records.map((r) => ({
      ...r,
      parsedDate: r.assurance_date ? new Date(r.assurance_date) : null,
    }));
  }, [records]);

  const normalizedKeyword = searchKeyword.trim().toLowerCase();

  const filteredRecords = useMemo(() => {
    return processedRecords
      .filter((record) => {
        const matchesKeyword =
          !normalizedKeyword ||
          record.assuranceNo?.toLowerCase().includes(normalizedKeyword) ||
          record.subject?.toLowerCase().includes(normalizedKeyword) ||
          record.ministry?.toLowerCase().includes(normalizedKeyword);

        const matchesMinistry =
          !selectedMinistry || record.ministry === selectedMinistry;

        const matchesStatus =
          !selectedStatus || record.status === selectedStatus;

        const matchesYear =
          !selectedYear ||
          (record.parsedDate &&
            record.parsedDate.getFullYear().toString() === selectedYear);

        return matchesKeyword && matchesMinistry && matchesStatus && matchesYear;
      })
      .sort((a, b) => {
        const dateA = a.parsedDate || new Date(0);
        const dateB = b.parsedDate || new Date(0);
        return dateB - dateA;
      });
  }, [
    processedRecords,
    normalizedKeyword,
    selectedStatus,
    selectedMinistry,
    selectedYear,
  ]);

  const formattedRecords = useMemo(() => {
    return filteredRecords.map((record) => ({
      ...record,
      formattedDate: record.assurance_date
        ? new Date(record.assurance_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "N/A",
    }));
  }, [filteredRecords]);

  const uniqueStatuses = useMemo(() => {
    return [...new Set(records.map((r) => r.status).filter(Boolean))];
  }, [records]);

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

  const uniqueMinistries = useMemo(() => {
    return [...new Set(records.map((r) => r.ministry).filter(Boolean))].sort();
  }, [records]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, selectedMinistry, selectedStatus, selectedYear]);

  return {
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
  };
}

export async function preloadAssurances(id) {
  return cachedAsync(`assurances-page-${id}`, async () => {
    const [assuranceRes, memberRes] = await Promise.all([
      getMemberAssurances(Number(id)),
      getMemberBySrno(Number(id)),
    ]);

    const fulfilled = assuranceRes.data.filter(
      (a) => a.status === "Fulfilled",
    ).length;

    const pending = assuranceRes.data.filter(
      (a) => a.status === "Pending",
    ).length;

    const partial = assuranceRes.data.filter(
      (a) => a.status === "Partially Fulfilled",
    ).length;

    return {
      assuranceData: {
        summary: {
          total: assuranceRes.count,
          fulfilled,
          pending,
          partial,
        },
        records: assuranceRes.data,
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
