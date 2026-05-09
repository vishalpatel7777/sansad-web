
import { createContext, useContext, useState, useMemo } from "react";

const ScrollContext = createContext(null);

export function ScrollProvider({ children }) {
  const [compact, setCompact] = useState(false);
  const [profile, setProfile] = useState(null);

  // Memoize context value to prevent re-creates
  const value = useMemo(
    () => ({
      compact,
      setCompact,
      profile,
      setProfile,
    }),
    [compact, profile],
  );

  return (
    <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>
  );
}

export function useScrollContext() {
  const ctx = useContext(ScrollContext);
  if (!ctx) {
    throw new Error("useScrollContext must be used inside ScrollProvider");
  }
  return ctx;
}
