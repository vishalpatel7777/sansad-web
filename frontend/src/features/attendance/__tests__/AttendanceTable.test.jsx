import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import AttendanceTable from "../components/AttendanceTable";
import { mappedSessions } from "@/test/fixtures/attendance.fixtures";

describe("AttendanceTable", () => {
  describe("with sessions", () => {
    it("renders the section heading", () => {
      render(<AttendanceTable sessions={mappedSessions} />);
      expect(screen.getByText("Session-wise Detailed Records")).toBeInTheDocument();
    });

    it("renders a row for each session", () => {
      render(<AttendanceTable sessions={mappedSessions} />);
      // Each session renders its name in the first column
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("Budget")).toBeInTheDocument();
    });

    it("renders session numbers in the second line of each row", () => {
      render(<AttendanceTable sessions={mappedSessions} />);
      expect(screen.getByText("Session #1")).toBeInTheDocument();
      expect(screen.getByText("Session #2")).toBeInTheDocument();
    });

    it("renders attendance percentage for each session", () => {
      render(<AttendanceTable sessions={mappedSessions} />);
      expect(screen.getByText("90%")).toBeInTheDocument();
      expect(screen.getByText("80%")).toBeInTheDocument();
      expect(screen.getByText("67%")).toBeInTheDocument();
    });

    it("renders column headers", () => {
      render(<AttendanceTable sessions={mappedSessions} />);
      expect(screen.getByText("Session")).toBeInTheDocument();
      expect(screen.getByText("Days Attended")).toBeInTheDocument();
      expect(screen.getByText("Total Days")).toBeInTheDocument();
      expect(screen.getByText("Attendance Rate")).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("renders the section heading even when empty", () => {
      render(<AttendanceTable sessions={[]} />);
      expect(screen.getByText("Session-wise Detailed Records")).toBeInTheDocument();
    });

    it("shows empty state message when no sessions", () => {
      render(<AttendanceTable sessions={[]} />);
      expect(screen.getByText("No session records available.")).toBeInTheDocument();
    });

    it("does not render a table when sessions is empty", () => {
      render(<AttendanceTable sessions={[]} />);
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
  });
});
