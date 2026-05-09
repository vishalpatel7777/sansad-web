import { useEffect, useMemo, useState } from "react";
import { cachedAsync } from "@utils/cache";
import { getMemberBySrno, getMemberQuestions } from "@utils/api";

export default function useQuestions(id) {
  const [member, setMember] = useState(null);
  const [questionsData, setQuestionsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedMinistry, setSelectedMinistry] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      setLoading(true);

      try {
        const data = await preloadQuestions(id);

        if (!isActive) return;

        setMember(data.member);
        setQuestionsData(data.questions);
      } catch (error) {
        if (!isActive) return;
        console.error("Questions load failed:", error);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    if (id) loadData();

    return () => {
      isActive = false;
    };
  }, [id]);

  const records = questionsData?.records ?? [];

  const processedRecords = useMemo(() => {
    return records.map((q) => ({
      ...q,
      parsedDate: q.date ? new Date(q.date) : null,
    }));
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

  const uniqueTypes = useMemo(() => {
    return [...new Set(records.map((r) => r.type).filter(Boolean))].sort();
  }, [records]);

  const uniqueMinistries = useMemo(() => {
    return [...new Set(records.map((r) => r.ministry).filter(Boolean))].sort();
  }, [records]);

  const normalizedKeyword = searchKeyword.trim().toLowerCase();

  const filteredRecords = useMemo(() => {
    return processedRecords.filter((record) => {
      const matchesKeyword =
        !normalizedKeyword ||
        record.subject?.toLowerCase().includes(normalizedKeyword);

      const matchesYear =
        !selectedYear ||
        (record.parsedDate &&
          record.parsedDate.getFullYear().toString() === selectedYear);

      const matchesType = !selectedType || record.type === selectedType;

      const matchesMinistry =
        !selectedMinistry || record.ministry === selectedMinistry;

      return matchesKeyword && matchesYear && matchesType && matchesMinistry;
    });
  }, [
    processedRecords,
    normalizedKeyword,
    selectedYear,
    selectedType,
    selectedMinistry,
  ]);

  const summary = useMemo(() => {
    return {
      total: records.length,
      starred: records.filter((q) => q.type === "STARRED").length,
      unstarred: records.filter((q) => q.type === "UNSTARRED").length,
      answered: records.filter((q) => q.pdfUrl).length,
    };
  }, [records]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, selectedYear, selectedType, selectedMinistry]);

  return {
    member,
    loading,
    records,
    filteredRecords,
    summary,
    uniqueYears,
    uniqueTypes,
    uniqueMinistries,
    currentPage,
    setCurrentPage,
    searchKeyword,
    setSearchKeyword,
    selectedYear,
    setSelectedYear,
    selectedType,
    setSelectedType,
    selectedMinistry,
    setSelectedMinistry,
  };
}

export async function preloadQuestions(id) {
  return cachedAsync(`questions-page-${id}`, async () => {
    const [memberRes, questionsRes] = await Promise.all([
      getMemberBySrno(Number(id)),
      getMemberQuestions(Number(id)),
    ]);

    const mappedRecords = (questionsRes.data ?? []).map((q) => ({
      id: q.questionId,
      qno: q.questionNo,
      subject: q.subject,
      session: q.sessionNo,
      ministry: q.ministry,
      type: q.questionType,
      date: q.questionDate,
      pdfUrl: q.pdfUrl,
    }));

    return {
      member: {
        id: memberRes.srno,
        name: memberRes.member_name,
        house: "Rajya Sabha",
        state: memberRes.state_ut,
        image: memberRes.image_url || `/avatars/${memberRes.srno}.jpg`,
      },
      questions: {
        records: mappedRecords,
      },
    };
  });
}
