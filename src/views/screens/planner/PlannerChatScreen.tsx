import { FormEvent, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppController } from '../../../controllers/useAppController';
import { getDepartmentById, getTaskById, getTaskMessages } from '../../../models/selectors';
import { PATHS } from '../../../routes';
import { formatTime } from '../../../utils/format';
import { PageHeader } from '../../components/shared/PageHeader';
import { StateBoundary } from '../../components/shared/StateBoundary';
import { ScreenFrame } from '../../layouts/ScreenFrame';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Fields';

const templates = ['På vej', 'Forsinket 10 min', 'Manglende info'] as const;

export function PlannerChatScreen() {
  const { taskId } = useParams<{ taskId: string }>();
  const controller = useAppController();
  const { state } = controller;
  const mode = state.screenModes['planner.chat'];
  const task = getTaskById(state, taskId);
  const department = task ? getDepartmentById(state, task.departmentId) : undefined;
  const messages = getTaskMessages(state, taskId);
  const [draft, setDraft] = useState('');

  const title = useMemo(() => (task ? `Beskeder · ${task.patientId}` : 'Beskeder'), [task]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !task) return;
    controller.sendChat(task.id, text, 'planlaegger', 'Koordinator Anne');
    setDraft('');
  };

  const sendTemplate = (text: string) => {
    if (!task) return;
    controller.sendChat(task.id, text, 'planlaegger', 'Koordinator Anne', true);
  };

  return (
    <ScreenFrame
      screenKey="planner.chat"
      header={
        <PageHeader
          eyebrow="Planlægger / Koordinator"
          title={title}
          subtitle="Enkel chat-tråd pr. opgave med korte skabeloner til hurtig koordinering."
          actions={
            <Button asChild variant="secondary">
              <Link to={PATHS.plannerAssign}>Til tildeling</Link>
            </Button>
          }
        />
      }
    >
      <StateBoundary
        mode={mode}
        hasContent={Boolean(task)}
        onRetry={() => controller.retryScreen('planner.chat')}
        emptyTitle="Vælg en opgave for at se beskeder"
        emptyText="Åbn kommunikationen fra overblik eller tildeling."
        emptyAction={
          <Button asChild>
            <Link to={PATHS.plannerAssign}>Åbn tildeling</Link>
          </Button>
        }
        fallbackContent={messages.length ? <p className="text-sm">{messages.length} senest gemte beskeder vises i fallback.</p> : undefined}
      >
        {task ? (
          <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
            <Card title="Opgave" subtitle="Brug konteksten før du sender besked.">
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Patient:</span> {task.patientName} ({task.patientId})</p>
                <p><span className="font-semibold">Afdeling:</span> {department?.name}</p>
                <p><span className="font-semibold">Lokation:</span> {task.location}</p>
                <p><span className="font-semibold">Status:</span> {task.status}</p>
                <div className="mt-3 grid gap-2">
                  {templates.map((template) => (
                    <Button key={template} variant="ghost" fullWidth onClick={() => sendTemplate(template)}>
                      Send skabelon: {template}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            <Card title="Chat-tråd" subtitle="Kort, konkret og patientnært.">
              <div className="space-y-3">
                <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {messages.length ? (
                    messages.map((message) => {
                      const own = message.senderRole === 'planlaegger';
                      return (
                        <div key={message.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${own ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-white text-slate-900'}`}>
                            <div className="mb-1 flex items-center gap-2 text-xs opacity-90">
                              <span className="font-semibold">{message.senderName}</span>
                              {message.isTemplate ? <Badge tone={own ? 'brand' : 'neutral'}>Skabelon</Badge> : null}
                              <span>{formatTime(message.createdAt)}</span>
                            </div>
                            <p>{message.text}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-600">Ingen beskeder endnu.</p>
                  )}
                </div>

                <form onSubmit={submit} className="grid gap-2">
                  <Input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Skriv kort besked til opgaven"
                    disabled={state.offline}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="submit" disabled={!draft.trim() || state.offline}>
                      Send besked
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        ) : null}
      </StateBoundary>
    </ScreenFrame>
  );
}
