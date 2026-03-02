import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppController } from '../../../controllers/useAppController';
import { getDepartmentById, getTaskById } from '../../../models/selectors';
import { PATHS } from '../../../routes';
import { formatTime } from '../../../utils/format';
import { PageHeader } from '../../components/shared/PageHeader';
import { StateBoundary } from '../../components/shared/StateBoundary';
import { ScreenFrame } from '../../layouts/ScreenFrame';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export function RequesterConfirmScreen() {
  const { taskId } = useParams<{ taskId: string }>();
  const controller = useAppController();
  const navigate = useNavigate();
  const { state } = controller;
  const mode = state.screenModes['requester.confirm'];
  const task = getTaskById(state, taskId);
  const department = task ? getDepartmentById(state, task.departmentId) : undefined;

  return (
    <ScreenFrame
      screenKey="requester.confirm"
      header={
        <PageHeader
          eyebrow="Rekvirerende afdeling"
          title="Opgave sendt"
          subtitle="Bestillingen er registreret i den lokale prototype og er synlig for planlægger/team."
        />
      }
      footer={
        <div className="grid gap-2 sm:grid-cols-2">
          <Button fullWidth onClick={() => navigate(PATHS.requesterStatus)}>
            Se status på egne opgaver
          </Button>
          <Button fullWidth variant="secondary" onClick={() => navigate(PATHS.requesterCreate)}>
            Opret ny opgave
          </Button>
        </div>
      }
    >
      <StateBoundary
        mode={mode}
        hasContent={Boolean(task)}
        onRetry={() => controller.retryScreen('requester.confirm')}
        emptyTitle="Opgaven blev ikke fundet"
        emptyText="Gå tilbage og opret en ny opgave."
        emptyAction={
          <Button asChild>
            <Link to={PATHS.requesterCreate}>Opret opgave</Link>
          </Button>
        }
      >
        {task ? (
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <Card title="Kvittering" subtitle="Klar og kort besked til travl afdeling.">
              <div className="space-y-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                  <p className="text-lg font-black">Opgave sendt</p>
                  <p className="mt-1 text-sm">{task.patientId} · {task.location}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Afdeling</p>
                    <p className="font-semibold text-slate-900">{department?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Prioritet</p>
                    <p className="font-semibold text-slate-900">{task.priority === 'akut' ? 'Akut' : 'Standard'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Oprettet</p>
                    <p className="font-semibold text-slate-900">{formatTime(task.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <p className="font-semibold text-slate-900">{task.status}</p>
                  </div>
                </div>
              </div>
            </Card>
            <Card title="Forventet respons" subtitle="Viser realistisk forventning uden at love mere end systemet kan. ">
              <div className="space-y-2 text-sm">
                <Badge tone={task.priority === 'akut' ? 'danger' : 'info'}>
                  {task.priority === 'akut' ? 'Høj prioritet behandles først' : 'Standard indgår i team-fordeling'}
                </Badge>
                <p className="text-slate-700">
                  {task.priority === 'akut'
                    ? 'Planlægger kan reagere med det samme. Ved ændringer kan der sendes besked i tråden.'
                    : 'Opgaven fordeles til team. Ved travlhed kan ventetiden stige, og det vises i statuslisten.'}
                </p>
              </div>
            </Card>
          </div>
        ) : null}
      </StateBoundary>
    </ScreenFrame>
  );
}
