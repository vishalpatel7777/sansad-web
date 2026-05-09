import { useEffect, useState } from "react";
import { cachedAsync } from "@utils/cache";
import { getMemberDebates, getMemberBySrno } from "@utils/api";

function mapDebates(apiData) {
  return apiData.map((d, index) => ({
    id: d.debateId ?? index,
    title: d.title,
    excerpt: d.debateSubject || "",
    subject: d.debateSubject || "",
    session: d.sessionNo,
    year: d.year,
    date: d.debateDate,
    debateType: "Parliamentary Debate",
    questionType: "—",
    ministry: d.ministry || "—",
    pdfUrl: d.pdfUrl,
  }));
}

export default function useDebates(id) {
  const [records, setRecords] = useState([]);
  const [member, setMember] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const data = await preloadDebates(id);

        setRecords(data.mapped);
        setMember(data.member);
        setSummary({
          totalDebates: data.mapped.length,
          speakingInstances: data.mapped.length,
          lastParticipated: data.mapped[0]?.date || "—",
        });
      } catch (err) {
        console.error("Debates load failed:", err);
      }

      setLoading(false);
    }

    load();
  }, [id]);

  return { records, member, summary, loading };
}

export async function preloadDebates(id) {
  return cachedAsync(`debates-page-${id}`, async () => {
    const [debateRes, memberRes] = await Promise.all([
      getMemberDebates(Number(id)),
      getMemberBySrno(Number(id)),
    ]);

    const mapped = mapDebates(debateRes.data || []);

    return {
      mapped,
      member: {
        srno: memberRes.srno,
        name: memberRes.member_name,
        party: memberRes.party,
        state: memberRes.state_ut,
        house: "Rajya Sabha",
        image: memberRes.image_url || `/avatars/${memberRes.srno}.jpg`,
      },
    };
  });
}
