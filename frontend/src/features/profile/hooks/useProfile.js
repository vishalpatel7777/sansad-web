import { useEffect, useState } from "react";
import { cachedAsync } from "@utils/cache";
import {
  getMemberBySrno,
  getMemberPersonalDetails,
  getMemberOtherDetails,
} from "@utils/api";
import { formatEmail, formatPhone, formatDateDMY } from "@utils/formatters";

export default function useProfile(id) {
  const [member, setMember] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    setMember(null);
    setProfile(null);

    async function loadProfile() {
      setLoading(true);

      try {
        const data = await preloadProfile(id);

        if (!isActive) return;

        if (!data) {
          setMember(null);
          setProfile(null);
          return;
        }

        setMember(data.member);
        setProfile(data.profile);
      } catch (err) {
        if (!isActive) return;
        console.error("Profile load failed:", err);
        setMember(null);
        setProfile(null);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    if (id) loadProfile();

    return () => {
      isActive = false;
    };
  }, [id]);

  return { member, profile, loading };
}

export async function preloadProfile(id) {
  return cachedAsync(`profile-page-${id}`, async () => {
    const [memberRes, personalRes, otherRes] = await Promise.all([
      getMemberBySrno(Number(id)),
      getMemberPersonalDetails(Number(id)),
      getMemberOtherDetails(Number(id)),
    ]);

    if (!memberRes) return null;

    const personal = personalRes?.data?.[0] || {};
    const other = otherRes?.data?.[0] || {};

    const member = {
      srno: memberRes.srno,
      name: memberRes.member_name,
      party: memberRes.party,
      state: memberRes.state_ut,
      house: "Rajya Sabha",
      image: memberRes.image_url || `/avatars/${memberRes.srno}.jpg`,
    };

    const profile = {
      fullName: memberRes.member_name,
      dateOfBirth: formatDateDMY(personal.dateBirth),
      term: memberRes.term,

      contact: {
        email: formatEmail(memberRes.email),
        phone: formatPhone(memberRes.localTele || memberRes.mobileNo),
        address: personal.presentAddress,
      },

      personalDetails: {
        placeOfBirth: personal.placeBirth,
        dateOfBirth: formatDateDMY(personal.dateBirth),
        fatherName: personal.fatherName,
        motherName: personal.motherName,
        maritalStatus: {
          status: personal.maritalStatus,
          spouse: personal.spouseName,
        },
        children: {
          sons: personal.no_of_sons,
          daughters: personal.no_of_daughters,
        },
        professionDescription: personal.profession,
        educationDescription: personal.qualification,
      },

      addresses: {
        permanent: { address: personal.permanentAddress },
        present: { address: personal.presentAddress },
      },

      otherDetails: {
        freedomFighter: other.freedomFighter,
        booksPublished: other.booksPublished,
        countriesVisited: other.countriesVisited,
        sportsInterests: other.sportsInterests,
        socialActivities: other.socialActivities,
        otherInformation: other.otherInformation,
      },
      professional: {
        education: {
          degree: personal.qualification,
          institution: "",
        },
        profession: {
          title: personal.profession,
          organization: "",
        },
        parliamentaryExperience: {
          term: memberRes.term,
          elections: "",
        },
      },
    };

    return { member, profile };
  });
}
