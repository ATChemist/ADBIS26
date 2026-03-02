import { useState } from "react";
import { EmployeeView } from "./components/EmployeeView";
import { PlannerView } from "./components/PlannerView";
import { mockData } from "./data/mockData";

const views = [
  { id: "employee", label: "Medarbejder UI" },
  { id: "planner", label: "Planlægger UI" }
];

export default function App() {
  const [activeView, setActiveView] = useState("employee");
  const [employeeStatus, setEmployeeStatus] = useState(mockData.employee.status);
  const [hasStartedTask, setHasStartedTask] = useState(false);
  const [helpRequested, setHelpRequested] = useState(false);

  const handleStartTask = () => {
    setHasStartedTask(true);
    setEmployeeStatus(helpRequested ? "kritisk" : "iGang");
  };

  const handleToggleHelp = () => {
    setHelpRequested((prev) => {
      const next = !prev;
      setEmployeeStatus(next ? "kritisk" : hasStartedTask ? "iGang" : "klar");
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e8f1ff_0%,_#f3f5f7_45%,_#eef2f6_100%)] px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-ui-line bg-ui-panel p-5 shadow-calm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Hospital Koordineringssystem
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                Prototype · UI
              </h1>
            </div>
            <div className="inline-flex rounded-xl border border-slate-300 bg-slate-100 p-1">
              {views.map((view) => (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setActiveView(view.id)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    activeView === view.id
                      ? "bg-action text-white"
                      : "text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {activeView === "employee" ? (
          <EmployeeView
            data={mockData.employee}
            currentStatus={employeeStatus}
            hasStartedTask={hasStartedTask}
            helpRequested={helpRequested}
            onStartTask={handleStartTask}
            onToggleHelp={handleToggleHelp}
          />
        ) : (
          <PlannerView data={mockData.planner} />
        )}
      </div>
    </main>
  );
}
