import { useMemo, useState } from "react";
import { StatusBadge } from "./StatusBadge";

const statusLabels = {
  ok: "OK",
  advarsel: "Advarsel",
  kritisk: "Kritisk",
  iGang: "I gang"
};

const kanbanColumns = [
  { key: "ikkeStartet", title: "Ikke startet" },
  { key: "iGang", title: "I gang" },
  { key: "afventerHjaelp", title: "Afventer hjælp" }
];

function SectionCard({ section }) {
  return (
    <article className="rounded-2xl border border-ui-line bg-white p-4 shadow-calm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900">{section.name}</h3>
        <StatusBadge
          status={section.status}
          label={statusLabels[section.status] ?? "Status"}
        />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-slate-50 p-2">
          <p className="font-semibold text-slate-900">{section.patientLoad}</p>
          <p className="text-slate-600">Patienter</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">
          <p className="font-semibold text-slate-900">{section.staffOnDuty}</p>
          <p className="text-slate-600">På vagt</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">
          <p className="font-semibold text-slate-900">{section.waitingHelp}</p>
          <p className="text-slate-600">Hjælp</p>
        </div>
      </div>
    </article>
  );
}

export function PlannerView({ data }) {
  const [onlyAlerts, setOnlyAlerts] = useState(false);

  const visibleSections = useMemo(() => {
    if (!onlyAlerts) {
      return data.sections;
    }

    return data.sections.filter((section) => section.status !== "ok");
  }, [data.sections, onlyAlerts]);

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ui-line bg-ui-panel p-5 shadow-calm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Planlægger
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">Driftsoverblik</h2>
        </div>
        <button
          type="button"
          onClick={() => setOnlyAlerts((prev) => !prev)}
          className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
        >
          {onlyAlerts ? "Vis alle afsnit" : "Vis kun advarsler"}
        </button>
      </header>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Afsnit</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {visibleSections.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-ui-line bg-ui-panel p-5 shadow-calm">
        <h3 className="text-lg font-semibold text-slate-900">Medarbejderstatus</h3>
        <ul className="mt-4 space-y-3">
          {data.staff.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{member.name}</p>
                <p className="text-xs text-slate-600">
                  {member.section} · {member.task}
                </p>
              </div>
              <StatusBadge
                status={member.status}
                label={statusLabels[member.status] ?? "Status"}
              />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Kanban</h3>
        <div className="grid gap-3 lg:grid-cols-3">
          {kanbanColumns.map((column) => (
            <article
              key={column.key}
              className="rounded-2xl border border-ui-line bg-ui-panel p-4 shadow-calm"
            >
              <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">
                {column.title}
              </h4>
              <div className="mt-3 space-y-2">
                {data.kanban[column.key].map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <p className="text-sm font-medium text-slate-900">{task.title}</p>
                    <p className="mt-1 text-xs text-slate-600">{task.section}</p>
                    <p className="mt-2 text-xs font-medium text-sky-700">{task.eta}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
