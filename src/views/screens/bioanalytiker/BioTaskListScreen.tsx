import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppController } from '../../../controllers/useAppController';
import { getAcuteTasks, getMyTasks, getTeamTasks } from '../../../models/selectors';
import type { Task } from '../../../models/types';
import { PATHS } from '../../../routes';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { ScreenFrame } from '../../layouts/ScreenFrame';
import { PageHeader } from '../../components/shared/PageHeader';
import { StateBoundary } from '../../components/shared/StateBoundary';
import { TaskCard } from '../../components/shared/TaskCard';

const filterOptions = [
  { value: 'mine', label: 'Mine' },
  { value: 'team', label: 'Team' },
  { value: 'akutte', label: 'Akutte' },
] as const;

type FilterKey = (typeof filterOptions)[number]['value'];

export function BioTaskListScreen() {
  const controller = useAppController();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterKey>('mine');
  const { state } = controller;
  const mode = state.screenModes['bio.tasks'];

  const tasks = useMemo(() => {
    switch (filter) {
      case 'mine':
        return getMyTasks(state);
      case 'team':
        return getTeamTasks(state);
      case 'akutte':
        return getAcuteTasks(state);
      default:
        return [] as Task[];
    }
  }, [filter, state]);

  const nextTask = tasks[0];

  return (
    <ScreenFrame
      screenKey="bio.tasks"
      mobile
      header={
        <div className="grid gap-3">
          <PageHeader eyebrow="Bioanalytiker" title="Opgaveliste" subtitle="Vælg visning og åbn næste opgave med ét tryk." />
          <Tabs value={filter} onChange={setFilter} options={filterOptions} fullWidth />
        </div>
      }
      footer={
        <div className="grid gap-2">
          <Button
            size="lg"
            fullWidth
            onClick={() => nextTask && navigate(PATHS.bioTaskDetail(nextTask.id))}
            disabled={!nextTask}
            iconLeft="▶"
          >
            {nextTask ? 'Åbn næste prioriterede' : 'Ingen opgaver i visningen'}
          </Button>
          <Button variant="ghost" fullWidth onClick={() => navigate(PATHS.bioDashboard)}>
            Tilbage til Min vagt
          </Button>
        </div>
      }
    >
      <StateBoundary
        mode={mode}
        hasContent={tasks.length > 0}
        onRetry={() => controller.retryScreen('bio.tasks')}
        emptyTitle="Ingen opgaver i denne visning"
        emptyText={filter === 'mine' ? 'Du har ingen aktive opgaver lige nu.' : filter === 'team' ? 'Team-køen er tom.' : 'Ingen akutte opgaver lige nu.'}
        emptyAction={
          <Button onClick={() => setFilter('team')} variant="secondary">
            Vis team-opgaver
          </Button>
        }
        fallbackContent={
          <div className="space-y-2">
            {tasks.slice(0, 2).map((task) => (
              <div key={task.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                {task.patientName} · {task.patientId}
              </div>
            ))}
          </div>
        }
      >
        <div className="grid gap-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              state={state}
              compact
              onClick={() => navigate(PATHS.bioTaskDetail(task.id))}
            />
          ))}
        </div>
      </StateBoundary>
    </ScreenFrame>
  );
}
