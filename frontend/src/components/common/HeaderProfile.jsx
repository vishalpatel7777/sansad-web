import { formatEmail, formatPhone } from "@utils/formatters";
import { getProxyImageUrl } from "@utils/api";

export default function HeaderProfile({
  image,
  title,
  subtitle,
  badge,
  primaryMeta = [],
  secondaryMeta = [],
  compact = false,
}) {
  return (
    <section className="bg-white py-6 text-center shadow-sm print:py-8">
      <div className="">
        {/* Avatar */}
        {image && (
          <img
            src={getProxyImageUrl(image)}
            alt={title}
            className={`mx-auto rounded-full border-4 border-slate-200 shadow-lg object-cover ${
              compact ? "w-24 h-24" : "w-32 h-32"
            }`}
          />
        )}

        {/* Badge */}
        {badge && !compact && (
          <div className="mt-3 flex justify-center">
            <span className="inline-block px-3 py-1 bg-blue-900 text-white text-xs font-bold rounded-full">
              {badge}
            </span>
          </div>
        )}

        {/* Title */}
        <h1
          className={`font-bold mt-2 text-gray-900 ${
            compact ? "text-xl" : "text-2xl"
          }`}
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-slate-600 font-semibold mt-1">{subtitle}</p>
        )}

        {/* Primary Meta (House | State etc.) */}
        {primaryMeta.length > 0 && (
          <p className="mt-1 text-sm text-slate-600 font-medium">
            {primaryMeta.filter(Boolean).join(" | ")}
          </p>
        )}

        {/* Secondary Meta (Party | Email | Phone) */}
        {secondaryMeta.length > 0 && (
          <p className="mt-1 text-sm text-slate-600 font-medium">
            {secondaryMeta
              .map((item) => {
                if (!item) return null;
                if (item.includes("[at]") || item.includes("[dot]"))
                  return formatEmail(item);
                if (item.match(/^\d|^\(/)) return formatPhone(item);
                return item;
              })
              .filter(Boolean)
              .join(" | ")}
          </p>
        )}
      </div>
    </section>
  );
}
