const statusClasses = {
  ok: "border-emerald-200 bg-emerald-50 text-emerald-700",
  advarsel: "border-amber-200 bg-amber-50 text-amber-700",
  kritisk: "border-rose-200 bg-rose-50 text-rose-700",
  iGang: "border-sky-200 bg-sky-50 text-sky-700",
  klar: "border-slate-200 bg-slate-50 text-slate-700"
};

export function StatusBadge({ status, label }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        statusClasses[status] ?? statusClasses.klar
      }`}
    >
      {label}
    </span>
  );
}
