import { Link } from 'react-router-dom';
import { PATHS } from '../../routes';
import { ScreenFrame } from '../layouts/ScreenFrame';
import { PageHeader } from '../components/shared/PageHeader';
import { StateBoundary } from '../components/shared/StateBoundary';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAppController } from '../../controllers/useAppController';

const roleCards = [
  {
    title: 'Bioanalytiker',
    subtitle: 'Zebra/Android med store knapper og få trin',
    href: PATHS.bioDashboard,
    primary: 'Åbn bioanalytiker-flow',
    points: ['Min vagt', 'Opgaveliste', 'Opgavedetalje', 'Afmeld opgave'],
    icon: '🧪',
  },
  {
    title: 'Planlægger / Koordinator',
    subtitle: 'Desktop/tablet overblik med belastning, hjælp og tildeling',
    href: PATHS.plannerOverview,
    primary: 'Åbn planlægger-flow',
    points: ['Heatmap/overblik', 'Tildeling (drag-and-drop)', 'Kommunikation'],
    icon: '🗺️',
  },
  {
    title: 'Rekvirerende afdeling',
    subtitle: 'Hurtig bestilling og status på egne opgaver',
    href: PATHS.requesterCreate,
    primary: 'Åbn rekvirent-flow',
    points: ['Opret opgave', 'Kvittering', 'Status på egne opgaver'],
    icon: '🏥',
  },
];

export function HomeScreen() {
  const controller = useAppController();
  const mode = controller.state.screenModes.home;

  return (
    <ScreenFrame
      screenKey="home"
      header={
        <PageHeader
          eyebrow="Prototype"
          title="Prøvetagningsflow · klikbar designprototype"
          subtitle="Alt er lokalt og baseret på mock-data. Fokus er flow, mikrocopy, robusthed og tydelige tilstande."
        />
      }
    >
      <StateBoundary
        mode={mode}
        onRetry={() => controller.retryScreen('home')}
        emptyTitle="Ingen roller klar"
        emptyText="Tilføj roller for at starte demonstrationen."
        fallbackContent={<p className="text-sm text-slate-600">Forsiden kan stadig navigeres via topmenuen.</p>}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {roleCards.map((role) => (
            <Card key={role.title} title={<span className="flex items-center gap-2"><span aria-hidden>{role.icon}</span>{role.title}</span>} subtitle={role.subtitle}>
              <ul className="mb-4 space-y-2 text-sm text-slate-700">
                {role.points.map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <span aria-hidden className="text-brand-700">●</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <Button asChild fullWidth>
                <Link to={role.href}>{role.primary}</Link>
              </Button>
            </Card>
          ))}
        </div>
      </StateBoundary>
    </ScreenFrame>
  );
}
