import { useEffect, useMemo, useState } from "react";
import { cachedAsync } from "@utils/cache";
import { getMemberBills, getMemberBySrno } from "@utils/api";

export default function usePrivateBills(id) {
  const [member, setMember] = useState(null);
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedHouse, setSelectedHouse] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      setLoading(true);

      try {
        const { memberData, records } = await preloadPrivateBills(id);

        if (!isActive) return;

        setMember(memberData);
        setBillData(records);
      } catch (error) {
        console.error("Private bills load failed:", error);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadData();
    return () => {
      isActive = false;
    };
  }, [id]);

  const records = useMemo(() => billData ?? [], [billData]);

  const summary = useMemo(() => {
    return {
      total: records.length,
      passed: records.filter((b) => b.status === "Passed").length,
      pending: records.filter((b) => b.status === "Pending").length,
      lapsedOrWithdrawn: records.filter((b) =>
        ["Lapsed", "Withdrawn"].includes(b.status),
      ).length,
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return records.filter((record) => {
      const matchesKeyword =
        !keyword ||
        record.billName?.toLowerCase().includes(keyword) ||
        record.billNumber?.toLowerCase().includes(keyword);

      const matchesYear =
        !selectedYear ||
        (record.introductionDate &&
          new Date(record.introductionDate).getFullYear().toString() ===
            selectedYear);

      const matchesStatus = !selectedStatus || record.status === selectedStatus;

      const matchesHouse =
        !selectedHouse || record.introducedHouse === selectedHouse;

      return matchesKeyword && matchesYear && matchesStatus && matchesHouse;
    });
  }, [records, searchKeyword, selectedYear, selectedStatus, selectedHouse]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, selectedYear, selectedStatus, selectedHouse]);

  const uniqueYears = useMemo(() => {
    return [
      ...new Set(
        records
          .map((r) =>
            r.introductionDate
              ? new Date(r.introductionDate).getFullYear().toString()
              : null,
          )
          .filter(Boolean),
      ),
    ].sort((a, b) => b - a);
  }, [records]);

  const uniqueStatuses = useMemo(
    () => [...new Set(records.map((r) => r.status).filter(Boolean))].sort(),
    [records],
  );

  const uniqueHouses = useMemo(
    () =>
      [
        ...new Set(records.map((r) => r.introducedHouse).filter(Boolean)),
      ].sort(),
    [records],
  );

  return {
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
  };
}

export async function preloadPrivateBills(id) {
  return cachedAsync(`privatebills-page-${id}`, async () => {
    const [memberRes, billsRes] = await Promise.all([
      getMemberBySrno(Number(id)),
      getMemberBills(Number(id)),
    ]);

    const mappedRecords = (billsRes.data || []).map((bill) => ({
      billNumber: bill.billno,
      billName: bill.billName,
      introducedHouse: bill.introducedInHouse,
      introductionDate: bill.introducedDate,
      ministry: bill.ministry,
      member: bill.member,
      category: bill.billCategory,
      debatesLS: bill.datePassed_in_LS || "—",
      debatesRS: bill.datePassed_in_RS || "—",
      committeeReference: bill.reportPresented || "—",
      assentDetails: bill.actNoAndYear || "—",
      status: bill.status,
      pdfUrl: bill.pdfUrl,
    }));

    return {
      memberData: {
        id: memberRes.srno,
        name: memberRes.member_name,
        house: "Rajya Sabha",
        state: memberRes.state_ut,
        image: memberRes.image_url || `/avatars/${memberRes.srno}.jpg`,
      },
      records: mappedRecords,
    };
  });
}
