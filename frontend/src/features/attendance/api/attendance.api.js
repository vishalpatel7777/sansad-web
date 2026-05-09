import { httpGet } from "@/shared/services";

export const getMemberBySrno = (srno) => httpGet(`/members/${srno}`);
export const getMemberAttendance = (srno) => httpGet(`/member-attendance?srno=${srno}`);
