import { Link } from 'react-router-dom';
import { useAppController } from '../../../controllers/useAppController';
import {
  getActiveHelpRequests,
  getDepartmentById,
  getDepartmentLoads,
  getEmployeeById,
  getMorningRoundProgress,
} from '../../../models/selectors';
import { PATHS } from '../../../routes';
import { formatDurationMinutes, formatTime } from '../../../utils/format';
import { PageHeader } from '../../components/shared/PageHeader';
import { ScreenFrame } from '../../layouts/ScreenFrame';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StateBoundary } from '../../components/shared/StateBoundary';

const pressureUi = {
  lav: { label: 'Lav belastning', icon: '🟢', tone: 'ok' as const },
  middel: { label: 'Middel belastning', icon: '🟡', tone: 'warn' as const },
  høj: { label: 'Høj belastning', icon: '🔴', tone: 'danger' as const },
};

export function PlannerOverviewScreen() {
  const controller = useAppController();
  const { state } = controller;
  const mode = state.screenModes['planner.overview'];
  const loads = getDepartmentLoads(state);
  const helpRequests = getActiveHelpRequests(state);
  const progress = getMorningRoundProgress(state);

  const areaGroups = ['Nord', 'Syd', 'Vest'].map((area) => ({
    area,
    items: loads.filter((load) => getDepartmentById(state, load.departmentId)?.area === area),
  }));

  return (
    <ScreenFrame
      screenKey="planner.overview"
      header={
        <PageHeader
          eyebrow="Planlægger / Koordinator"
          title="Overblik og belastning"
          subtitle="Se hvor der er mest brug for hjælp, og flyt hurtigt til tildeling eller kommunikation."
          actions={
            <Button asChild iconLeft="🧭">
              <Link to={PATHS.plannerAssign}>Gå til tildeling</Link>
            </Button>
          }
        />
      }
    >
      <StateBoundary
        mode={mode}
        hasContent={loads.length > 0}
        onRetry={() => controller.retryScreen('planner.overview')}
        emptyTitle="Ingen afdelinger at vise"
        emptyText="Tilføj afdelinger eller opgaver for at se belastning."
        fallbackContent={<p className="text-sm">Senest gemte belastningstal kan stadig bruges til orientering.</p>}
      >
        <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
          <div className="grid gap-4">
            <Card title="Morgenrunde status" subtitle="Benchmark 07:30-09:00. Progress bar viser tid, ikke antal opgaver.">
              <div className="space-y-3">
                <ProgressBar
                  value={progress.percent}
                  max={100}
                  tone={progress.isLate ? 'danger' : progress.percent >= 85 ? 'warn' : 'brand'}
                  label={`Klokken ${formatTime(state.now)} · ${progress.isLate ? 'Måletid passeret' : 'Frem mod 09:00'}`}
                />
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Prøvetagere på vagt</p>
                    <p className="text-xl font-black text-slate-950">18</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Mål for morgenrunde</p>
                    <p className="text-xl font-black text-slate-950">09:00</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Patientfokus</p>
                    <p className="text-base font-bold text-brand-900">Ventetid minimeres</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Hvor er der mest brug for hjælp" subtitle="Farve + ikon + tekstlabel gør presset tydeligt uden kun at bruge farver.">
              <div className="grid gap-4 lg:grid-cols-3">
                {areaGroups.map((group) => (
                  <div key={group.area} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-900">Område {group.area}</h3>
                      <Badge tone="neutral">{group.items.length} afdelinger</Badge>
                    </div>
                    <div className="space-y-3">
                      {group.items.map((load) => {
                        const department = getDepartmentById(state, load.departmentId);
                        const ui = pressureUi[load.pressureLevel];
                        return (
                          <div key={load.departmentId} className="rounded-xl border border-slate-200 bg-white p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-slate-900">{department?.name}</p>
                                <p className="text-xs text-slate-500">{department?.phoneLabel}</p>
                              </div>
                              <Badge tone={ui.tone}>{ui.icon} {ui.label}</Badge>
                            </div>
                            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <p className="text-xs text-slate-500">Åbne</p>
                                <p className="font-bold text-slate-900">{load.openCount}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Akutte</p>
                                <p className="font-bold text-red-700">{load.acuteCount}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Snit ventetid</p>
                                <p className="font-bold text-slate-900">{formatDurationMinutes(load.avgWaitMinutes)}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-4 content-start">
            <Card
              title="Hvem har trykket ‘Brug for hjælp’"
              subtitle="Tidsstempel gør det let at prioritere den ældste anmodning først."
              actions={<Badge tone="info">{helpRequests.length} aktive signaler</Badge>}
            >
              {helpRequests.length ? (
                <div className="space-y-2">
                  {helpRequests.map((request) => {
                    const employee = getEmployeeById(state, request.employeeId);
                    return (
                      <div key={request.id} className="rounded-xl border border-slate-200 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-900">{employee?.name ?? 'Ukendt medarbejder'}</p>
                            <p className="text-xs text-slate-500">
                              {request.source === 'detail' ? 'Fra opgavedetalje' : 'Fra Min vagt'}
                              {request.taskId ? ` · ${request.taskId}` : ''}
                            </p>
                          </div>
                          <Badge tone="warn">{formatTime(request.createdAt)}</Badge>
                        </div>
                        <div className="mt-2 flex gap-2">
                          {request.taskId ? (
                            <Button asChild variant="secondary" size="sm">
                              <Link to={PATHS.plannerChat(request.taskId)}>Åbn besked</Link>
                            </Button>
                          ) : null}
                          <Button asChild size="sm">
                            <Link to={PATHS.plannerAssign}>Fordel hjælp</Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  Ingen aktive hjælpesignaler lige nu.
                </div>
              )}
            </Card>

            <Card title="Hurtige handlinger" subtitle="Én primær vej videre: tildeling.">
              <div className="grid gap-2">
                <Button asChild fullWidth size="lg" iconLeft="🧲">
                  <Link to={PATHS.plannerAssign}>Åbn tildeling og fordel opgaver</Link>
                </Button>
                <Button asChild fullWidth variant="secondary">
                  <Link to={PATHS.plannerChat('task-002')}>Åbn kommunikationseksempel</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </StateBoundary>
    </ScreenFrame>
  );
}
