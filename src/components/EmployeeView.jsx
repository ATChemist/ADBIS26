import { StatusBadge } from "./StatusBadge";

const statusLabels = {
  ok: "OK",
  advarsel: "Advarsel",
  kritisk: "Kritisk",
  iGang: "I gang",
  klar: "Klar"
};

export function EmployeeView({
  data,
  currentStatus,
  hasStartedTask,
  helpRequested,
  onStartTask,
  onToggleHelp
}) {
  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-ui-line bg-ui-panel p-5 shadow-calm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Medarbejder
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{data.name}</h2>
            <p className="text-sm text-slate-600">{data.role}</p>
          </div>
          <StatusBadge
            status={currentStatus}
            label={statusLabels[currentStatus] ?? "Status"}
          />
        </div>
      </header>

      <article className="rounded-2xl border border-ui-line bg-ui-panel p-5 shadow-calm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Aktiv opgave
        </p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">
          {data.activeTask.title}
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span>{data.activeTask.time}</span>
          <span className="text-slate-300">•</span>
          <span>{data.activeTask.department}</span>
          <span className="text-slate-300">•</span>
          <StatusBadge
            status={data.activeTask.priority}
            label={statusLabels[data.activeTask.priority] ?? "Prioritet"}
          />
        </div>
      </article>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onStartTask}
          className="rounded-xl bg-action px-4 py-3 text-sm font-semibold text-white transition hover:bg-action-hover"
        >
          {hasStartedTask ? "Opgave igangsat" : "Start opgave"}
        </button>
        <button
          type="button"
          onClick={onToggleHelp}
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          {helpRequested ? "Hjælp registreret" : "Brug for hjælp"}
        </button>
      </div>

      {(hasStartedTask || helpRequested) && (
        <div className="rounded-xl border border-ui-line bg-white p-4 text-sm text-slate-700">
          {hasStartedTask && <p>Opgaven er startet og registreret hos planlæggeren.</p>}
          {helpRequested && <p>Hjælpeanmodning er sendt til planlæggeren.</p>}
        </div>
      )}

      <article className="rounded-2xl border border-ui-line bg-ui-panel p-5 shadow-calm">
        <h3 className="text-lg font-semibold text-slate-900">Næste opgaver</h3>
        <ul className="mt-4 space-y-3">
          {data.nextTasks.map((task) => (
            <li
              key={task.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{task.title}</p>
                <p className="text-xs text-slate-600">
                  {task.time} · {task.department}
                </p>
              </div>
              <StatusBadge
                status={task.priority}
                label={statusLabels[task.priority] ?? "Prioritet"}
              />
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
