import React from "react";

function IconBase({ children, className, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

function createIcon(paths) {
  return function Icon(props) {
    return <IconBase {...props}>{paths}</IconBase>;
  };
}

export const Loader2 = createIcon(<path d="M12 2a10 10 0 1 0 10 10" />);
export const Inbox = createIcon(
  <>
    <path d="M4 4h16v12H4z" />
    <path d="M4 12h5l2 3h2l2-3h5" />
  </>
);
export const CheckCircle2 = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 12 2 2 4-4" />
  </>
);
export const Info = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8h.01" />
    <path d="M11 12h2v4h-2" />
  </>
);
export const TriangleAlert = createIcon(
  <>
    <path d="M12 3 2 20h20L12 3z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </>
);
export const XCircle = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 9 6 6" />
    <path d="m15 9-6 6" />
  </>
);
export const X = createIcon(
  <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>
);
export const AlertTriangle = TriangleAlert;
export const Activity = createIcon(<path d="m3 12 4-4 3 8 4-10 3 6 4-4" />);
export const Building2 = createIcon(
  <>
    <path d="M6 22V4h12v18" />
    <path d="M3 22h18" />
    <path d="M10 8h1" />
    <path d="M13 8h1" />
    <path d="M10 12h1" />
    <path d="M13 12h1" />
  </>
);
export const Clock3 = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>
);
export const CircleDotDashed = createIcon(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M5 12a7 7 0 0 1 14 0" />
    <path d="M12 19a7 7 0 0 1-7-7" />
  </>
);
export const Hospital = createIcon(
  <>
    <path d="M4 21V5h16v16" />
    <path d="M9 21v-5h6v5" />
    <path d="M12 8v4" />
    <path d="M10 10h4" />
  </>
);
export const User = createIcon(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M6 20a6 6 0 0 1 12 0" />
  </>
);
export const ChevronDown = createIcon(<path d="m6 9 6 6 6-6" />);
export const ChevronUp = createIcon(<path d="m18 15-6-6-6 6" />);
export const Sparkles = createIcon(
  <>
    <path d="m12 3 1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3z" />
    <path d="m5 16 .8 1.8L7.5 19l-1.7.7L5 21l-.8-1.3L2.5 19l1.7-1.2L5 16z" />
  </>
);
export const Hand = createIcon(
  <>
    <path d="M8 11V6a1 1 0 0 1 2 0v5" />
    <path d="M10 11V5a1 1 0 0 1 2 0v6" />
    <path d="M12 11V6a1 1 0 0 1 2 0v5" />
    <path d="M14 11V8a1 1 0 0 1 2 0v5c0 4-2 8-6 8s-6-3-6-7v-3a1 1 0 0 1 2 0v2" />
  </>
);
export const PauseCircle = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M10 9v6" />
    <path d="M14 9v6" />
  </>
);
export const Play = createIcon(<path d="m10 8 6 4-6 4z" />);
export const SquareCheckBig = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="m8 12 2.5 2.5L16 9" />
  </>
);
export const Search = createIcon(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </>
);
export const Siren = createIcon(
  <>
    <path d="M8 15a4 4 0 0 1 8 0v3H8v-3z" />
    <path d="M6 18h12" />
    <path d="M12 3v3" />
    <path d="M4 8l2 1" />
    <path d="m20 8-2 1" />
  </>
);
export const CloudOff = createIcon(
  <>
    <path d="M5 16a4 4 0 1 1 1-7 5 5 0 0 1 9-1" />
    <path d="m2 2 20 20" />
  </>
);
export const Server = createIcon(
  <>
    <rect x="3" y="4" width="18" height="6" rx="2" />
    <rect x="3" y="14" width="18" height="6" rx="2" />
    <path d="M7 7h.01" />
    <path d="M7 17h.01" />
  </>
);
