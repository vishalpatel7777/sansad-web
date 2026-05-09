import { useEffect, useMemo, useState } from "react";
import { cachedAsync } from "@utils/cache";
import { getMemberTours, getMemberBySrno } from "@utils/api";

export default function useTours(id) {
  const [member, setMember] = useState(null);
  const [tourData, setTourData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitType, setSelectedVisitType] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!id) return;

    let isActive = true;
    const memberId = Number(id);
    if (isNaN(memberId)) return;

    async function loadData() {
      setLoading(true);

      try {
        const { tours, memberData } = await preloadTours(id);

        if (!isActive) return;

        setTourData(tours);
        setMember(memberData);
      } catch (error) {
        if (!isActive) return;
        console.error("Failed to load tours:", error);
        setTourData([]);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadData();

    return () => {
      isActive = false;
    };
  }, [id]);

  const processedTours = useMemo(() => {
    return tourData
      .map((t) => ({
        ...t,
        parsedDate: t.tour_date ? new Date(t.tour_date) : null,
      }))
      .sort((a, b) => {
        const dateA = a.parsedDate || new Date(0);
        const dateB = b.parsedDate || new Date(0);
        return dateB - dateA;
      });
  }, [tourData]);

  const normalizedKeyword = useMemo(
    () => searchKeyword.trim().toLowerCase(),
    [searchKeyword],
  );

  const filteredTours = useMemo(() => {
    return processedTours.filter((t) => {
      const matchesKeyword =
        !normalizedKeyword ||
        t.purpose?.toLowerCase().includes(normalizedKeyword) ||
        t.tour_place?.toLowerCase().includes(normalizedKeyword);

      const matchesYear =
        !selectedYear ||
        (t.parsedDate &&
          t.parsedDate.getFullYear().toString() === selectedYear);
      const matchesVisitType =
        !selectedVisitType ||
        t.visit_type?.toLowerCase() === selectedVisitType.toLowerCase();

      const matchesState =
        !selectedState ||
        t.state?.toLowerCase() === selectedState.toLowerCase();

      return matchesKeyword && matchesYear && matchesVisitType && matchesState;
    });
  }, [
    processedTours,
    normalizedKeyword,
    selectedYear,
    selectedVisitType,
    selectedState,
  ]);

  const uniqueYears = useMemo(() => {
    return [
      ...new Set(
        processedTours
          .map((t) =>
            t.parsedDate ? t.parsedDate.getFullYear().toString() : null,
          )
          .filter(Boolean),
      ),
    ].sort((a, b) => b - a);
  }, [processedTours]);

  const uniqueVisitTypes = useMemo(() => {
    return [
      ...new Set(
        processedTours.map((t) => t.visit_type?.toLowerCase()).filter(Boolean),
      ),
    ];
  }, [processedTours]);

  const uniqueStates = useMemo(() => {
    return [
      ...new Set(
        processedTours.map((t) => t.state?.toLowerCase()).filter(Boolean),
      ),
    ];
  }, [processedTours]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, selectedYear, selectedVisitType, selectedState]);

  return {
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
  };
}

export async function preloadTours(id) {
  return cachedAsync(`tours-page-${id}`, async () => {
    const [tourRes, memberRes] = await Promise.all([
      getMemberTours(Number(id)),
      getMemberBySrno(Number(id)),
    ]);

    return {
      tours: tourRes.data,
      memberData: {
        id: memberRes.srno,
        name: memberRes.member_name,
        house: memberRes.house || "Rajya Sabha",
        state: memberRes.state_ut,
        image: memberRes.image_url || `/avatars/${memberRes.srno}.jpg`,
      },
    };
  });
}
