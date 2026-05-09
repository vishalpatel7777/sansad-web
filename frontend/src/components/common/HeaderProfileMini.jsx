// import { memo, useMemo } from "react";
// import { formatEmail, formatPhone } from "@utils/formatters";

// export default function HeaderProfileMini({
//   image,
//   title,
//   primaryMeta = [],
//   secondaryMeta = [],
// }) {
//   return (
//     <div className="flex items-center gap-3 ml-4 min-w-0">
//       {/* Avatar */}
//       {image && (
//         <img
//           src={image}
//           alt={title}
//           className="w-8 h-8 rounded-full border border-slate-300 object-cover shrink-0"
//         />
//       )}

//       {/* Text */}
//       <div className="min-w-0 leading-tight">
//         {/* Name */}
//         <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>

//         {/* Primary meta */}
//         {primaryMeta.length > 0 && (
//           <p className="text-xs text-slate-600 truncate">
//             {primaryMeta.filter(Boolean).join(" | ")}
//           </p>
//         )}

//         {/* Secondary meta */}
//         {secondaryMeta.length > 0 && (
//           <p className="text-xs text-slate-500 truncate">
//             {secondaryMeta
//               .map((item) => {
//                 if (!item) return null;
//                 if (item.includes("[at]") || item.includes("[dot]"))
//                   return formatEmail(item);
//                 if (item.match(/^\d|^\(/)) return formatPhone(item);
//                 return item;
//               })
//               .filter(Boolean)
//               .join(" | ")}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }


// HeaderProfileMini.jsx - REPLACE entire component

import { memo, useMemo } from "react";
import { formatEmail, formatPhone } from "@utils/formatters";
import { getProxyImageUrl } from "@utils/api";

const HeaderProfileMini = memo(function HeaderProfileMini({
  image,
  title,
  primaryMeta = [],
  secondaryMeta = [],
}) {
  const formattedSecondaryMeta = useMemo(() => {
    return secondaryMeta
      .map((item) => {
        if (!item) return null;
        if (item.includes("[at]") || item.includes("[dot]"))
          return formatEmail(item);
        if (item.match(/^\d|^\(/)) return formatPhone(item);
        return item;
      })
      .filter(Boolean)
      .join(" | ");
  }, [secondaryMeta]);

  return (
    <div className="flex items-center gap-3 ml-4 min-w-0">
      {/* Avatar */}
      {image && (
        <img
          src={getProxyImageUrl(image)}
          alt={title}
          className="w-8 h-8 rounded-full border border-slate-300 object-cover shrink-0"
        />
      )}

      {/* Text */}
      <div className="min-w-0 leading-tight">
        {/* Name */}
        <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>

        {/* Primary meta */}
        {primaryMeta.length > 0 && (
          <p className="text-xs text-slate-600 truncate">
            {primaryMeta.filter(Boolean).join(" | ")}
          </p>
        )}

        {/* Secondary meta */}
        {formattedSecondaryMeta && (
          <p className="text-xs text-slate-500 truncate">
            {formattedSecondaryMeta}
          </p>
        )}
      </div>
    </div>
  );
});

export default HeaderProfileMini;
