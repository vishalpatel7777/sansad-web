import { describe, it, expect } from "vitest";
import { mapMember, mapSession, mapAttendance } from "../api/attendance.mapper";
import {
  rawMember,
  rawSessions,
  mappedMember,
  mappedSummary,
  mappedSessions,
} from "@/test/fixtures/attendance.fixtures";

describe("mapMember", () => {
  it("maps raw API member to normalized shape", () => {
    expect(mapMember(rawMember)).toEqual(mappedMember);
  });

  it("sets house to Rajya Sabha regardless of raw data", () => {
    expect(mapMember(rawMember).house).toBe("Rajya Sabha");
  });

  it("constructs avatar image path from srno", () => {
    expect(mapMember(rawMember).image).toBe("/avatars/42.jpg");
  });

  it("handles null/undefined raw data gracefully", () => {
    const result = mapMember(null);
    expect(result.id).toBeUndefined();
    expect(result.name).toBeUndefined();
    expect(result.house).toBe("Rajya Sabha");
  });
});

describe("mapSession", () => {
  it("maps a valid session correctly", () => {
    const raw = { session: "1", daysSigned: 18, daysNotSigned: 2 };
    expect(mapSession(raw)).toEqual({
      sessionNumber: 1,
      name: "1",
      attended: 18,
      total: 20,
      percentage: 90,
    });
  });

  it("returns null when total days is zero", () => {
    const raw = { session: "3", daysSigned: 0, daysNotSigned: 0 };
    expect(mapSession(raw)).toBeNull();
  });

  it("sets sessionNumber to null for non-numeric session names", () => {
    const raw = { session: "Budget", daysSigned: 10, daysNotSigned: 5 };
    expect(mapSession(raw).sessionNumber).toBeNull();
    expect(mapSession(raw).name).toBe("Budget");
  });

  it("rounds percentage correctly", () => {
    // 10/15 = 66.666... → rounds to 67
    const raw = { session: "Budget", daysSigned: 10, daysNotSigned: 5 };
    expect(mapSession(raw).percentage).toBe(67);
  });

  it("defaults missing daysSigned/daysNotSigned to 0", () => {
    const raw = { session: "1", daysSigned: 5 };
    const result = mapSession(raw);
    expect(result.total).toBe(5);
    expect(result.attended).toBe(5);
    expect(result.percentage).toBe(100);
  });

  it("includes daysPresentNotSigned in attended and total", () => {
    const raw = { session: "1", daysSigned: 10, daysPresentNotSigned: 3, daysNotSigned: 2 };
    const result = mapSession(raw);
    expect(result.attended).toBe(13); // 10 + 3
    expect(result.total).toBe(15);    // 13 + 2
    expect(result.percentage).toBe(87); // Math.round(13/15*100)
  });

  it("treats null numeric fields as 0", () => {
    const raw = { session: "1", daysSigned: null, daysPresentNotSigned: null, daysNotSigned: null };
    expect(mapSession(raw)).toBeNull(); // all null → total 0 → filtered
  });
});

describe("mapAttendance", () => {
  it("filters out zero-total sessions", () => {
    const result = mapAttendance(rawSessions);
    expect(result.sessions).toHaveLength(3); // session "3" (0+0) is dropped
  });

  it("calculates aggregate percentage correctly", () => {
    const result = mapAttendance(rawSessions);
    expect(result.summary.percentage).toBe(mappedSummary.percentage);
  });

  it("calculates attended and total correctly", () => {
    const result = mapAttendance(rawSessions);
    expect(result.summary.attended).toBe(mappedSummary.attended);
    expect(result.summary.total).toBe(mappedSummary.total);
  });

  it("calculates avgPerSession correctly", () => {
    const result = mapAttendance(rawSessions);
    expect(result.summary.avgPerSession).toBe(mappedSummary.avgPerSession);
  });

  it("includes nationalAverage and stateAverage in summary", () => {
    const result = mapAttendance(rawSessions);
    expect(result.summary.nationalAverage).toBe(80);
    expect(result.summary.stateAverage).toBe(78);
  });

  it("returns zero percentage when no sessions", () => {
    const result = mapAttendance([]);
    expect(result.summary.percentage).toBe(0);
    expect(result.summary.attended).toBe(0);
    expect(result.summary.total).toBe(0);
    expect(result.sessions).toHaveLength(0);
  });

  it("handles null/undefined rawSessions gracefully", () => {
    const result = mapAttendance(null);
    expect(result.sessions).toHaveLength(0);
    expect(result.summary.percentage).toBe(0);
  });

  it("sets avgPerSession to 0 when sessions array is empty", () => {
    const result = mapAttendance([]);
    expect(result.summary.avgPerSession).toBe(0);
  });
});
