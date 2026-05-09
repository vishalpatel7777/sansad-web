import { getMemberBySrno } from "@utils/api";
import { buildMemberDashboard } from "@utils/api";

export default {
  async findBySrno(srno) {
    const member = await getMemberBySrno(srno);
    if (!member?.srno) return null;

    const dashboard = await buildMemberDashboard(srno);

    return {
      id: member.srno,
      srno: member.srno,

      name: member.member_name,
      party: member.party,
      state: member.state_ut,

      house: "Rajya Sabha",
      constituency: member.state_ut,

      email: member.email || "—",
      phone: member.localTele || member.mobileNo || "—",

      image: member.image_url || `/avatars/${member.srno}.jpg`,

      dashboard,
    };
  },
};
