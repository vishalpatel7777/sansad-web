import { useNavigate } from "react-router-dom";
import { formatEmail, formatPhone } from "@utils/formatters";
import { getProxyImageUrl } from "@utils/api";

export default function PersonHorizontalCard({ member }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/person/${member.id}/dashboard`)}
      className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <img
            src={getProxyImageUrl(member.image)}
            alt={`Portrait of ${member.name}`}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
            }}
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <div className="flex-1">
          <h3 className="mb-1 text-lg font-bold leading-tight text-ink-gray">
            {member.name}
          </h3>

          <span
            className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
              member.house === "Lok Sabha"
                ? "bg-blue-50 text-primary"
                : "bg-indigo-50 text-indigo-700"
            }`}
          >
            {member.house}
          </span>

          <p className="mt-2 text-sm text-gray-600">
            {member.state}
            {member.constituency && ` | ${member.constituency}`}
          </p>
        </div>
      </div>

      <div className="pt-4 space-y-2 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="material-symbols-outlined text-primary">mail</span>
          <span>{formatEmail(member.email)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="material-symbols-outlined text-primary">call</span>
          <span>{formatPhone(member.phone)}</span>
        </div>
      </div>
    </div>
  );
}
