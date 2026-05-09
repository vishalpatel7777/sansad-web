import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { rawMember, rawSessions, mappedMember } from "@/test/fixtures/attendance.fixtures";

// Mock the API module before importing the hook
vi.mock("@/features/attendance/api/attendance.api", () => ({
  getMemberBySrno: vi.fn(),
  getMemberAttendance: vi.fn(),
}));

// Mock the cache so tests don't bleed into each other
vi.mock("@utils/cache", () => ({
  cachedAsync: vi.fn((_key, loader) => loader()),
}));

// Import after mocks are set up
import useAttendance from "../hooks/useAttendance";
import { getMemberBySrno, getMemberAttendance } from "../api/attendance.api";

describe("useAttendance", () => {
  beforeEach(() => {
    getMemberBySrno.mockResolvedValue(rawMember);
    getMemberAttendance.mockResolvedValue({ data: rawSessions });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("starts in loading state", () => {
    const { result } = renderHook(() => useAttendance("42"));
    expect(result.current.loading).toBe(true);
    expect(result.current.member).toBeNull();
    expect(result.current.attendance).toBeNull();
  });

  it("resolves member and attendance data on success", async () => {
    const { result } = renderHook(() => useAttendance("42"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.member).toMatchObject(mappedMember);
    expect(result.current.attendance).not.toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("maps sessions correctly through the hook", async () => {
    const { result } = renderHook(() => useAttendance("42"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    // rawSessions has one zero-total session that must be filtered
    expect(result.current.attendance.sessions).toHaveLength(3);
  });

  it("sets normalized error on API failure", async () => {
    getMemberBySrno.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useAttendance("42"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).not.toBeNull();
    expect(result.current.error.message).toBe("Network error");
    expect(result.current.member).toBeNull();
    expect(result.current.attendance).toBeNull();
  });

  it("does not fetch when id is falsy", () => {
    renderHook(() => useAttendance(null));
    expect(getMemberBySrno).not.toHaveBeenCalled();
  });

  it("calls API with numeric id", async () => {
    const { result } = renderHook(() => useAttendance("42"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getMemberBySrno).toHaveBeenCalledWith(42);
    expect(getMemberAttendance).toHaveBeenCalledWith(42);
  });
});
