import { useNavigate } from 'react-router-dom';
import { useAppController } from '../../../controllers/useAppController';
import { getDepartmentById, getTasksByRequesterDept, statusLabel, typeLabel } from '../../../models/selectors';
import { PATHS } from '../../../routes';
import { formatTime, minutesAgo } from '../../../utils/format';
import { PageHeader } from '../../components/shared/PageHeader';
import { StateBoundary } from '../../components/shared/StateBoundary';
import { ScreenFrame } from '../../layouts/ScreenFrame';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export function RequesterStatusScreen() {
  const controller = useAppController();
  const navigate = useNavigate();
  const { state } = controller;
  const mode = state.screenModes['requester.status'];
  const tasks = getTasksByRequesterDept(state);
  const department = getDepartmentById(state, state.currentRequesterDeptId);

  return (
    <ScreenFrame
      screenKey="requester.status"
      header={
        <PageHeader
          eyebrow="Rekvirerende afdeling"
          title="Status på egne opgaver"
          subtitle={`${department?.name ?? 'Afdeling'} · se status og seneste opdatering uden at ringe rundt.`}
          actions={<Button onClick={() => navigate(PATHS.requesterCreate)}>Opret ny opgave</Button>}
        />
      }
    >
      <StateBoundary
        mode={mode}
        hasContent={tasks.length > 0}
        onRetry={() => controller.retryScreen('requester.status')}
        emptyTitle="Ingen opgaver fra afdelingen endnu"
        emptyText="Start med at oprette en opgave."
        emptyAction={<Button onClick={() => navigate(PATHS.requesterCreate)}>Opret opgave</Button>}
        fallbackContent={
          <div className="space-y-2 text-sm">
            {tasks.slice(0, 2).map((task) => (
              <div key={task.id} className="rounded-xl border border-slate-200 p-2">
                {task.patientId} · {statusLabel(task.status)}
              </div>
            ))}
          </div>
        }
      >
        <div className="grid gap-3">
          {tasks.map((task) => (
            <Card key={task.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-slate-950">{task.patientId} · {task.location}</p>
                  <p className="text-sm text-slate-600">{typeLabel(task.type)} · oprettet {formatTime(task.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={task.priority === 'akut' ? 'danger' : 'neutral'}>{task.priority === 'akut' ? 'Akut' : 'Standard'}</Badge>
                  <Badge tone={task.status === 'faerdig' ? 'ok' : task.status === 'igang' ? 'brand' : task.status === 'venter' ? 'warn' : 'info'}>
                    {statusLabel(task.status)}
                  </Badge>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs text-slate-500">Seneste opdatering</p>
                  <p className="font-semibold text-slate-900">{formatTime(task.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tid siden oprettelse</p>
                  <p className="font-semibold text-slate-900">{minutesAgo(task.createdAt, state.now)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tildeling</p>
                  <p className="font-semibold text-slate-900">{task.assignedTeamId ? task.assignedTeamId.replace('team-', 'Team ') : 'Afventer'}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </StateBoundary>
    </ScreenFrame>
  );
}
