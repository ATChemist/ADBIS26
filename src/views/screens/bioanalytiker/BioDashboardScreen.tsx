import { Link } from 'react-router-dom';
import { useAppController } from '../../../controllers/useAppController';
import { countAcuteOpenTasks, countOpenTasks, getCurrentBioanalyst, getMorningRoundProgress } from '../../../models/selectors';
import { PATHS } from '../../../routes';
import { formatTime } from '../../../utils/format';
import { PageHeader } from '../../components/shared/PageHeader';
import { ScreenFrame } from '../../layouts/ScreenFrame';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StateBoundary } from '../../components/shared/StateBoundary';

export function BioDashboardScreen() {
  const controller = useAppController();
  const { state } = controller;
  const mode = state.screenModes['bio.dashboard'];
  const bio = getCurrentBioanalyst(state);
  const openCount = countOpenTasks(state);
  const acuteCount = countAcuteOpenTasks(state);
  const progress = getMorningRoundProgress(state);

  return (
    <ScreenFrame
      screenKey="bio.dashboard"
      mobile
      header={
        <PageHeader
          eyebrow="Bioanalytiker"
          title="Min vagt"
          subtitle={`Velkommen ${bio.name}. Hold fokus på morgenrunden og de akutte opgaver.`}
        />
      }
      footer={
        <div className="grid gap-3">
          <Button asChild fullWidth size="lg" iconLeft="📋">
            <Link to={PATHS.bioTasks}>Se mine opgaver</Link>
          </Button>
          <Button
            fullWidth
            size="md"
            variant="secondary"
            iconLeft="🆘"
            onClick={() => controller.requestHelp('dashboard')}
          >
            Brug for hjælp
          </Button>
        </div>
      }
    >
      <StateBoundary
        mode={mode}
        hasContent={openCount > 0}
        onRetry={() => controller.retryScreen('bio.dashboard')}
        emptyTitle="Ingen åbne opgaver lige nu"
        emptyText="Morgenrunden ser rolig ud. Du får besked når nye opgaver kommer ind."
        fallbackContent={<p className="text-sm">Statuslinjen og tidsvindue er stadig tilgængeligt.</p>}
      >
        <Card className="border-brand-200 bg-gradient-to-br from-brand-50 to-white" title="Morgenrunde 07:30-09:00" subtitle={progress.isLate ? 'Mål-tid er passeret' : 'Benchmark: færdig ca. 09:00'}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Åbne opgaver</p>
                <p className="text-2xl font-black text-slate-950">{openCount}</p>
              </div>
              <div className="rounded-xl border border-red-200 bg-white p-3">
                <p className="text-xs text-slate-500">Akutte</p>
                <p className="text-2xl font-black text-red-700">{acuteCount}</p>
              </div>
            </div>
            <ProgressBar
              value={progress.percent}
              max={100}
              tone={progress.isLate ? 'danger' : progress.percent > 85 ? 'warn' : 'brand'}
              label={`Tidsstatus · ${formatTime(state.now)} nu`}
            />
          </div>
        </Card>

        <Card title="Hurtigt overblik" subtitle="Stor knap = næste skridt. Hold tempo og enkelhed.">
          <div className="grid gap-3 text-sm">
            <div className="rounded-xl bg-slate-100 p-3">
              <p className="font-semibold text-slate-900">Team: {bio.teamId.replace('team-', 'Team ')}</p>
              <p className="text-slate-600">Én telefon pr. prøvetager. Hjælp-knappen sender signal til planlægger med tidsstempel.</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-3">
              <p className="font-semibold text-slate-900">Patienttilfredshed først</p>
              <p className="text-slate-600">Akutte opgaver og lange ventetider vises tydeligt i opgavelisten.</p>
            </div>
          </div>
        </Card>
      </StateBoundary>
    </ScreenFrame>
  );
}
