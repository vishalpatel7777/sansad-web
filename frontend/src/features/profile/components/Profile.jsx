import { useParams } from "react-router-dom";
import {
  Printer,
  Award,
  Plane,
  BookOpen,
  Trophy,
  Info,
  Activity,
} from "lucide-react";
import HeaderProfile from "@components/common/HeaderProfile";
import { useScrollContext } from "@context/ScrollContext";
import { useCallback, useEffect, useRef } from "react";
import useProfile from "../hooks/useProfile";
import { LoadingState, EmptyState } from "@/shared/components";

export default function Profile() {
  const { id } = useParams();
  const { setCompact, setProfile } = useScrollContext();
  const sentinelRef = useRef(null);
  const { member, profile, loading } = useProfile(id);

  useEffect(() => {
    if (!member || !profile) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCompact = !entry.isIntersecting;

        setCompact(isCompact);

        if (isCompact) {
          setProfile({
            image: member.image,
            title: profile.fullName,
            primaryMeta: [member.house, member.state],
            secondaryMeta: [
              member.party,
              profile.contact.email,
              profile.contact.phone,
            ],
          });
        } else {
          setProfile(null);
        }
      },
      { threshold: 0 },
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [member, profile, setCompact, setProfile]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (loading) return <LoadingState message="Loading profile…" />;

  if (!member || !profile)
    return (
      <EmptyState
        title="Member not found"
        message="The profile you are looking for does not exist."
      />
    );

  return (
    <div className="bg-slate-50">
      <div ref={sentinelRef} className="h-px" />

      <HeaderProfile
        image={member.image}
        title={profile.fullName}
        badge="MEMBER OF PARLIAMENT"
        primaryMeta={[member.house, member.state]}
        secondaryMeta={[
          member.party,
          profile.contact.email,
          profile.contact.phone,
        ]}
      />

      {/* Main Content */}
      <div className="mt-1 print:py-6 ">
        <button
          onClick={handlePrint}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors print:hidden"
        >
          <Printer size={18} />
          Print
        </button>

        {/* Basic Information Section */}
        <div className="shadow-sm p-3 bg-white ">
          <Section title="Basic Information" icon="👤">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoItem label="Full Name" value={profile.fullName} />
              <InfoItem label="Date of Birth" value={profile.dateOfBirth} />
              <InfoItem label="Term" value={profile.term} />
            </div>
          </Section>
        </div>

        {/* Contact Details Section */}
        <div className="shadow-sm p-3 bg-white mt-1">
          <Section title="Contact Details" icon="📞">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ContactItem
                icon="✉️"
                label="Email"
                value={profile.contact.email}
                href={`mailto:${profile.contact.email}`}
                isLink
              />
              <ContactItem
                icon="☎️"
                label="Phone"
                value={profile.contact.phone}
              />
              <ContactItem
                icon="📍"
                label="Address"
                value={profile.contact.address}
                isMultiline
              />
            </div>
          </Section>
        </div>

        {/* Professional & Background Section */}
        <div className="shadow-sm p-3 bg-white mt-1">
          <Section title="Professional & Background" icon="🎓">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-xs uppercase text-slate-400 font-semibold mb-2">
                  Education
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {profile.professional?.education?.degree}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {profile.professional?.education?.institution}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-slate-400 font-semibold mb-2">
                  Profession
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {profile.professional?.profession?.title}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {profile.professional?.profession?.organization}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-slate-400 font-semibold mb-2">
                  Parliamentary Experience
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {profile.professional?.parliamentaryExperience?.term}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {profile.professional?.parliamentaryExperience?.elections}
                </p>
              </div>
            </div>
          </Section>
        </div>

        {profile.personalDetails && (
          <div className="shadow-sm p-3 bg-white mt-1">
            <Section title="Personal Details" icon="👨‍👩‍👧‍👦">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoItem
                  label="Place of Birth"
                  value={profile.personalDetails.placeOfBirth}
                />
                <InfoItem
                  label="Date of Birth"
                  value={profile.personalDetails.dateOfBirth}
                />
                <InfoItem
                  label="Father's Name"
                  value={profile.personalDetails.fatherName}
                />
                <InfoItem
                  label="Mother's Name"
                  value={profile.personalDetails.motherName}
                />
                <InfoItem
                  label="Marital Status"
                  value={`${profile.personalDetails.maritalStatus.status}${
                    profile.personalDetails.maritalStatus.spouse
                      ? ` to ${profile.personalDetails.maritalStatus.spouse}`
                      : ""
                  }${
                    profile.personalDetails.maritalStatus.marriageDate
                      ? ` (${profile.personalDetails.maritalStatus.marriageDate})`
                      : ""
                  }`}
                />
                <InfoItem
                  label="Children"
                  value={`${profile.personalDetails.children.sons} Son(s), ${profile.personalDetails.children.daughters} Daughter(s)`}
                />
                <div className="md:col-span-2">
                  <InfoItem
                    label="Profession"
                    value={profile.personalDetails.professionDescription}
                  />
                </div>
                <div className="md:col-span-2">
                  <InfoItem
                    label="Educational Qualification"
                    value={profile.personalDetails.educationDescription}
                  />
                </div>
              </div>
            </Section>
          </div>
        )}

        {profile.addresses && (
          <div className="shadow-sm p-3 bg-white mt-1">
            <Section title="Addresses" icon="🏠">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AddressBlock
                  title="Permanent Address"
                  address={profile.addresses.permanent}
                />
                <AddressBlock
                  title="Present Address"
                  address={profile.addresses.present}
                />
              </div>
            </Section>
          </div>
        )}

        {profile.otherDetails && (
          <div className="shadow-sm p-3 bg-white mt-1">
            <Section title="Other Details" icon="📋">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem
                  icon={Award}
                  label="Freedom Fighter"
                  value={profile.otherDetails.freedomFighter || "—"}
                />
                <DetailItem
                  icon={Plane}
                  label="Countries Visited"
                  value={profile.otherDetails.countriesVisited}
                />
                <DetailItem
                  icon={BookOpen}
                  label="Books Published"
                  value={profile.otherDetails.booksPublished || "—"}
                />
                <DetailItem
                  icon={Activity}
                  label="Sports, Clubs, Favourite Pastimes and Recreation"
                  value={profile.otherDetails.sportsInterests}
                />
                <div className="md:col-span-2">
                  <DetailItem
                    icon={Trophy}
                    label="Social and Cultural Activities, Literary, Artistic and Scientific Accomplishments and other Special Interests"
                    value={profile.otherDetails.socialActivities}
                  />
                </div>
                <div className="md:col-span-2">
                  <DetailItem
                    icon={Info}
                    label="Other Information"
                    value={profile.otherDetails.otherInformation}
                  />
                </div>
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="mb-12 print:mb-8 print:break-inside-avoid">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-200">
        <span className="text-2xl print:text-xl">{icon}</span>
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide print:text-base">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase text-slate-400 font-semibold mb-2">
        {label}
      </p>
      <p className="text-base font-medium text-gray-900 print:text-sm">
        {value}
      </p>
    </div>
  );
}

function ContactItem({ icon, label, value, href, isLink, isMultiline }) {
  const content = (
    <div className="flex items-start gap-4">
      <span className="text-xl shrink-0 mt-1">{icon}</span>
      <div className="flex-1">
        <p className="text-xs uppercase text-slate-400 font-semibold mb-1">
          {label}
        </p>
        <p
          className={`text-base font-medium text-gray-900 ${isMultiline ? "whitespace-pre-wrap" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );

  if (isLink) {
    return (
      <a href={href} className="hover:text-blue-900 transition-colors">
        {content}
      </a>
    );
  }

  return content;
}

function AddressBlock({ title, address }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm print:shadow-none">
      <p className="text-xs uppercase text-slate-400 font-semibold mb-4">
        {title}
      </p>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-slate-500 mb-1">Address</p>
          <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
            {address.address}
          </p>
        </div>
        {address.phone && address.phone.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-1">Phone</p>
            <p className="text-sm text-gray-900">{address.phone.join(", ")}</p>
          </div>
        )}
        {address.mobile && address.mobile.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-1">Mobile</p>
            <p className="text-sm text-gray-900">{address.mobile.join(", ")}</p>
          </div>
        )}
        {address.fax && (
          <div>
            <p className="text-xs text-slate-500 mb-1">Fax</p>
            <p className="text-sm text-gray-900">{address.fax}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  if (!value) return null;

  return (
    <div className="space-y-2 print:break-inside-avoid">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-900 shrink-0" />
        <p className="text-sm font-semibold text-gray-900">{label}</p>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {value}
      </p>
    </div>
  );
}
