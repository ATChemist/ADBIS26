import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppController } from '../../../controllers/useAppController';
import { getTaskById } from '../../../models/selectors';
import { PATHS } from '../../../routes';
import { PageHeader } from '../../components/shared/PageHeader';
import { ScreenFrame } from '../../layouts/ScreenFrame';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FieldShell, Select, Switch, TextArea } from '../../components/ui/Fields';
import { StateBoundary } from '../../components/shared/StateBoundary';

const reasonOptions = [
  { value: '', label: 'Vælg årsag' },
  { value: 'forkert-info', label: 'Manglende eller forkert info' },
  { value: 'patient-ikke-klar', label: 'Patient ikke klar' },
  { value: 'prioritet-aendret', label: 'Anden opgave er mere kritisk' },
  { value: 'kapacitet', label: 'Kan ikke nå opgaven inden for rimelig tid' },
];

export function BioCancelTaskScreen() {
  const { taskId } = useParams<{ taskId: string }>();
  const controller = useAppController();
  const navigate = useNavigate();
  const { state, isNearShiftEnd } = controller;
  const mode = state.screenModes['bio.cancel'];
  const task = getTaskById(state, taskId);

  const [reasonCode, setReasonCode] = useState('');
  const [reasonNote, setReasonNote] = useState('');
  const [contactPlanner, setContactPlanner] = useState(false);
  const [lateConfirm, setLateConfirm] = useState(false);

  const keepInTeamQueue = Boolean(task?.lockedToTeam && task.assignedTeamId);
  const canSubmit = useMemo(() => {
    if (!task) return false;
    if (!reasonCode) return false;
    if (isNearShiftEnd && !contactPlanner) return false;
    if (isNearShiftEnd && !lateConfirm) return false;
    return !state.offline;
  }, [contactPlanner, isNearShiftEnd, lateConfirm, reasonCode, state.offline, task]);

  const submit = () => {
    if (!task) return;
    controller.cancelTask({
      taskId: task.id,
      reasonCode,
      reasonNote,
      contactedPlanner: contactPlanner,
      confirmedLateCancel: lateConfirm,
    });
    navigate(PATHS.bioTasks);
  };

  return (
    <ScreenFrame
      screenKey="bio.cancel"
      mobile
      header={
        <PageHeader
          eyebrow="Bioanalytiker"
          title="Afmeld opgave"
          subtitle="Afmelding skal være fair og tydelig. Vælg årsag og se konsekvens før du fortsætter."
        />
      }
      footer={
        <div className="grid gap-2">
          <Button fullWidth size="lg" variant="danger" onClick={submit} disabled={!canSubmit}>
            {isNearShiftEnd ? 'Afmeld (kræver bekræftelse)' : 'Afmeld opgave'}
          </Button>
          <Button fullWidth variant="ghost" onClick={() => navigate(-1)}>
            Tilbage
          </Button>
        </div>
      }
    >
      <StateBoundary
        mode={mode}
        hasContent={Boolean(task)}
        onRetry={() => controller.retryScreen('bio.cancel')}
        emptyTitle="Opgaven blev ikke fundet"
        emptyText="Du kan kun afmelde en eksisterende opgave."
        emptyAction={<Button onClick={() => navigate(PATHS.bioTasks)}>Til opgaveliste</Button>}
      >
        {task ? (
          <div className="grid gap-3">
            <Card title={`${task.patientName} · ${task.patientId}`} subtitle="Afmelding frigiver opgaven til ny håndtering.">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <p className="font-semibold">Konsekvens</p>
                <p className="mt-1">
                  {keepInTeamQueue
                    ? 'Denne opgave går tilbage til team-køen (låst til team) og kan påvirke patientventetid.'
                    : 'Denne opgave går tilbage i køen og kan påvirke patientventetid.'}
                </p>
              </div>
            </Card>

            <Card title="Vælg årsag" subtitle="Korte forklaringer gør det lettere for planlægger at hjælpe hurtigt.">
              <div className="space-y-3">
                <FieldShell label="Årsag">
                  <Select value={reasonCode} onChange={(event) => setReasonCode(event.target.value)}>
                    {reasonOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FieldShell>
                <FieldShell label="Supplerende note (valgfri)" hint="Kort og konkret hjælper mest.">
                  <TextArea
                    value={reasonNote}
                    onChange={(event) => setReasonNote(event.target.value)}
                    placeholder="Fx patient er til scanning nu, tilbage om 15 min"
                  />
                </FieldShell>
              </div>
            </Card>

            {isNearShiftEnd ? (
              <Card title="Nær fyraften: ekstra bekræftelse" subtitle="For at minimere misbrug kræves en tydelig håndtering.">
                <div className="space-y-3">
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                    <p className="font-semibold">Kontakt planlægger før afmelding</p>
                    <p className="mt-1">Det hjælper med at undgå, at opgaver bliver skubbet sent og påvirker patientforløb.</p>
                  </div>
                  <Switch
                    checked={contactPlanner}
                    onChange={setContactPlanner}
                    label="Jeg har kontaktet planlægger"
                    description="Påkrævet nær fyraften"
                  />
                  <Switch
                    checked={lateConfirm}
                    onChange={setLateConfirm}
                    label="Jeg bekræfter at afmelding er nødvendig"
                    description="Påkrævet før afmelding"
                  />
                </div>
              </Card>
            ) : null}
          </div>
        ) : null}
      </StateBoundary>
    </ScreenFrame>
  );
}
