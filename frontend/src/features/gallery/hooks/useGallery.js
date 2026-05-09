import { useEffect, useState, useMemo } from "react";
import { cachedAsync } from "@utils/cache";
import { getMemberGallery, getMemberBySrno } from "@utils/api";

export default function useGallery(id) {
  const [member, setMember] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDebateType, setSelectedDebateType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      setLoading(true);

      try {
        const { galleryData, memberData } = await preloadGallery(id);

        if (!isActive) return;

        setVideoData(galleryData);
        setMember(memberData);
      } catch (err) {
        console.error("Gallery load failed:", err);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadData();

    return () => {
      isActive = false;
    };
  }, [id]);

  const records = videoData?.records || [];

  const processedRecords = useMemo(() => {
    return records.map((v) => ({
      ...v,
      parsedDate: v.eventDate ? new Date(v.eventDate) : null,
    }));
  }, [records]);

  const normalizedKeyword = searchKeyword.trim().toLowerCase();

  const filteredRecords = useMemo(() => {
    return processedRecords.filter((video) => {
      const matchesKeyword =
        !normalizedKeyword ||
        video.subject_title?.toLowerCase().includes(normalizedKeyword);

      const matchesYear =
        !selectedYear ||
        (video.parsedDate &&
          video.parsedDate.getFullYear().toString() === selectedYear);

      const matchesType =
        !selectedDebateType || video.debateType === selectedDebateType;

      return matchesKeyword && matchesYear && matchesType;
    });
  }, [processedRecords, normalizedKeyword, selectedYear, selectedDebateType]);

  const uniqueYears = useMemo(() => {
    return [
      ...new Set(
        processedRecords
          .map((v) =>
            v.parsedDate ? v.parsedDate.getFullYear().toString() : null,
          )
          .filter(Boolean),
      ),
    ].sort((a, b) => b - a);
  }, [processedRecords]);

  const uniqueDebateTypes = useMemo(() => {
    return [
      ...new Set(records.map((v) => v.debateType).filter(Boolean)),
    ].sort();
  }, [records]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, selectedYear, selectedDebateType]);

  return {
    member,
    loading,
    records: filteredRecords,
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
  };
}

export async function preloadGallery(id) {
  return cachedAsync(`gallery-page-${id}`, async () => {
    const [galleryRes, memberRes] = await Promise.all([
      getMemberGallery(Number(id)),
      getMemberBySrno(Number(id)),
    ]);

    return {
      galleryData: {
        records: galleryRes.data || [],
        count: galleryRes.count || 0,
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
