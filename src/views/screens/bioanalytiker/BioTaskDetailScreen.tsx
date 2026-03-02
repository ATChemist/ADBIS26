import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppController } from '../../../controllers/useAppController';
import { getDepartmentById, getEmployeeById, getTaskById, getTeamById, typeLabel } from '../../../models/selectors';
import { PATHS } from '../../../routes';
import { formatTime, minutesAgo } from '../../../utils/format';
import { PageHeader } from '../../components/shared/PageHeader';
import { PriorityBadge, TaskStatusBadge } from '../../components/shared/StatusBadge';
import { StateBoundary } from '../../components/shared/StateBoundary';
import { ScreenFrame } from '../../layouts/ScreenFrame';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

function ctaForTask(taskStatus: string, assignedToMe: boolean) {
  if (taskStatus === 'venter') return 'Tag opgave';
  if (taskStatus === 'tildelt' && assignedToMe) return 'Start';
  if (taskStatus === 'igang' && assignedToMe) return 'Markér færdig';
  if (taskStatus === 'tildelt') return 'Tildelt kollega';
  if (taskStatus === 'faerdig') return 'Allerede færdig';
  return 'Ingen handling';
}

export function BioTaskDetailScreen() {
  const { taskId } = useParams<{ taskId: string }>();
  const controller = useAppController();
  const navigate = useNavigate();
  const { state } = controller;
  const mode = state.screenModes['bio.detail'];
  const task = getTaskById(state, taskId);
  const department = task ? getDepartmentById(state, task.departmentId) : undefined;
  const team = task ? getTeamById(state, task.assignedTeamId) : undefined;
  const assignee = task ? getEmployeeById(state, task.assignedEmployeeId) : undefined;
  const assignedToMe = task?.assignedEmployeeId === state.currentBioanalystId;
  const canAct = !!task && !state.offline;

  const primaryLabel = task ? ctaForTask(task.status, assignedToMe) : 'Ingen opgave';
  const primaryDisabled =
    !task ||
    task.status === 'faerdig' ||
    (task.status === 'tildelt' && !assignedToMe) ||
    state.offline;

  const handlePrimary = () => {
    if (!task) return;
    if (task.status === 'venter') {
      controller.takeTask(task.id);
      return;
    }
    if (task.status === 'tildelt' && assignedToMe) {
      controller.startTask(task.id);
      return;
    }
    if (task.status === 'igang' && assignedToMe) {
      controller.completeTask(task.id);
    }
  };

  return (
    <ScreenFrame
      screenKey="bio.detail"
      mobile
      header={
        <PageHeader
          eyebrow="Bioanalytiker"
          title="Opgavedetalje"
          subtitle={task ? 'Se status og udfør næste trin uden unødige valg.' : 'Ingen opgave valgt'}
          actions={
            task ? (
              <Link to={PATHS.bioTasks} className="text-sm font-semibold text-brand-800 hover:underline">
                Til liste
              </Link>
            ) : null
          }
        />
      }
      footer={
        task ? (
          <div className="grid gap-2">
            <Button fullWidth size="lg" disabled={primaryDisabled} onClick={handlePrimary}>
              {primaryLabel}
            </Button>
            <Button fullWidth variant="secondary" onClick={() => controller.requestHelp('detail', task.id)} disabled={!canAct}>
              Anmode om hjælp
            </Button>
            {(assignedToMe || task.status === 'igang' || task.status === 'tildelt') && task.status !== 'faerdig' ? (
              <Button fullWidth variant="ghost" onClick={() => navigate(PATHS.bioTaskCancel(task.id))}>
                Afmeld opgave
              </Button>
            ) : null}
          </div>
        ) : null
      }
    >
      <StateBoundary
        mode={mode}
        hasContent={Boolean(task)}
        onRetry={() => controller.retryScreen('bio.detail')}
        emptyTitle="Opgaven blev ikke fundet"
        emptyText="Gå tilbage til opgavelisten og vælg en aktiv opgave."
        emptyAction={<Button onClick={() => navigate(PATHS.bioTasks)}>Til opgaveliste</Button>}
        fallbackContent={task ? <div className="text-sm">{task.patientName} · {task.patientId}</div> : undefined}
      >
        {task ? (
          <div className="grid gap-3">
            <Card>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-slate-950">{task.patientName}</p>
                    <p className="text-sm text-slate-600">{task.patientId} · {task.location}</p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <PriorityBadge priority={task.priority} />
                    <TaskStatusBadge status={task.status} />
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-slate-500">Afdeling</dt>
                    <dd className="font-semibold text-slate-900">{department?.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Type</dt>
                    <dd className="font-semibold text-slate-900">{typeLabel(task.type)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Tildelt team</dt>
                    <dd className="font-semibold text-slate-900">{team?.name ?? 'Ikke tildelt'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Medarbejder</dt>
                    <dd className="font-semibold text-slate-900">{assignee?.name ?? 'Ikke taget endnu'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Oprettet</dt>
                    <dd className="font-semibold text-slate-900">{minutesAgo(task.createdAt, state.now)} siden</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Senest opdatering</dt>
                    <dd className="font-semibold text-slate-900">{formatTime(task.updatedAt)}</dd>
                  </div>
                </dl>
              </div>
            </Card>

            <Card title="Ekstra tjek" subtitle="Hver 5. standardpatient markeres automatisk.">
              {task.priority === 'akut' ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                  <p className="font-semibold">Ekstra tjek: ikke påkrævet</p>
                  <p className="mt-1">Akut undtagelse er aktiv for denne opgave.</p>
                </div>
              ) : task.requiresExtraCheck ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                    <p className="font-semibold">Dette er patient #5 i standardflowet → ekstra tjek kræves</p>
                    <p className="mt-1">Udfør alle punkter før opgaven markeres færdig.</p>
                  </div>
                  <div className="space-y-2">
                    {task.extraCheckItems.map((item) => (
                      <label key={item.id} className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => controller.toggleExtraCheckItem(task.id, item.id)}
                          className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          disabled={state.offline}
                        />
                        <span className="text-sm font-medium text-slate-900">{item.label}</span>
                      </label>
                    ))}
                  </div>
                  <Badge tone={task.extraCheckCompleted ? 'ok' : 'warn'}>
                    {task.extraCheckCompleted ? 'Ekstra tjek udført' : 'Ekstra tjek mangler'}
                  </Badge>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  Standardopgave uden ekstra tjek i denne omgang.
                </div>
              )}
            </Card>
          </div>
        ) : null}
      </StateBoundary>
    </ScreenFrame>
  );
}
