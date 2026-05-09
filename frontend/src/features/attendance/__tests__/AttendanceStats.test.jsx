import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import AttendanceStats from "../components/AttendanceStats";
import { mappedSummary } from "@/test/fixtures/attendance.fixtures";

const defaultProps = {
  summary: mappedSummary,
  sessionCount: 3,
};

describe("AttendanceStats", () => {
  it("renders the section heading", () => {
    render(<AttendanceStats {...defaultProps} />);
    expect(screen.getByText("Overall Attendance Summary")).toBeInTheDocument();
  });

  it("displays the attendance percentage in the large heading", () => {
    render(<AttendanceStats {...defaultProps} />);
    // Both member percentage (80%) and national average (80%) appear;
    // the member percentage renders in the large 4xl element.
    const allMatches = screen.getAllByText("80%");
    expect(allMatches.length).toBeGreaterThanOrEqual(2);
    // The first match is the large attendance percentage
    expect(allMatches[0]).toHaveClass("text-4xl");
  });

  it("displays attended of total sittings", () => {
    render(<AttendanceStats {...defaultProps} />);
    expect(screen.getByText("48 of 60 sittings attended")).toBeInTheDocument();
  });

  it("displays national average", () => {
    render(<AttendanceStats {...defaultProps} />);
    expect(screen.getByText("National Average")).toBeInTheDocument();
  });

  it("displays state average", () => {
    render(<AttendanceStats {...defaultProps} />);
    expect(screen.getByText("State Average")).toBeInTheDocument();
  });

  it("displays parliament name", () => {
    render(<AttendanceStats {...defaultProps} />);
    expect(screen.getByText("Rajya Sabha")).toBeInTheDocument();
  });

  it("displays total session count", () => {
    render(<AttendanceStats {...defaultProps} />);
    expect(screen.getByText("Total Sessions Recorded: 3")).toBeInTheDocument();
  });

  it("displays average per session", () => {
    render(<AttendanceStats {...defaultProps} />);
    expect(screen.getByText(/Average per Session: 16 days/)).toBeInTheDocument();
  });
});
