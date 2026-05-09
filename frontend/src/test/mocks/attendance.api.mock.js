import { vi } from "vitest";
import { rawMember, rawSessions } from "../fixtures/attendance.fixtures";

/**
 * Mocks the attendance feature's API module so tests never hit the network.
 * Call this at the top of any test file that exercises useAttendance or preloadAttendance.
 *
 * Usage:
 *   import { mockAttendanceApi } from "@/test/mocks/attendance.api.mock";
 *   mockAttendanceApi();
 */
export function mockAttendanceApi(overrides = {}) {
  vi.mock("@/features/attendance/api/attendance.api", () => ({
    getMemberBySrno: vi.fn().mockResolvedValue(overrides.member ?? rawMember),
    getMemberAttendance: vi.fn().mockResolvedValue(
      overrides.sessions !== undefined
        ? { data: overrides.sessions }
        : { data: rawSessions },
    ),
  }));
}

export function mockAttendanceApiError(message = "Network error") {
  vi.mock("@/features/attendance/api/attendance.api", () => ({
    getMemberBySrno: vi.fn().mockRejectedValue(new Error(message)),
    getMemberAttendance: vi.fn().mockRejectedValue(new Error(message)),
  }));
}
