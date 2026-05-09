import { useEffect, useState } from "react";
import { cachedAsync } from "@utils/cache";
import members from "@data/members";
import { aggregateAllMembers } from "@data/aggregateAnalytics";

export default function useCachedDashboard(id) {
  const isAggregateMode = !id;

  const [member, setMember] = useState(null);
  const [aggregate, setAggregate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        if (isAggregateMode) {
          const data = await cachedAsync("dashboard-aggregate", () =>
            Promise.resolve(aggregateAllMembers()),
          );

          setAggregate(data);
        } else {
          const data = await cachedAsync(`dashboard-${id}`, () =>
            members.findBySrno(Number(id)),
          );

          setMember(data);
        }
      } catch (err) {
        console.error("Dashboard load failed:", err);
      }

      setLoading(false);
    }

    load();
  }, [id]);

  return { member, aggregate, loading, isAggregateMode };
}


export async function preloadDashboard(id) {
  const isAggregateMode = !id;

  if (isAggregateMode) {
    return cachedAsync("dashboard-aggregate", () =>
      Promise.resolve(aggregateAllMembers()),
    );
  }

  return cachedAsync(`dashboard-${id}`, () => members.findBySrno(Number(id)));
}
