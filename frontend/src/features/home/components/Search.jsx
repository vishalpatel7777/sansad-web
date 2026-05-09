import { useState, useMemo, useEffect } from "react";
import { Search as SearchIcon, Landmark, ChevronDown } from "lucide-react";

import PersonHorizontalCard from "./PersonHorizontalCard";
import { fetchAPI } from "@utils/api";

const ITEMS_PER_PAGE = 6;

export default function Search() {
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState("");
  const [house, setHouse] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let currentPage = 1;
    let timeoutId = null;
    const LIMIT = 20;

    async function loadNextChunk() {
      if (query.trim().length > 0) return;
      if (cancelled) return;

      const res = await fetchAPI(`/members?page=${currentPage}&limit=${LIMIT}`);

      if (!res.data || res.data.length === 0) return;

      if (currentPage === 1 && typeof res.total === "number") {
        setTotalCount(res.total);
      }

      const mapped = res.data.map((m) => ({
        id: m.srno,
        name: m.member_name || "NA",
        state: m.state_ut || "NA",
        house:
          m.term && m.term.toLowerCase().includes("lok")
            ? "Lok Sabha"
            : "Rajya Sabha",
        constituency: null,
        image: m.image_url,
        email: m.email || "NA",
        phone: m.permanentTele || "NA",
      }));

      setMembers((prev) => [...prev, ...mapped]);

      if (res.data.length < LIMIT) return;

      currentPage += 1;
      timeoutId = setTimeout(loadNextChunk, 400);
    }

    loadNextChunk();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const processedMembers = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    let data = members.filter((m) => {
      if (trimmed && !`${m.name} ${m.state}`.toLowerCase().includes(trimmed)) return false;
      if (house !== "all" && !m.house.toLowerCase().includes(house)) return false;
      return true;
    });

    if (sortBy === "name") {
      data = [...data].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    } else if (sortBy === "state") {
      data = [...data].sort((a, b) => (a.state ?? "").localeCompare(b.state ?? ""));
    }

    return data;
  }, [members, query, house, sortBy]);

  const totalPages = Math.ceil(
    (query.trim() || house !== "all" ? processedMembers.length : (totalCount ?? processedMembers.length)) / ITEMS_PER_PAGE,
  );

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [totalPages, page]);

  const paginatedMembers = processedMembers.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (left > 1) {
      rangeWithDots.push(1);
      if (left > 2) rangeWithDots.push("...");
    }

    rangeWithDots.push(...range);

    if (right < totalPages) {
      if (right < totalPages - 1) rangeWithDots.push("...");
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <>
      <section className="bg-white border-b border-gray-200 py-12 px-10">
        <div className="max-w-5xl mx-auto text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-gray">
            Find your Representative
          </h1>

          <p className="text-gray-600 text-lg mb-10">
            Search for Members of the Indian Parliament by name, state, or
            constituency
          </p>

          <div className="flex flex-col md:flex-row items-center bg-white border border-gray-300 rounded-xl shadow-sm overflow-hidden p-1 gap-1 max-w-4xl mx-auto">
            <div className="flex items-center px-4 border-r border-gray-200 min-w-[180px]">
              <Landmark size={18} className="text-gray-400 mr-2" />
              <select
                value={house}
                onChange={(e) => { setHouse(e.target.value); setPage(1); }}
                className="w-full text-sm font-medium bg-transparent border-none cursor-pointer focus:ring-0 text-ink-gray"
              >
                <option value="all">All Houses</option>
                <option value="lok">Lok Sabha</option>
                <option value="rajya">Rajya Sabha</option>
              </select>
            </div>

            <div className="flex flex-1 items-center px-4 py-2">
              <SearchIcon size={18} className="text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search Member by Name or State"
                className="w-full bg-transparent border-none focus:ring-0 text-base text-ink-gray placeholder:text-gray-400"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              />
            </div>

            <button className="bg-primary hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all">
              Search
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto sticky top-[72px] bg-white z-10">
          <div className="flex items-center gap-3 pb-2">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mr-2 whitespace-nowrap">
              Quick Filters:
            </span>

            {["All States", "Uttar Pradesh", "Maharashtra", "West Bengal", "Lok Sabha"].map((label) => (
              <button
                key={label}
                className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gray-100 text-sm font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                {label}
                <ChevronDown size={14} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto w-full px-10 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-ink-gray">
            Search Results
            <span className="text-gray-400 font-normal ml-2">
              ({query.trim() || house !== "all" ? processedMembers.length : (totalCount ?? processedMembers.length)} Members)
            </span>
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="text-sm font-semibold bg-transparent border-none cursor-pointer text-primary focus:ring-0"
            >
              <option value="name">Name</option>
              <option value="state">State</option>
              <option value="seniority" disabled>Seniority (Coming Soon)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedMembers.map((member) => (
            <PersonHorizontalCard key={member.id} member={member} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-10 w-10 flex items-center justify-center rounded border border-gray-200 disabled:opacity-50"
            >
              Pre
            </button>

            {getPaginationRange().map((item, i) =>
              item === "..." ? (
                <span key={`dots-${i}`} className="h-10 w-10 flex items-center justify-center text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setPage(item)}
                  className={`h-10 w-10 flex items-center justify-center rounded border ${
                    page === item
                      ? "bg-primary text-white border-primary"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {item}
                </button>
              ),
            )}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-10 w-10 flex items-center justify-center rounded border border-gray-200 disabled:opacity-50"
            >
              next
            </button>
          </div>
        )}
      </main>
    </>
  );
}
