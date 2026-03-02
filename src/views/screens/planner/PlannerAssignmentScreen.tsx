import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppController } from '../../../controllers/useAppController';
import { getEmployeeById, getQueueTasksForPlanner, getTasksForEmployee, getTasksForTeam } from '../../../models/selectors';
import type { Task } from '../../../models/types';
import { PATHS } from '../../../routes';
import { PageHeader } from '../../components/shared/PageHeader';
import { StateBoundary } from '../../components/shared/StateBoundary';
import { TaskCard } from '../../components/shared/TaskCard';
import { ScreenFrame } from '../../layouts/ScreenFrame';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Switch } from '../../components/ui/Fields';

export function PlannerAssignmentScreen() {
  const controller = useAppController();
  const { state } = controller;
  const mode = state.screenModes['planner.assign'];
  const queue = getQueueTasksForPlanner(state);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const teamsWithEmployees = useMemo(
    () =>
      state.teams.map((team) => ({
        team,
        employees: state.employees.filter((employee) => employee.teamId === team.id && employee.onShift),
      })),
    [state.employees, state.teams],
  );

  const dragTask = dragTaskId ? state.tasks.find((task) => task.id === dragTaskId) : undefined;

  const onDragStart = (taskId: string) => setDragTaskId(taskId);
  const onDragEnd = () => setDragTaskId(null);

  const onDropToTeam = (teamId: string) => {
    if (!dragTaskId) return;
    controller.assignTask(dragTaskId, teamId, undefined);
    setDragTaskId(null);
  };

  const onDropToEmployee = (employeeId: string) => {
    if (!dragTaskId) return;
    controller.assignTask(dragTaskId, undefined, employeeId);
    setDragTaskId(null);
  };

  const assignedCounts = state.teams.map((team) => ({
    teamId: team.id,
    count: getTasksForTeam(state, team.id).length,
  }));

  return (
    <ScreenFrame
      screenKey="planner.assign"
      header={
        <PageHeader
          eyebrow="Planlægger / Koordinator"
          title="Tildeling"
          subtitle="Træk opgaver til team eller medarbejder. Ventende opgaver viser semitvungen auto-tildeling efter 15 minutter."
          actions={
            <Button onClick={() => setSummaryOpen(true)} iconLeft="✅">
              Se fordeling
            </Button>
          }
        />
      }
    >
      <StateBoundary
        mode={mode}
        hasContent={queue.length > 0 || state.tasks.length > 0}
        onRetry={() => controller.retryScreen('planner.assign')}
        emptyTitle="Ingen opgaver at tildele"
        emptyText="Køen er tom lige nu. Nye opgaver vises automatisk i denne prototype." 
        fallbackContent={<p className="text-sm">Senest kendte tildelinger vises fortsat i kolonnerne.</p>}
      >
        <div className="grid gap-4 xl:grid-cols-[1.05fr_1.6fr]">
          <Card
            title="Venter på tildeling"
            subtitle="Træk kort til et team eller en medarbejder. Auto-tildeling kører nedtælling i UI."
            actions={dragTask ? <Badge tone="info">Trækker: {dragTask.patientId}</Badge> : undefined}
          >
            <div className="space-y-3">
              {queue.length ? (
                queue.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => onDragStart(task.id)}
                    onDragEnd={onDragEnd}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <TaskCard
                      task={task}
                      state={state}
                      showAutoAssign
                      actions={
                        <Button asChild variant="ghost" size="sm">
                          <Link to={PATHS.plannerChat(task.id)}>Besked</Link>
                        </Button>
                      }
                    />
                    <div className="mt-2 px-1">
                      <Switch
                        checked={!!task.lockedToTeam}
                        onChange={() => controller.toggleTaskLock(task.id)}
                        label="Lås opgave til team"
                        description="Begrænser afmeldingsmisbrug ved at holde opgaven i team-kø"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Ingen ventende opgaver. Tjek teamkolonner for auto-tildelte opgaver.
                </div>
              )}
            </div>
          </Card>

          <div className="grid gap-4">
            {teamsWithEmployees.map(({ team, employees }) => {
              const teamTasks = getTasksForTeam(state, team.id);
              return (
                <Card
                  key={team.id}
                  title={team.name}
                  subtitle="Slip opgave her for teamtildeling, eller vælg en medarbejder nedenfor."
                  actions={<Badge tone="brand">{teamTasks.length} aktive</Badge>}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => onDropToTeam(team.id)}
                  className="border-slate-300"
                >
                  <div className="grid gap-3">
                    <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50/70 p-3 text-sm text-brand-900">
                      <p className="font-semibold">Slip her for tildeling til {team.name}</p>
                      <p className="mt-1">Brug dette når du vil lade teamet vælge medarbejder selv.</p>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-2">
                      {employees.map((employee) => {
                        const employeeTasks = getTasksForEmployee(state, employee.id);
                        return (
                          <div
                            key={employee.id}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => onDropToEmployee(employee.id)}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                          >
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <p className="font-semibold text-slate-900">{employee.name}</p>
                              <Badge tone="neutral">{employeeTasks.length}</Badge>
                            </div>
                            <div className="mb-2 rounded-lg border border-dashed border-slate-300 bg-white p-2 text-xs text-slate-500">
                              Slip opgave her
                            </div>
                            <div className="space-y-2">
                              {employeeTasks.slice(0, 3).map((task) => (
                                <div key={task.id} className="rounded-lg border border-slate-200 bg-white p-2 text-sm">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-slate-900">{task.patientId}</span>
                                    <Badge tone={task.priority === 'akut' ? 'danger' : 'neutral'}>{task.priority === 'akut' ? 'Akut' : 'Std'}</Badge>
                                  </div>
                                  <p className="mt-1 text-xs text-slate-600">{task.location}</p>
                                  <div className="mt-2 flex gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => controller.assignTask(task.id, team.id, undefined)}>
                                      Til team-kø
                                    </Button>
                                    <Button asChild size="sm" variant="ghost">
                                      <Link to={PATHS.plannerChat(task.id)}>Besked</Link>
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              {employeeTasks.length === 0 ? (
                                <p className="text-xs text-slate-500">Ingen opgaver tildelt endnu.</p>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </StateBoundary>

      <Modal
        open={summaryOpen}
        title="Fordelingsstatus"
        onClose={() => setSummaryOpen(false)}
        footer={<Button onClick={() => setSummaryOpen(false)}>Luk</Button>}
      >
        <p>Fordelingen er lokal i prototypen og bruges kun til UI-demonstration.</p>
        <div className="grid gap-2">
          {assignedCounts.map(({ teamId, count }) => {
            const team = state.teams.find((item) => item.id === teamId);
            return (
              <div key={teamId} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span className="font-semibold text-slate-900">{team?.name}</span>
                <Badge tone="info">{count} aktive opgaver</Badge>
              </div>
            );
          })}
        </div>
      </Modal>
    </ScreenFrame>
  );
}
